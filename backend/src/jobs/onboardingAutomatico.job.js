/**
 * Job: Onboarding Automático
 *
 * Roda diariamente às 06:00 (America/Sao_Paulo).
 * Para cada colaborador admitido hoje ou ontem,
 * cria registros ON (Onboarding) no dia da admissão
 * e no dia seguinte — sem sobrescrever registros manuais.
 */

const cron = require("node-cron");
const { gerarOnboardingAdmissao } = require("../services/onboardingAutomatico.service");

function getHoje() {
  const agora = new Date();
  const spString = agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  return new Date(spString).toISOString().slice(0, 10);
}

async function executarOnboarding() {
  const hoje = getHoje();
  console.log(`\n⏰ [JOB ONBOARDING] Executando para ${hoje}`);
  try {
    await gerarOnboardingAdmissao(hoje);
  } catch (err) {
    console.error("❌ [JOB ONBOARDING] Erro:", err.message);
  }
}

function iniciarJobOnboarding() {
  console.log("🎓 [JOB ONBOARDING] Agendando geração automática de Onboarding — 06:00, 13:00, 20:00");

  // Roda 1x ao dia às 06:00 como fallback para importações CSV
  cron.schedule("0 6 * * *", executarOnboarding, { timezone: "America/Sao_Paulo" });

  console.log("✅ [JOB ONBOARDING] Agendado: 06:00 diário (America/Sao_Paulo)");
}

module.exports = { iniciarJobOnboarding };
