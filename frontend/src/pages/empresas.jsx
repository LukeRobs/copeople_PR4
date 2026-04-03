// src/pages/empresas.jsx
import { useEffect, useState, useCallback, useContext } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LoadingScreen from "../components/LoadingScreen";
import EmpresaModal from "../components/EmpresaModal";
import EmpresaTable from "../components/EmpresaTable";
import { EmpresasAPI } from "../services/empresas";
import { ThemeContext } from "../context/ThemeContext";

/* ─── tema ─────────────────────────────────────────── */
const THEME = {
  dark: {
    bg:          "#0D0D0F",
    card:        "#111113",
    cardBorder:  "#27272A",
    textMain:    "#F4F4F5",
    textMuted:   "#A1A1AA",
    textSubtle:  "#71717A",
    inputBg:     "#18181B",
    inputBorder: "#3F3F46",
    inputText:   "#F4F4F5",
    inputPH:     "#71717A",
    focusRing:   "#FA4C00",
    emptyText:   "#71717A",
    countBg:     "#1E1B30",
    countText:   "#A78BFA",
    countBorder: "#4C1D95",
  },
  light: {
    bg:          "#F4F4F5",
    card:        "#FFFFFF",
    cardBorder:  "#E4E4E7",
    textMain:    "#18181B",
    textMuted:   "#52525B",
    textSubtle:  "#A1A1AA",
    inputBg:     "#FFFFFF",
    inputBorder: "#D4D4D8",
    inputText:   "#18181B",
    inputPH:     "#A1A1AA",
    focusRing:   "#FA4C00",
    emptyText:   "#A1A1AA",
    countBg:     "#EFF6FF",
    countText:   "#2563EB",
    countBorder: "#BFDBFE",
  },
};

export default function EmpresasPage() {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const T = THEME[isDark ? "dark" : "light"];

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  /* ── load ────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await EmpresasAPI.listar({
        limit: 1000,
        search: query || undefined,
      });
      setEmpresas(list);
    } catch (err) {
      console.error("Erro ao carregar empresas", err);
      alert("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.textMain }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigate={navigate}
      />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>

          {/* ── cabeçalho ─────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: isDark ? "#1F1F22" : "#FFF1EC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FA4C00",
                  flexShrink: 0,
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: T.textMain, margin: 0 }}>
                  Empresas
                </h1>
                <p style={{ fontSize: 13, color: T.textSubtle, margin: "3px 0 0" }}>
                  Gestão de empresas e vínculos operacionais
                </p>
              </div>
            </div>

            {/* kpi */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {!loading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: T.countBg,
                    border: `1px solid ${T.countBorder}`,
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.countText,
                  }}
                >
                  <Building2 size={13} />
                  {empresas.length} empresa{empresas.length !== 1 ? "s" : ""}
                </div>
              )}

              <button
                onClick={() => { setSelected(null); setModalOpen(true); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "#FA4C00",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FF5A1A")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FA4C00")}
              >
                <Plus size={15} />
                Nova Empresa
              </button>
            </div>
          </div>

          {/* ── barra de busca ────────────────────────── */}
          <div style={{ marginBottom: 20, maxWidth: 420 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.inputPH,
                  pointerEvents: "none",
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Buscar por razão social ou CNPJ"
                style={{
                  width: "100%",
                  paddingLeft: 36,
                  paddingRight: 14,
                  paddingTop: 9,
                  paddingBottom: 9,
                  borderRadius: 10,
                  background: T.inputBg,
                  border: `1px solid ${searchFocus ? T.focusRing : T.inputBorder}`,
                  color: T.inputText,
                  fontSize: 13,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* ── tabela ────────────────────────────────── */}
          <div
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {loading ? (
              <LoadingScreen message="Carregando empresas..." />
            ) : empresas.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: T.emptyText,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Building2 size={40} strokeWidth={1.2} style={{ opacity: 0.35 }} />
                <p style={{ fontSize: 14 }}>Nenhuma empresa encontrada</p>
              </div>
            ) : (
              <EmpresaTable
                empresas={empresas}
                onEdit={(empresa) => { setSelected(empresa); setModalOpen(true); }}
                onDelete={async (empresa) => {
                  if (!window.confirm(`Deseja excluir a empresa "${empresa.razaoSocial}"?`)) return;
                  await EmpresasAPI.excluir(empresa.idEmpresa);
                  load();
                }}
              />
            )}
          </div>

        </main>
      </div>

      {/* ── modal ─────────────────────────────────────── */}
      {modalOpen && (
        <EmpresaModal
          empresa={selected}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            if (selected) {
              await EmpresasAPI.atualizar(selected.idEmpresa, data);
            } else {
              await EmpresasAPI.criar(data);
            }
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
