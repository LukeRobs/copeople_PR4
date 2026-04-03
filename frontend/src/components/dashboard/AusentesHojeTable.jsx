import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function AusentesHojeTable({
  data = [],
  columns = [],
  title,
  emptyMessage = "Nenhum registro encontrado",
  getRowKey,
}) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const headBg    = isDark ? "#2A2A2C" : "#F3F4F6";
  const border    = isDark ? "#2A2A2C" : "#E5E7EB";
  const rowBorder = isDark ? "#3D3D40" : "#E5E7EB";
  const textMain  = isDark ? "#E5E5E5" : "#374151";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const rowHover  = isDark ? "#222222" : "#F9FAFB";

  const colSpan = columns.length;

  return (
    <div style={{ background: cardBg, borderRadius: 16, overflow: "hidden", width: "100%" }}>
      {title && (
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
            {title}
          </h2>
        </div>
      )}

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 600, fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ background: headBg }}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ padding: "12px 24px", textAlign: "left", fontWeight: 500, color: textMuted, whiteSpace: "nowrap" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!data.length ? (
              <tr style={{ borderTop: `1px solid ${rowBorder}` }}>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: textMuted }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey ? getRowKey(row) : row.id || row.opsId || rowIndex}
                  style={{ borderTop: `1px solid ${rowBorder}`, cursor: "default" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: "12px 24px", color: textMain, whiteSpace: "nowrap" }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
