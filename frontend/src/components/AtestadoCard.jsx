import { useContext } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  FileWarning
} from "lucide-react";

import { Badge, Button } from "./UIComponents";
import { formatDateBR } from "../utils/date";
import { ThemeContext } from "../context/ThemeContext";

export default function AtestadoCard({
  atestado,
  onFinalizar,
  onCancelar,
  onDownload,
}) {
  const { isDark } = useContext(ThemeContext);

  /* ── theme tokens ── */
  const cardBg        = isDark ? "#161618" : "#FFFFFF";
  const cardBorder    = isDark ? "#2C2C2F" : "#E5E7EB";
  const avatarBg      = isDark ? "#2A2A2C" : "#F3F4F6";
  const textPrimary   = isDark ? "#FFFFFF"  : "#111827";
  const textSecondary = isDark ? "#9CA3AF"  : "#6B7280";
  const periodBg      = isDark ? "#0E0E0F"  : "#F9FAFB";
  const daysBadgeBg   = isDark ? "#1F1F22"  : "#F3F4F6";
  const obsBg         = isDark ? "#0F0F10"  : "#F9FAFB";
  const obsMuted      = isDark ? "rgba(255,255,255,0.90)" : "#374151";

  const isAtivo      = atestado.status === "ATIVO";
  const isFinalizado = atestado.status === "FINALIZADO";
  const isCancelado  = atestado.status === "CANCELADO";

  const diasLabel =
    atestado.diasAfastamento === 1
      ? "1 DIA"
      : `${atestado.diasAfastamento} DIAS`;

  const statusColor = isAtivo
    ? "border-l-yellow-500"
    : isFinalizado
    ? "border-l-green-500"
    : "border-l-red-500";

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: "16px 20px",
      }}
      className={`border-l-4 ${statusColor} space-y-5 transition-all`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        {/* BLOCO ESQUERDO */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            style={{ background: avatarBg }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
          >
            <FileText size={20} className="text-orange-400" />
          </div>

          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold truncate" style={{ color: textPrimary }}>
              {atestado.colaborador?.nomeCompleto || atestado.opsId}
            </p>

            <p className="text-xs mt-1 truncate" style={{ color: textSecondary }}>
              OPS ID: {atestado.opsId}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <Badge.Status
            variant={
              isAtivo
                ? "warning"
                : isFinalizado
                ? "success"
                : "danger"
            }
          >
            {atestado.status}
          </Badge.Status>
        </div>
      </div>

      {/* ================= PERÍODO ================= */}
      <div
        style={{
          background: periodBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          padding: "12px 16px",
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-xs sm:text-sm" style={{ color: textPrimary }}>
          <Calendar size={15} style={{ color: textSecondary }} />
          <span className="wrap-break-words">
            {formatDateBR(atestado.dataInicio)} →{" "}
            {formatDateBR(atestado.dataFim)}
          </span>
        </div>

        <div
          style={{ background: daysBadgeBg, color: textPrimary }}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide w-fit"
        >
          <Clock size={14} style={{ color: textSecondary }} />
          {diasLabel}
        </div>
      </div>

      {/* ================= CID ================= */}
      {atestado.cid && (
        <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: textPrimary }}>
          <FileWarning size={15} style={{ color: textSecondary }} />
          <span className="wrap-break-words">
            <span className="font-medium" style={{ color: textPrimary }}>CID:</span>{" "}
            {atestado.cid}
          </span>
        </div>
      )}

      {/* ================= OBSERVAÇÕES ================= */}
      {atestado.observacao && (
        <div
          style={{
            background: obsBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: textSecondary }}>
            Observações
          </p>

          <p className="text-xs sm:text-sm leading-relaxed line-clamp-4" style={{ color: obsMuted }}>
            {atestado.observacao}
          </p>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <div
        style={{ borderTop: `1px solid ${cardBorder}` }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4"
      >
        <div className="text-[11px] sm:text-xs" style={{ color: textSecondary }}>
          {isFinalizado && "Atestado Finalizado"}
          {isCancelado  && "Atestado cancelado"}
          {isAtivo      && "Atestado Ativo"}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onDownload && (
            <Button.IconButton
              onClick={() => onDownload(atestado.idAtestado)}
              title="Download do PDF"
            >
              <Download size={16} />
            </Button.IconButton>
          )}

          {isAtivo && (
            <>
              <Button.IconButton
                variant="success"
                onClick={() => onFinalizar(atestado.idAtestado)}
                title="Finalizar atestado"
              >
                <CheckCircle size={16} />
              </Button.IconButton>

              <Button.IconButton
                variant="danger"
                onClick={() => onCancelar(atestado.idAtestado)}
                title="Cancelar atestado"
              >
                <XCircle size={16} />
              </Button.IconButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
