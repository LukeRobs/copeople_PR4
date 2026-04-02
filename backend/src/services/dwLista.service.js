const { prisma } = require("../config/database");

/* ==========================
   EMPRESAS FIXAS DO DW
========================== */
const EMPRESAS_FIXAS = {
  12: "SRM",
  13: "Fenix",
  14: "Horeca",
};

const IDS_EMPRESAS_FIXAS = Object.keys(EMPRESAS_FIXAS).map(Number);

const buscarDwLista = async ({ data, idTurno, idEmpresa }) => {
  const whereBase = {
    idEmpresa: { in: IDS_EMPRESAS_FIXAS },
  };

  if (data) whereBase.data = new Date(data);
  if (idTurno) whereBase.idTurno = Number(idTurno);
  if (idEmpresa && IDS_EMPRESAS_FIXAS.includes(Number(idEmpresa))) {
    whereBase.idEmpresa = Number(idEmpresa);
  }

  /* ==========================
     1️⃣ BUSCAR DW REAL E PLANEJADO
  ========================== */
  const [dwReais, dwPlanejados] = await Promise.all([
    prisma.dwReal.findMany({
      where: whereBase,
      orderBy: [{ data: "desc" }, { idTurno: "asc" }],
    }),
    prisma.dwPlanejado.findMany({
      where: whereBase,
      orderBy: [{ data: "desc" }, { idTurno: "asc" }],
    }),
  ]);

  /* ==========================
     2️⃣ AGRUPAR POR DATA + TURNO
  ========================== */
  const agrupado = {};
  const turnoMap = { 1: "T1", 2: "T2", 3: "T3" };

  // Inicializa grupos a partir do Real
  for (const r of dwReais) {
    const dataISO = r.data.toISOString().slice(0, 10);
    const chave = `${dataISO}_${r.idTurno}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        data: dataISO,
        turno: turnoMap[r.idTurno],
        planejado: 0,
        empresas: { SRM: 0, Fenix: 0, Horeca: 0 },
        totalReal: 0,
      };
    }

    const nomeEmpresa = EMPRESAS_FIXAS[r.idEmpresa];
    if (!nomeEmpresa) continue;

    agrupado[chave].empresas[nomeEmpresa] += r.quantidade;
    agrupado[chave].totalReal += r.quantidade;
  }

  // Soma o planejado por empresa no grupo correspondente
  for (const p of dwPlanejados) {
    const dataISO = p.data.toISOString().slice(0, 10);
    const chave = `${dataISO}_${p.idTurno}`;

    // cria grupo mesmo se não houver real ainda
    if (!agrupado[chave]) {
      agrupado[chave] = {
        data: dataISO,
        turno: turnoMap[p.idTurno],
        planejado: 0,
        empresas: { SRM: 0, Fenix: 0, Horeca: 0 },
        totalReal: 0,
      };
    }

    agrupado[chave].planejado += p.quantidade;
  }

  return Object.values(agrupado).sort(
    (a, b) => new Date(b.data) - new Date(a.data) || a.turno.localeCompare(b.turno)
  );
};

module.exports = { buscarDwLista };
