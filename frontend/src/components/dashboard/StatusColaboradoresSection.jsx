import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function StatusColaboradoresSection({
  title = "Status dos Colaboradores",
  items = [],
  footer = "",
}) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const rowBg     = isDark ? "#121214" : "#F9FAFB";
  const border    = isDark ? "#2A2A2C" : "#E5E7EB";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";

  if (!items || items.length === 0) return null;

  const total = items.reduce((acc, cur) => acc + (cur.value ?? cur.quantidade ?? 0), 0);

  const getColor = (label) => {
    const l = String(label).toUpperCase();
    if (l.includes("ATIVO"))  return "#34C759";
    if (l.includes("FÉR"))    return "#0A84FF";
    if (l.includes("AFAST"))  return "#AF52DE";
    if (l.includes("INSS"))   return "#FF6B00";
    if (l.includes("INAT"))   return "#8E8E93";
    return "#FA4C00";
  };

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {title && (
        <h2 style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
          {title}
        </h2>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => {
          const label = item.label ?? item.status ?? "-";
          const value = item.value ?? item.quantidade ?? 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = getColor(label);
          const circumference = 2 * Math.PI * 18;
          const offset = circumference - (percentage / 100) * circumference;

          return (
            <div key={`${label}-${i}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: rowBg, border: `1px solid ${border}`, borderRadius: 12, padding: "16px 24px" }}
            >
              <div style={{ fontSize: 13, color: textMuted, width: 160 }}>{label}</div>

              <div style={{ fontSize: 30, fontWeight: 600, color, flex: 1, textAlign: "center" }}>
                {value}
              </div>

              <div style={{ position: "relative", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="44" height="44">
                  <circle cx="22" cy="22" r="18" stroke={isDark ? "#2A2A2C" : "#E5E7EB"} strokeWidth="4" fill="none" />
                  {percentage > 0 && (
                    <circle cx="22" cy="22" r="18" stroke={color} strokeWidth="4" fill="none"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round" transform="rotate(-90 22 22)"
                    />
                  )}
                </svg>
                <div style={{ position: "absolute", fontSize: 11, color: textMuted, fontWeight: 500 }}>
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {footer && (
        <div style={{ paddingTop: 16, borderTop: `1px solid ${border}`, fontSize: 13, color: textMuted }}>
          {footer}
        </div>
      )}
    </div>
  );
}
