import { useContext } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ThemeContext } from "../../context/ThemeContext";

export default function DistribuicaoGeneroChart({
  data = [],
  title = "Distribuição",
  colors = ["#FA4C00", "#0A84FF", "#34C759", "#FFD60A"],
  showPercentLabel = true,
}) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const textMain  = isDark ? "#FFFFFF" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const ttBg      = isDark ? "#232323" : "#FFFFFF";
  const ttBorder  = isDark ? "#3D3D40" : "#E5E7EB";

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const renderPercentLabel = ({ value, percent }) =>
    showPercentLabel && value ? `${value} (${Math.round(percent * 100)}%)` : "";

  return (
    <div style={{ background: cardBg, borderRadius: 16, padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {title && (
        <h2 style={{ fontSize: 11, fontWeight: 600, color: textMain, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
          {title}
        </h2>
      )}

      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="75%" paddingAngle={2}
              label={renderPercentLabel} labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return [`${value} (${percent}%)`, name];
              }}
              contentStyle={{ backgroundColor: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: isDark ? "#FFFFFF" : "#000000" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
        {data.map((d, i) => {
          const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, backgroundColor: colors[i % colors.length] }} />
              <span style={{ color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.name} — {d.value} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
