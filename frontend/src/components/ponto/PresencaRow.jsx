import React, { useContext } from "react";
import PresencaCell from "./PresencaCell";
import { ThemeContext } from "../../context/ThemeContext";

function PresencaRow({
  colaborador,
  dias,
  canEdit,
  isAdmin = false,
  onEditCell,
}) {
  const { isDark } = useContext(ThemeContext);
  const { ano, mes } = colaborador;

  const bg     = isDark ? "#1A1A1C" : "#FFFFFF";
  const border = isDark ? "#2A2A2C" : "#E5E7EB";
  const textMain  = isDark ? "#F0F0F0" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const rowHover  = isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB";

  return (
    <tr
      style={{ borderTop: `1px solid ${border}` }}
      onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* COLABORADOR — sticky col */}
      <td
        data-no-drag="true"
        style={{
          position: "sticky",
          left: 0,
          zIndex: 10,
          background: bg,
          padding: "12px 16px",
          borderRight: `1px solid ${border}`,
          whiteSpace: "nowrap",
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 500, color: textMain, fontSize: 13 }}>
          {colaborador.nome || colaborador.nomeCompleto}
        </div>
        <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
          {colaborador.turno} • {colaborador.escala}
        </div>
      </td>

      {/* DIAS */}
      {dias.map((diaNumero) => {
        const dataISO = `${ano}-${String(mes).padStart(2, "0")}-${String(diaNumero).padStart(2, "0")}`;
        const registro = colaborador.dias?.[dataISO] || null;

        return (
          <PresencaCell
            key={`${colaborador.opsId}-${dataISO}`}
            dia={{ date: dataISO, label: String(diaNumero) }}
            registro={registro}
            colaborador={colaborador}
            canEdit={canEdit}
            isAdmin={isAdmin}
            onEdit={onEditCell}
          />
        );
      })}
    </tr>
  );
}

export default React.memo(PresencaRow);
