import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function KpiCard({
  icon: Icon,
  label,
  value,
  color,          // cor específica (vermelho, verde…) — undefined = neutro
  bgColor,        // cor do fundo do ícone — undefined = auto
  suffix,
  tooltip,
}) {
  const { isDark } = useContext(ThemeContext);

  // Cores neutras (sem cor específica passada)
  const textMain  = isDark ? "#FFFFFF" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const cardBorder= isDark ? "#2A2A2C" : "#E5E7EB";
  const iconBg    = bgColor ?? (isDark ? "#2A2A2C" : "#F3F4F6");

  // Cor do valor: se veio uma cor específica (ex: "#d6000e") usa ela,
  // caso contrário usa o textMain do tema
  const valueColor = color ?? textMain;
  const iconColor  = color ?? textMain;

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        minHeight: 90,
        transition: "border-color 0.2s",
      }}
    >
      {/* ICON */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backgroundColor: iconBg,
          color: iconColor,
        }}
        title={tooltip}
      >
        {Icon && <Icon size={20} />}
      </div>

      {/* CONTENT */}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, color: textMuted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </p>
        <p style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2, color: valueColor, margin: 0 }}>
          {value}
          {suffix && (
            <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 4 }}>
              {suffix}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
