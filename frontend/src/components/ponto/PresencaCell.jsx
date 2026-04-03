import { useMemo, useState, useRef, useContext } from "react";
import clsx from "clsx";
import PresencaTooltip from "./PresencaTooltip";
import { ThemeContext } from "../../context/ThemeContext";

/* ================= STATUS CONFIG ================= */
// dark: Tailwind opacity classes (existing behavior)
// light: inline style objects for vivid colors
const STATUS_DARK = {
  "-":  { label: "Sem registro", short: "-",   bg: "bg-transparent",    text: "text-zinc-500" },
  P:    { label: "Presente",     short: "P",   bg: "bg-emerald-600/20", text: "text-emerald-400" },
  F:    { label: "Falta",        short: "F",   bg: "bg-red-600/20",     text: "text-red-400" },
  FJ:   { label: "Falta Justificada", short: "FJ", bg: "bg-red-600/20", text: "text-red-400" },
  DF:   { label: "Desligamento Forçado",   short: "DF",  bg: "bg-red-800/20",     text: "text-red-500" },
  DV:   { label: "Desligamento Voluntário",short: "DV",  bg: "bg-red-800/20",     text: "text-red-500" },
  DP:   { label: "Desligamento Planejado", short: "DP",  bg: "bg-red-800/20",     text: "text-red-500" },
  NC:   { label: "Não Contratado",short: "NC", bg: "bg-zinc-700/20",    text: "text-zinc-400" },
  DSR:  { label: "DSR",          short: "DSR", bg: "bg-zinc-600/20",    text: "text-zinc-400" },
  AM:   { label: "Atestado Médico",     short: "AM",  bg: "bg-blue-600/20",    text: "text-blue-400" },
  AA:   { label: "Atest. Acompanh.",    short: "AA",  bg: "bg-cyan-600/20",    text: "text-cyan-400" },
  FE:   { label: "Férias",       short: "FE",  bg: "bg-purple-600/20",  text: "text-purple-400" },
  LM:   { label: "Lic. Maternidade",    short: "LM",  bg: "bg-pink-600/20",    text: "text-pink-400" },
  LP:   { label: "Lic. Paternidade",    short: "LP",  bg: "bg-indigo-600/20",  text: "text-indigo-400" },
  AFA:  { label: "Afastado",     short: "AFA", bg: "bg-orange-600/20",  text: "text-orange-400" },
  BH:   { label: "Banco de Horas",      short: "BH",  bg: "bg-yellow-600/20",  text: "text-yellow-400" },
  FO:   { label: "Folga",        short: "FO",  bg: "bg-slate-600/20",   text: "text-slate-400" },
  TR:   { label: "Transferido",  short: "TR",  bg: "bg-neutral-600/20", text: "text-neutral-400" },
  S1:   { label: "Sinergia",     short: "S1",  bg: "bg-pink-600/40",    text: "text-red-400" },
  ON:   { label: "Onboarding",   short: "ON",  bg: "bg-orange-600/20",  text: "text-orange-400" },
};

// Light mode: solid pastel backgrounds + dark readable text
const STATUS_LIGHT = {
  "-":  { label: "Sem registro", short: "-",   bg: "#F3F4F6", text: "#9CA3AF" },
  P:    { label: "Presente",     short: "P",   bg: "#D1FAE5", text: "#065F46" },
  F:    { label: "Falta",        short: "F",   bg: "#FEE2E2", text: "#991B1B" },
  FJ:   { label: "Falta Justificada", short: "FJ", bg: "#FEE2E2", text: "#991B1B" },
  DF:   { label: "Desligamento Forçado",   short: "DF",  bg: "#FECACA", text: "#7F1D1D" },
  DV:   { label: "Desligamento Voluntário",short: "DV",  bg: "#FECACA", text: "#7F1D1D" },
  DP:   { label: "Desligamento Planejado", short: "DP",  bg: "#FECACA", text: "#7F1D1D" },
  NC:   { label: "Não Contratado",short: "NC", bg: "#F3F4F6", text: "#9CA3AF" },
  DSR:  { label: "DSR",          short: "DSR", bg: "#E5E7EB", text: "#6B7280" },
  AM:   { label: "Atestado Médico",     short: "AM",  bg: "#DBEAFE", text: "#1E40AF" },
  AA:   { label: "Atest. Acompanh.",    short: "AA",  bg: "#CFFAFE", text: "#155E75" },
  FE:   { label: "Férias",       short: "FE",  bg: "#EDE9FE", text: "#5B21B6" },
  LM:   { label: "Lic. Maternidade",    short: "LM",  bg: "#FCE7F3", text: "#9D174D" },
  LP:   { label: "Lic. Paternidade",    short: "LP",  bg: "#E0E7FF", text: "#3730A3" },
  AFA:  { label: "Afastado",     short: "AFA", bg: "#FFEDD5", text: "#9A3412" },
  BH:   { label: "Banco de Horas",      short: "BH",  bg: "#FEF3C7", text: "#92400E" },
  FO:   { label: "Folga",        short: "FO",  bg: "#F1F5F9", text: "#475569" },
  TR:   { label: "Transferido",  short: "TR",  bg: "#F5F5F4", text: "#57534E" },
  S1:   { label: "Sinergia",     short: "S1",  bg: "#FCE7F3", text: "#BE185D" },
  ON:   { label: "Onboarding",   short: "ON",  bg: "#FFF7ED", text: "#C2410C" },
};

/* ================= JUSTIFICATIVAS ================= */
const JUSTIFICATIVA_LABEL = {
  ESQUECIMENTO_MARCACAO: "Esquecimento da marcação",
  ALTERACAO_PONTO:       "Alteração de ponto",
  MARCACAO_INDEVIDA:     "Marcação indevida",
  ATESTADO_MEDICO:       "Atestado médico",
  SINERGIA_ENVIADA:      "Sinergia enviada",
  HORA_EXTRA:            "Hora extra",
  LICENCA:               "Licença",
  FALTA_INJUSTIFICADA:   "Falta injustificada",
  ON:                    "Onboarding",
};

function fmtHora(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return null;
  }
}

function isWeekend(dateISO) {
  if (!dateISO) return false;
  const d = new Date(`${dateISO}T00:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

const DSR_BY_ESCALA = {
  E: [0, 1],
  G: [2, 3],
  C: [4, 5],
};

function isDSR(dateISO, escala) {
  if (!dateISO || !escala) return false;
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay();
  return DSR_BY_ESCALA[escala]?.includes(day);
}

/* ================= COMPONENT ================= */
export default function PresencaCell({
  dia,
  registro,
  colaborador,
  onEdit,
  canEdit = false,
  isAdmin = false,
}) {
  const { isDark } = useContext(ThemeContext);
  const [hover, setHover] = useState(false);
  const [above, setAbove] = useState(false);
  const cellRef = useRef(null);
  const weekend = isWeekend(dia?.date);

  /* ================= STATUS ================= */
  const status = useMemo(() => {
    if (registro?.status && registro.status !== "-") return registro.status;
    if (isDSR(dia?.date, colaborador?.escala)) return "DSR";
    return "-";
  }, [registro, dia?.date, colaborador?.escala]);

  const isPreAdmissao = status === "NC" && !registro?.manual;
  const disabled = (status === "DSR" && !canEdit) || isPreAdmissao;

  /* ================= PENDÊNCIA DE SAÍDA ================= */
  const semSaida =
    status === "P" &&
    (registro?.entrada || registro?.horaEntrada) &&
    !registro?.saida &&
    !registro?.horaSaida;

  function handleClick() {
    if (!canEdit || isPreAdmissao) return;
    onEdit?.({ colaborador, dia, registro });
  }

  const horaEntrada = fmtHora(registro?.entrada || registro?.horaEntrada);
  const horaSaida   = fmtHora(registro?.saida   || registro?.horaSaida);
  const showTooltip = hover && !isPreAdmissao && (canEdit || registro?.status);

  /* ================= RENDER ================= */
  if (isDark) {
    // Dark mode: usa Tailwind classes (comportamento original)
    const cfg = STATUS_DARK[status] || STATUS_DARK["-"];
    return (
      <td ref={cellRef} className="border-r border-[#2A2A2C] min-w-12 sm:min-w-14">
        <div
          className={clsx(
            "relative px-2 py-2 text-center cursor-pointer select-none transition",
            cfg.bg, cfg.text,
            weekend && status === "-" && "bg-[#141416]",
            disabled && "opacity-40 cursor-not-allowed",
            canEdit && "hover:ring-1 hover:ring-[#FA4C00]"
          )}
          onClick={handleClick}
          onMouseEnter={() => {
            if (cellRef.current) {
              const rect = cellRef.current.getBoundingClientRect();
              setAbove(rect.bottom + 220 > window.innerHeight);
            }
            setHover(true);
          }}
          onMouseLeave={() => setHover(false)}
        >
          <span className="text-xs font-semibold whitespace-nowrap">{cfg.short}</span>
          {semSaida && <span className="absolute top-0 right-0 text-[12px] leading-none text-red-900">⚠</span>}
          {isAdmin && registro?.manual && <span className="absolute top-0 left-0 text-[10px] leading-none">⏳</span>}
          <PresencaTooltip open={showTooltip} above={above}>
            <TooltipContent cfg={cfg} dia={dia} colaborador={colaborador} horaEntrada={horaEntrada} horaSaida={horaSaida} semSaida={semSaida} isAdmin={isAdmin} registro={registro} canEdit={canEdit} />
          </PresencaTooltip>
        </div>
      </td>
    );
  }

  // Light mode: usa inline styles com cores sólidas e vibrantes
  const cfg = STATUS_LIGHT[status] || STATUS_LIGHT["-"];
  const cellBg = weekend && status === "-" ? "#E5E7EB" : cfg.bg;

  return (
    <td ref={cellRef} style={{ borderRight: "1px solid #E5E7EB", minWidth: 48 }}>
      <div
        style={{
          position: "relative",
          padding: "8px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : canEdit ? "pointer" : "default",
          backgroundColor: cellBg,
          color: cfg.text,
          opacity: disabled ? 0.45 : 1,
          transition: "background 0.15s",
          userSelect: "none",
          outline: canEdit && hover ? "1.5px solid #FA4C00" : "none",
          outlineOffset: "-1px",
        }}
        onClick={handleClick}
        onMouseEnter={() => {
          if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            setAbove(rect.bottom + 220 > window.innerHeight);
          }
          setHover(true);
        }}
        onMouseLeave={() => setHover(false)}
      >
        <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{cfg.short}</span>
        {semSaida && <span style={{ position: "absolute", top: 0, right: 0, fontSize: 12, lineHeight: 1, color: "#DC2626" }}>⚠</span>}
        {isAdmin && registro?.manual && <span style={{ position: "absolute", top: 0, left: 0, fontSize: 10, lineHeight: 1 }}>⏳</span>}
        <PresencaTooltip open={showTooltip} above={above}>
          <TooltipContent cfg={{ label: STATUS_DARK[status]?.label || cfg.label, short: cfg.short }} dia={dia} colaborador={colaborador} horaEntrada={horaEntrada} horaSaida={horaSaida} semSaida={semSaida} isAdmin={isAdmin} registro={registro} canEdit={canEdit} />
        </PresencaTooltip>
      </div>
    </td>
  );
}

/* ================= TOOLTIP CONTENT (shared) ================= */
function TooltipContent({ cfg, dia, colaborador, horaEntrada, horaSaida, semSaida, isAdmin, registro, canEdit }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{cfg.label}</span>
        <span className="text-[#BFBFC3]">{dia?.label || dia?.date || ""}</span>
      </div>
      <div className="h-px bg-[#2A2A2C]" />
      <div className="space-y-1 text-[#BFBFC3]">
        <div><span className="text-[#EDEDED]">Colab:</span> {colaborador?.nome || "-"}</div>
        {(horaEntrada || horaSaida) && (
          <div>
            <span className="text-[#EDEDED]">Ponto:</span>{" "}
            {horaEntrada ? `Entrada ${horaEntrada}` : ""}
            {horaEntrada && horaSaida ? " • " : ""}
            {horaSaida ? `Saída ${horaSaida}` : ""}
          </div>
        )}
        {semSaida && <div className="text-amber-400 text-[11px] font-medium">⚠ Saída não registrada</div>}
        {isAdmin && registro?.manual && (
          <div className="text-orange-400 text-[11px] font-medium">
            ⏳ Ajuste manual
            {registro?.registradoPor && <span className="text-[#BFBFC3] font-normal"> · por {registro.registradoPor}</span>}
            {registro?.justificativa && (
              <div className="text-[#BFBFC3] font-normal mt-0.5">
                Motivo: {JUSTIFICATIVA_LABEL[registro.justificativa] || registro.justificativa}
              </div>
            )}
          </div>
        )}
        {registro?.registradoPor && !registro?.manual && (
          <div><span className="text-[#EDEDED]">Registrado por:</span> {registro.registradoPor}</div>
        )}
        {canEdit && <div className="pt-2 text-[11px] text-[#FA4C00]">Clique para ajustar</div>}
      </div>
    </div>
  );
}
