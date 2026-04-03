import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const Metric = ({ label, value = 0, color, isDark }) => {
  const textMain = isDark ? "#FFFFFF" : "#111827";
  return (
    <div className="min-w-0">
      <span style={{ color: isDark ? "#BFBFC3" : "#6B7280", fontSize: 12, display: "block", marginBottom: 2 }}>
        {label}
      </span>
      <p style={{ fontSize: 17, fontWeight: 600, color: color || textMain, margin: 0 }}>
        {value ?? 0}
      </p>
    </div>
  );
};

export default function EmpresasResumoSection({ empresas = [] }) {
  const { isDark } = useContext(ThemeContext);

  const cardBg    = isDark ? "#1A1A1C" : "#FFFFFF";
  const cardBorder= isDark ? "#2A2A2C" : "#E5E7EB";
  const textMain  = isDark ? "#FFFFFF" : "#111827";
  const textMuted = isDark ? "#BFBFC3" : "#6B7280";
  const sectionBg = isDark ? "#111111" : "#F9FAFB";

  if (!empresas.length) return null;

  const analiseGeral = empresas.filter((e) =>
    ["SPX", "TOTAL BPO"].includes(String(e.empresa).toUpperCase())
  );
  const analiseBPO = empresas.filter((e) =>
    ["ADECCO", "ADILIS", "LUANDRE"].includes(String(e.empresa).toUpperCase())
  );

  const EmpresaCard = (e) => {
    const turnover    = Number(e.turnover    ?? 0);
    const absenteismo = Number(e.absenteismo ?? 0);

    return (
      <div key={e.empresa || "sem-empresa"}
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}
      >
        <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0, color: e.empresa?.toUpperCase() === "SPX" ? "#FA4C00" : textMain }}>
          {e.empresa || "Sem empresa"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
          <Metric isDark={isDark} label="Colaboradores escalados"   value={e.totalColaboradores} />
          <Metric isDark={isDark} label="Colaboradores Cadastrados" value={e.totalColaboradoresCadastrados} />
          <Metric isDark={isDark} label="Presentes" value={e.presentes} color="#34C759" />
          <Metric isDark={isDark} label="Faltas"    value={e.faltas}    color="#FF453A" />
          <Metric isDark={isDark} label="Absenteísmo"
            value={`${absenteismo.toFixed(2)}%`}
            color={absenteismo > 10 ? "#FF453A" : absenteismo > 5 ? "#FF9F0A" : "#34C759"}
          />
          <Metric isDark={isDark} label="Atestados"            value={e.atestados} />
          <Metric isDark={isDark} label="Medidas Disciplinares" value={e.medidasDisciplinares} />
          <Metric isDark={isDark} label="Acidentes" value={e.acidentes} color="#FFD60A" />
          <div style={{ gridColumn: "span 2" }}>
            <Metric isDark={isDark} label="Turnover"
              value={`${turnover.toFixed(2)}%`}
              color={turnover > 5 ? "#FF453A" : turnover > 3 ? "#FF9F0A" : "#34C759"}
            />
          </div>
        </div>
      </div>
    );
  };

  const SectionLabel = ({ children }) => (
    <h2 style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.10em", margin: 0 }}>
      {children}
    </h2>
  );

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {analiseGeral.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>Análise Geral</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {analiseGeral.map(EmpresaCard)}
          </div>
        </div>
      )}
      {analiseBPO.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>Análise BPO</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {analiseBPO.map(EmpresaCard)}
          </div>
        </div>
      )}
    </section>
  );
}
