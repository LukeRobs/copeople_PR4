import { useContext } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList } from "recharts";
import { ThemeContext } from "../../context/ThemeContext";

const COLORS = ["#FA4C00","#E84400","#D03C00","#B83400","#A02C00","#8C2500","#781E00","#641700","#501000","#3C0A00"];

export default function FaltasPorTempoCasaChart({ data = [], title }) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const border    = isDark ? "#2A2A2C" : "#E5E7EB";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const gridColor = isDark ? "#2A2A2C" : "#E5E7EB";
  const ttBg      = isDark ? "#121214" : "#FFFFFF";
  const ttBorder  = isDark ? "#2A2A2C" : "#E5E7EB";
  const labelFill = isDark ? "#FFFFFF" : "#111827";
  const tickColor = isDark ? "#8E8E93" : "#9CA3AF";

  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ backgroundColor: ttBg, border: `1px solid ${ttBorder}`, borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: isDark ? "#FFFFFF" : "#111827", fontWeight: 600, marginBottom: 4, margin: "0 0 4px 0" }}>{label}</p>
        <p style={{ color: textMuted, fontSize: 12, margin: "0 0 2px 0" }}>Faltas: <span style={{ color: "#FA4C00" }}>{d.faltas}</span></p>
        <p style={{ color: textMuted, fontSize: 12, margin: "0 0 2px 0" }}>Escalados: {d.escalados}</p>
        <p style={{ color: textMuted, fontSize: 12, margin: 0 }}>Taxa: <span style={{ color: "#FFD60A" }}>{d.percentual}%</span></p>
      </div>
    );
  };

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {title && (
        <h2 style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
          {title}
        </h2>
      )}

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 8 }} barCategoryGap="30%">
            <CartesianGrid stroke={gridColor} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="faixa" stroke={tickColor} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis stroke={tickColor} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "#2A2A2C55" : "#F3F4F6" }} />
            <Bar dataKey="faltas" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              <LabelList dataKey="faltas" position="top" style={{ fill: labelFill, fontSize: 11, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
