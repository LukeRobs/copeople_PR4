import { useEffect, useState, useContext } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import LoadingScreen from "../../components/LoadingScreen";
import AtestadoCard from "../../components/AtestadoCard";
import { AtestadosAPI } from "../../services/atestados";
import api from "../../services/api";
import { ThemeContext } from "../../context/ThemeContext";

export default function AtestadosPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔎 FILTROS */
  const [filtroData, setFiltroData] = useState("");
  const [filtroNome, setFiltroNome] = useState("");

  const { isDark } = useContext(ThemeContext);

  /* ── theme tokens ── */
  const bg           = isDark ? "#0D0D0D" : "#F3F4F6";
  const textMain     = isDark ? "#FFFFFF"  : "#111827";
  const labelColor   = isDark ? "#BFBFC3"  : "#6B7280";
  const filterBg     = isDark ? "#1A1A1C"  : "#FFFFFF";
  const filterBorder = isDark ? "#2A2A2C"  : "#E5E7EB";
  const inputColor   = isDark ? "#FFFFFF"  : "#111827";

  /* ================= LOAD ================= */
  async function load() {
    setLoading(true);
    try {
      const data = await AtestadosAPI.listar({
        data: filtroData || undefined,
        nome: filtroNome || undefined,
      });
      setAtestados(data);
    } catch {
      alert("Erro ao carregar atestados médicos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  /* ================= ACTIONS ================= */
  async function refresh() {
    await load();
  }

  async function handleDownload(idAtestado) {
    try {
      const res = await api.get(
        `/atestados-medicos/${idAtestado}/presign-download`
      );

      const { url } = res.data.data;
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Erro ao abrir o PDF do atestado.");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, color: textMain }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigate={navigate}
      />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-8 max-w-5xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Atestados Médicos</h1>
              <p className="text-sm" style={{ color: labelColor }}>
                Gestão de afastamentos médicos
              </p>
            </div>

            <button
              onClick={() => navigate("/atestados/novo")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FA4C00] hover:bg-[#ff5a1a] rounded-xl text-sm font-medium text-white"
            >
              <Plus size={16} />
              Novo Atestado
            </button>
          </div>

          {/* 🔎 FILTROS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* DATA */}
            <div
              style={{ background: filterBg, border: `1px solid ${filterBorder}` }}
              className="px-4 py-2 rounded-xl"
            >
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="bg-transparent outline-none text-sm"
                style={{ color: inputColor }}
              />
            </div>

            {/* COLABORADOR */}
            <div
              style={{ background: filterBg, border: `1px solid ${filterBorder}` }}
              className="px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Search size={14} className="text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar colaborador"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="bg-transparent outline-none text-sm placeholder-[#6B7280]"
                style={{ color: inputColor }}
              />
            </div>

            <button
              onClick={load}
              style={{
                background: filterBg,
                border: `1px solid ${filterBorder}`,
                color: textMain,
              }}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
            >
              Filtrar
            </button>
          </div>

          {/* LISTA */}
          {loading ? (
            <LoadingScreen message="Carregando atestados..." />
          ) : atestados.length === 0 ? (
            <div style={{ color: labelColor }}>
              Nenhum atestado médico encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {atestados.map((a) => (
                <AtestadoCard
                  key={a.idAtestado}
                  atestado={a}
                  onDownload={() => handleDownload(a.idAtestado)}
                  onFinalizar={async () => {
                    await AtestadosAPI.finalizar(a.idAtestado);
                    refresh();
                  }}
                  onCancelar={async () => {
                    await AtestadosAPI.cancelar(a.idAtestado);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
