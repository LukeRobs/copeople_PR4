import { useContext } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ThemeContext } from "../../context/ThemeContext";

const COLORS = ["#FA4C00", "#0A84FF"];

export default function DistribuicaoColaboradoresCadastradosChart({
  title = "Colaboradores Ativos",
  data = [],
}) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const textMain  = isDark ? "#FFFFFF" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const ttBg      = isDark ? "#232323" : "#FFFFFF";
  const ttBorder  = isDark ? "#2A2A2C" : "#E5E7EB";

  const dataAtivos = data.filter((d) => d.status === "ATIVO" || d.status === undefined);
  const totalAtivos = dataAtivos.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ value, percent }) => {
    if (!value || !percent) return "";
    return `${value} (${Math.round(percent * 100)}%)`;
  };

  return (
    <div style={{ background: cardBg, borderRadius: 16, padding: 20, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
        {title}
      </h3>

      <div style={{ height: 280, position: "relative" }}>
        {/* TOTAL CENTRAL */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: textMain, lineHeight: 1 }}>{totalAtivos}</span>
          <span style={{ fontSize: 10, color: textMuted, letterSpacing: "0.12em", marginTop: 4 }}>ATIVOS</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dataAtivos} dataKey="value" nameKey="name"
              innerRadius="60%" outerRadius="85%" paddingAngle={3}
              label={renderLabel} labelLine={false}>
              {dataAtivos.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v, _, props) => {
                const pct = totalAtivos ? Math.round((v / totalAtivos) * 100) : 0;
                return [`${v} (${pct}%)`, props.payload.name];
              }}
              contentStyle={{ backgroundColor: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 8, color: textMain }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
        {dataAtivos.map((d, i) => {
          const pct = totalAtivos ? Math.round((d.value / totalAtivos) * 100) : 0;
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, backgroundColor: COLORS[i % COLORS.length] }} />
              <span style={{ color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.name} — {d.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
