import { useContext } from "react";
import { TrendingUp } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ResumoOperacaoCard({ title, data = [], labelKey }) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const border    = isDark ? "#2A2A2C" : "#E5E7EB";
  const iconBg    = isDark ? "#2A2A2C" : "#F3F4F6";
  const textMain  = isDark ? "#E5E5E5" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 20, minHeight: 220, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textMain, margin: 0 }}>{title}</h3>
        <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: iconBg }}>
          <TrendingUp size={16} color="#FA4C00" />
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ fontSize: 13, color: textMuted }}>Nenhum dado no período</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((item, idx) => {
            const total = item.totalColaboradores || item.total || 0;
            const abs   = Number(item.absenteismo ?? 0);
            const color = abs > 10 ? "#FF453A" : abs > 5 ? "#FF9F0A" : "#34C759";

            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontSize: 13 }}>
                <div style={{ color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                  {item[labelKey]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 110, justifyContent: "flex-end" }}>
                  <span style={{ color: textMuted }}>{total}</span>
                  <span style={{ fontWeight: 600, color }}>{abs.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
