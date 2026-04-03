import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function InputsManuaisTable({ data = {} }) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const border    = isDark ? "#2A2A2C" : "#E5E7EB";
  const headBg    = isDark ? "#111111" : "#F3F4F6";
  const rowHover  = isDark ? "#111111" : "#F9FAFB";
  const textMain  = isDark ? "#E5E5E5" : "#374151";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const badgeBg   = isDark ? "#2A2A2C" : "#F3F4F6";

  const { total = 0, porColaborador = [], porJustificativa = [] } = data;

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#FFFFFF" : "#111827", margin: 0 }}>
          Inputs Manuais — Controle de Absenteísmo
        </h3>
        <span style={{ fontSize: 11, color: textMuted, background: badgeBg, padding: "4px 12px", borderRadius: 999 }}>
          {total} total
        </span>
      </div>

      {total === 0 ? (
        <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>Nenhum input manual no período</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>

          {/* MOTIVOS */}
          <div>
            <p style={{ fontSize: 11, color: textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Principais motivos</p>
            <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: headBg }}>
                  <tr>
                    {["Motivo","Qtd","%"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {porJustificativa.map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 16px", fontSize: 13, color: textMain }}>{row.motivo}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: textMain }}>{row.quantidade}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: "#FA4C00" }}>{row.percentual}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OPERADORES */}
          <div>
            <p style={{ fontSize: 11, color: textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Quem mais fez inputs</p>
            <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: headBg }}>
                  <tr>
                    {["Lider","Qtd","%"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {porColaborador.map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 16px", fontSize: 13, color: textMain }}>{row.operador}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: textMain }}>{row.quantidade}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, textAlign: "right", color: "#FA4C00" }}>{row.percentual}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
