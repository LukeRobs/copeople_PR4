/**
 * Service: Onboarding Automático
 *
 * Ao rodar para uma data de referência, busca colaboradores cuja
 * dataAdmissao cai nessa data ou no dia anterior e cria registros
 * de frequência com código "ON" (Onboarding) no dia da admissão
 * e no dia seguinte — se ainda não existirem.
 *
 * Idempotente: upsert com update vazio não sobrescreve registros manuais.
 */

const { prisma } = require("../config/database");

function ymd(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function startOfDayUTC(dateObj) {
  const d = new Date(dateObj);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function gerarOnboardingAdmissao(dataReferencia) {
  const dataAlvo = startOfDayUTC(new Date(dataReferencia));

  const ontem = new Date(dataAlvo);
  ontem.setUTCDate(ontem.getUTCDate() - 1);

  console.log(`\n🎓 [ONBOARDING] Verificando admissões em ${ymd(ontem)} e ${ymd(dataAlvo)}`);

  /* ─────────────────────────────────────────
     1. TIPO "ON"
  ───────────────────────────────────────── */
  const tipoON = await prisma.tipoAusencia.findUnique({ where: { codigo: "ON" } });

  if (!tipoON) {
    console.error("❌ [ONBOARDING] Tipo de ausência 'ON' não encontrado no banco");
    return { sucesso: false, erro: "Tipo ON não encontrado" };
  }

  /* ─────────────────────────────────────────
     2. COLABORADORES ADMITIDOS NO INTERVALO
     (hoje ou ontem para cobrir edge cases de fuso)
  ───────────────────────────────────────── */
  const proximo = new Date(dataAlvo);
  proximo.setUTCDate(proximo.getUTCDate() + 1);

  const colaboradores = await prisma.colaborador.findMany({
    where: {
      status: "ATIVO",
      dataAdmissao: { gte: ontem, lte: proximo },
    },
    select: { opsId: true, nomeCompleto: true, dataAdmissao: true },
  });

  console.log(`[ONBOARDING] ${colaboradores.length} colaborador(es) encontrado(s)`);

  let criados = 0;
  let jaExistiam = 0;
  let erros = 0;

  for (const c of colaboradores) {
    const diaAdmissao = startOfDayUTC(c.dataAdmissao);
    const diaOnboarding2 = new Date(diaAdmissao);
    diaOnboarding2.setUTCDate(diaOnboarding2.getUTCDate() + 1);

    for (const dia of [diaAdmissao, diaOnboarding2]) {
      try {
        const existente = await prisma.frequencia.findUnique({
          where: {
            opsId_dataReferencia: { opsId: c.opsId, dataReferencia: dia },
          },
        });

        if (existente) {
          jaExistiam++;
          continue;
        }

        await prisma.frequencia.create({
          data: {
            opsId: c.opsId,
            dataReferencia: dia,
            idTipoAusencia: tipoON.idTipoAusencia,
            manual: false,
            registradoPor: "SISTEMA_AUTO",
          },
        });

        criados++;
        console.log(`  ✅ ON criado: ${c.nomeCompleto} (${c.opsId}) — ${ymd(dia)}`);

      } catch (e) {
        erros++;
        console.error(`  ⚠️ [ONBOARDING] Erro para ${c.opsId} em ${ymd(dia)}:`, e.message);
      }
    }
  }

  const resumo = {
    sucesso: true,
    dataReferencia: ymd(dataAlvo),
    colaboradoresProcessados: colaboradores.length,
    onboardingsCriados: criados,
    jaExistiam,
    erros,
  };

  console.log(`✅ [ONBOARDING] Concluído:`, resumo);
  return resumo;
}

/**
 * Gera ON para um colaborador específico — chamado no momento do cadastro.
 * @param {string} opsId
 * @param {Date|string} dataAdmissao
 */
async function gerarOnboardingParaColaborador(opsId, dataAdmissao) {
  const tipoON = await prisma.tipoAusencia.findUnique({ where: { codigo: "ON" } });
  if (!tipoON) {
    console.error("❌ [ONBOARDING] Tipo 'ON' não encontrado");
    return;
  }

  const diaAdmissao = startOfDayUTC(new Date(dataAdmissao));
  const diaOnboarding2 = new Date(diaAdmissao);
  diaOnboarding2.setUTCDate(diaOnboarding2.getUTCDate() + 1);

  for (const dia of [diaAdmissao, diaOnboarding2]) {
    try {
      const existe = await prisma.frequencia.findUnique({
        where: { opsId_dataReferencia: { opsId, dataReferencia: dia } },
      });
      if (existe) continue;

      await prisma.frequencia.create({
        data: {
          opsId,
          dataReferencia: dia,
          idTipoAusencia: tipoON.idTipoAusencia,
          manual: false,
          registradoPor: "SISTEMA_AUTO",
        },
      });
      console.log(`  ✅ ON criado para ${opsId} — ${ymd(dia)}`);
    } catch (e) {
      console.error(`  ⚠️ [ONBOARDING] Erro para ${opsId} em ${ymd(dia)}:`, e.message);
    }
  }
}

module.exports = { gerarOnboardingAdmissao, gerarOnboardingParaColaborador };
