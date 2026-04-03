import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function PresencaHeader({ dias = [], ano, mes }) {
  const { isDark } = useContext(ThemeContext);

  const bg       = isDark ? "#1A1A1C" : "#FFFFFF";
  const border   = isDark ? "#2A2A2C" : "#E5E7EB";
  const textNorm = isDark ? "#BFBFC3" : "#6B7280";
  const bgWeekend = isDark ? "#141416" : "#FFF7ED";

  function isWeekend(dia) {
    if (!ano || !mes) return false;
    const date = new Date(ano, mes - 1, dia);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  return (
    <thead style={{ position: "sticky", top: 0, zIndex: 30, background: bg }}>
      <tr>
        <th
          style={{
            position: "sticky",
            left: 0,
            zIndex: 40,
            background: bg,
            padding: "12px 16px",
            borderRight: `1px solid ${border}`,
            textAlign: "left",
            minWidth: 220,
            color: textNorm,
            fontSize: 12,
            fontWeight: 600,
            borderBottom: `1px solid ${border}`,
          }}
        >
          Colaborador
        </th>

        {dias.map((dia) => {
          const weekend = isWeekend(dia);
          return (
            <th
              key={`dia-${dia}`}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                borderRight: `1px solid ${border}`,
                borderBottom: `1px solid ${border}`,
                fontSize: 12,
                minWidth: 48,
                background: weekend ? bgWeekend : bg,
                color: weekend ? "#FA4C00" : textNorm,
                fontWeight: weekend ? 700 : 400,
              }}
            >
              {dia}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
