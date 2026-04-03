import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Printer,
  Users,
  Search,
  X,
  Plus,
  Pencil,
} from "lucide-react";

import { printAtaTreinamento } from "../../utils/printAtaTreinamento";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import api from "../../services/api";
import { TreinamentosAPI } from "../../services/treinamentos";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

/* =====================================================
   PAGE — DETALHES DO TREINAMENTO
===================================================== */
export default function DetalhesTreinamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [treinamento, setTreinamento] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ---- modal edição de participantes ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const [search, setSearch] = useState("");
  const [setorFiltro, setSetorFiltro] = useState(null);
  const [turnoFiltro, setTurnoFiltro] = useState(null);
  const [setores, setSetores] = useState([]);
  const [turnosList, setTurnosList] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);

  /* ── theme tokens ── */
  const bg            = isDark ? "#0D0D0D"  : "#F3F4F6";
  const cardBg        = isDark ? "#1A1A1C"  : "#FFFFFF";
  const cardBorder    = isDark ? "#2A2A2C"  : "#E5E7EB";
  const labelColor    = isDark ? "#BFBFC3"  : "#6B7280";
  const textMain      = isDark ? "#FFFFFF"  : "#111827";
  const sectorBadge   = isDark ? "#262628"  : "#F3F4F6";
  const sectorText    = isDark ? "#FFFFFF"  : "#374151";
  const printBtnBg    = isDark ? "#262628"  : "#F3F4F6";
  const printBtnHover = isDark ? "#3A3A3C"  : "#E5E7EB";

  /* modal tokens */
  const modalBg       = isDark ? "#1A1A1C"  : "#FFFFFF";
  const modalBorder   = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const modalDivider  = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6";
  const inputBg       = isDark ? "rgba(0,0,0,0.30)"       : "#F9FAFB";
  const inputBorder   = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const inputText     = isDark ? "#FFFFFF"  : "#111827";
  const inputPlaceholder = isDark ? "rgba(255,255,255,0.30)" : "#9CA3AF";
  const metaText      = isDark ? "rgba(255,255,255,0.40)" : "#9CA3AF";
  const itemHover     = isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB";

  /* drop zone tokens */
  const dropBase      = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
  const dropBaseBg    = isDark ? "rgba(255,255,255,0.02)" : "#F9FAFB";
  const dropIconBg    = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6";
  const dropIconColor = isDark ? "rgba(255,255,255,0.30)" : "#D1D5DB";
  const dropLabelMuted = isDark ? "rgba(255,255,255,0.70)" : "#6B7280";
  const dropLabelSub  = isDark ? "rgba(255,255,255,0.30)" : "#9CA3AF";
  const dropNameColor = isDark ? "#FFFFFF" : "#111827";
  const dropSizeColor = isDark ? "rgba(255,255,255,0.40)" : "#9CA3AF";

  /* disabled btn */
  const disabledBg    = isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6";
  const disabledText  = isDark ? "rgba(255,255,255,0.30)" : "#9CA3AF";

  /* ================= LOAD ================= */
  async function load() {
    try {
      const res = await api.get(`/treinamentos`);
      const found = res.data.data.find((t) => t.idTreinamento === Number(id));
      if (!found) { navigate("/treinamentos"); return; }
      setTreinamento(found);
    } catch (e) {
      if (e.response?.status === 401) { logout(); navigate("/login"); }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  /* ================= ABRIR MODAL ================= */
  const abrirModal = async () => {
    try {
      const [colabRes, setoresRes, turnosRes] = await Promise.all([
        api.get("/colaboradores", { params: { status: "ATIVO", limit: 1000 } }),
        api.get("/setores"),
        api.get("/turnos"),
      ]);
      setColaboradores(colabRes.data.data || colabRes.data);
      setSetores(setoresRes.data.data || setoresRes.data);
      setTurnosList(turnosRes.data.data || turnosRes.data);
      setSelecionados(
        treinamento.participantes.map((p) => ({ opsId: p.opsId, cpf: p.cpf || null }))
      );
      setSearch("");
      setSetorFiltro(null);
      setTurnoFiltro(null);
      setModalOpen(true);
    } catch (e) {
      alert("Erro ao carregar colaboradores");
    }
  };

  /* ================= TOGGLE PARTICIPANTE ================= */
  const toggle = (colab) => {
    setSelecionados((prev) => {
      const exists = prev.some((p) => p.opsId === colab.opsId);
      if (exists) return prev.filter((p) => p.opsId !== colab.opsId);
      return [...prev, { opsId: colab.opsId, cpf: colab.cpf || null }];
    });
  };

  const selecionarTodos = () => {
    setSelecionados((prev) => {
      const novos = filtrados
        .filter((c) => !prev.some((p) => p.opsId === c.opsId))
        .map((c) => ({ opsId: c.opsId, cpf: c.cpf || null }));
      return [...prev, ...novos];
    });
  };

  const limparFiltrados = () => {
    const ids = filtrados.map((c) => c.opsId);
    setSelecionados((prev) => prev.filter((p) => !ids.includes(p.opsId)));
  };

  /* ================= SALVAR ================= */
  const salvarParticipantes = async () => {
    if (selecionados.length === 0) {
      alert("Selecione ao menos um participante");
      return;
    }
    setSalvando(true);
    try {
      const updated = await TreinamentosAPI.atualizarParticipantes(id, selecionados);
      setTreinamento(updated);
      setModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar participantes");
    } finally {
      setSalvando(false);
    }
  };

  /* ================= FINALIZAR ================= */
  const finalizarTreinamento = async () => {
    if (!file) { alert("Selecione o PDF da ata"); return; }
    setUploading(true);
    try {
      const presign = await api.post(`/treinamentos/${treinamento.idTreinamento}/presign-ata`);
      const { uploadUrl, key } = presign.data;
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: file });
      await api.post(`/treinamentos/${treinamento.idTreinamento}/finalizar`, {
        documentoKey: key, nome: file.name, mime: file.type, size: file.size,
      });
      alert("Treinamento finalizado com sucesso");
      navigate("/treinamentos");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar treinamento");
    } finally {
      setUploading(false);
    }
  };

  /* ================= FILTRO ================= */
  const filtrados = colaboradores.filter((c) => {
    const termo = (search || "").toLowerCase();
    const matchBusca =
      c.nomeCompleto?.toLowerCase().includes(termo) ||
      c.cpf?.includes(termo) ||
      c.opsId?.toLowerCase().includes(termo);
    const matchSetor = !setorFiltro || Number(c.idSetor) === Number(setorFiltro);
    const matchTurno = !turnoFiltro || Number(c.idTurno) === Number(turnoFiltro);
    return matchBusca && matchSetor && matchTurno;
  });

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ color: labelColor }}
      >
        Carregando…
      </div>
    );
  }
  if (!treinamento) return null;

  const statusColor = treinamento.status === "FINALIZADO" ? "text-[#34C759]" : "text-[#FFD60A]";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, color: textMain }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-8 space-y-8 max-w-6xl">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/treinamentos")}
              style={{ color: labelColor }}
              className="hover:opacity-70 transition-opacity"
            >
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-semibold">Detalhes do Treinamento</h1>
              <p className={`text-sm ${statusColor}`}>Status: {treinamento.status}</p>
            </div>
          </div>

          {/* CARD PRINCIPAL */}
          <div
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            className="rounded-2xl p-6 space-y-6"
          >
            {/* INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: labelColor }}>Data</span>
                <p style={{ color: textMain }}>
                  {new Date(treinamento.dataTreinamento).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <span style={{ color: labelColor }}>SOC</span>
                <p style={{ color: textMain }}>{treinamento.soc}</p>
              </div>
              <div>
                <span style={{ color: labelColor }}>Processo</span>
                <p style={{ color: textMain }}>{treinamento.processo}</p>
              </div>
              <div>
                <span style={{ color: labelColor }}>Tema</span>
                <p style={{ color: textMain }}>{treinamento.tema}</p>
              </div>
              <div>
                <span style={{ color: labelColor }}>Líder Responsável</span>
                <p style={{ color: textMain }}>{treinamento.liderResponsavel?.nomeCompleto}</p>
              </div>
            </div>

            {/* SETORES */}
            <div>
              <h3 className="text-sm mb-2" style={{ color: labelColor }}>Setores</h3>
              <div className="flex flex-wrap gap-2">
                {treinamento.setores.map((s) => (
                  <span
                    key={s.idTreinamentoSetor}
                    style={{ background: sectorBadge, color: sectorText }}
                    className="px-3 py-1 rounded-full text-xs"
                  >
                    {s.setor?.nomeSetor}
                  </span>
                ))}
              </div>
            </div>

            {/* PARTICIPANTES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm" style={{ color: labelColor }}>
                  Participantes ({treinamento.participantes.length})
                </h3>
                {treinamento.status === "ABERTO" && (
                  <button
                    onClick={abrirModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FA4C00]/10 hover:bg-[#FA4C00]/20 text-[#FA4C00] text-xs font-medium transition-colors"
                  >
                    <Pencil size={13} />
                    Editar participantes
                  </button>
                )}
              </div>

              <div
                style={{ border: `1px solid ${cardBorder}` }}
                className="rounded-xl overflow-hidden"
              >
                {treinamento.participantes.map((p) => (
                  <div
                    key={p.idTreinamentoParticipante}
                    style={{ borderBottom: `1px solid ${cardBorder}` }}
                    className="px-4 py-2 flex justify-between text-sm last:border-b-0"
                  >
                    <span style={{ color: textMain }}>
                      {p.colaborador?.nomeCompleto || p.opsId}
                    </span>
                    <span style={{ color: labelColor }}>{p.cpf || "-"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AÇÕES */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => printAtaTreinamento(treinamento)}
                style={{ background: printBtnBg, color: textMain }}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = printBtnHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = printBtnBg)}
              >
                <Printer size={16} />
                Imprimir Ata
              </button>
            </div>

            {/* FINALIZAÇÃO */}
            {treinamento.status === "ABERTO" && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium" style={{ color: labelColor }}>
                  Finalizar Treinamento
                </h3>

                {/* DROP ZONE */}
                <label
                  style={{
                    borderColor: file ? "rgba(250,76,0,0.60)" : dropBase,
                    background: file ? "rgba(250,76,0,0.05)" : dropBaseBg,
                  }}
                  className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-[#FA4C00]/40 hover:bg-[#FA4C00]/5"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <div
                    style={{ background: file ? "rgba(250,76,0,0.15)" : dropIconBg }}
                    className="p-3 rounded-xl"
                  >
                    <FileText
                      size={24}
                      style={{ color: file ? "#FA4C00" : dropIconColor }}
                    />
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: dropNameColor }}>
                        {file.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: dropSizeColor }}>
                        {(file.size / 1024).toFixed(0)} KB • clique para trocar
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: dropLabelMuted }}>
                        Anexar ATA em PDF
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: dropLabelSub }}>
                        Clique para selecionar o arquivo
                      </p>
                    </div>
                  )}
                </label>

                <button
                  onClick={finalizarTreinamento}
                  disabled={uploading || !file}
                  style={
                    uploading || !file
                      ? { background: disabledBg, color: disabledText, cursor: "not-allowed" }
                      : {}
                  }
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    uploading || !file
                      ? ""
                      : "bg-[#FA4C00] hover:bg-[#D84300] text-white"
                  }`}
                >
                  <CheckCircle size={16} />
                  {uploading ? "Enviando..." : "Finalizar Treinamento"}
                </button>
              </div>
            )}

            {/* PDF FINAL */}
            {treinamento.status === "FINALIZADO" && treinamento.ataPdfUrl && (
              <div className="flex items-center gap-2 text-[#34C759]">
                <FileText size={16} />
                ATA anexada
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===================== MODAL EDITAR PARTICIPANTES ===================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}>
          <div
            style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
            className="rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* HEADER MODAL */}
            <div
              style={{ borderBottom: `1px solid ${modalDivider}` }}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#FA4C00]" />
                <h2 className="font-semibold text-base" style={{ color: textMain }}>
                  Editar Participantes
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ color: metaText }}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>

            {/* FILTROS */}
            <div
              style={{ borderBottom: `1px solid ${modalDivider}` }}
              className="px-5 py-3 space-y-2"
            >
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: inputPlaceholder }}
                />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou OPS ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputText,
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FA4C00]/50 placeholder:opacity-40"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={setorFiltro || ""}
                  onChange={(e) => setSetorFiltro(e.target.value || null)}
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputText,
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FA4C00]/50 appearance-none"
                >
                  <option value="">Todos os setores</option>
                  {setores.map((s) => (
                    <option key={s.idSetor} value={s.idSetor}>{s.nomeSetor}</option>
                  ))}
                </select>
                <select
                  value={turnoFiltro || ""}
                  onChange={(e) => setTurnoFiltro(e.target.value || null)}
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputText,
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FA4C00]/50 appearance-none"
                >
                  <option value="">Todos os turnos</option>
                  {turnosList.map((t) => (
                    <option key={t.idTurno} value={t.idTurno}>{t.nomeTurno}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: metaText }}>
                <span>{filtrados.length} colaboradores • {selecionados.length} selecionados</span>
                <div className="flex gap-3">
                  <button onClick={selecionarTodos} className="text-[#FA4C00] hover:text-[#FF6B35]">
                    Selecionar todos
                  </button>
                  <button onClick={limparFiltrados} className="hover:opacity-70">Limpar</button>
                </div>
              </div>
            </div>

            {/* LISTA */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {filtrados.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: metaText }}>
                  Nenhum colaborador encontrado
                </p>
              ) : (
                filtrados.map((c) => {
                  const selected = selecionados.some((p) => p.opsId === c.opsId);
                  return (
                    <button
                      key={c.opsId}
                      onClick={() => toggle(c)}
                      style={
                        selected
                          ? { background: "rgba(250,76,0,0.15)", border: "1px solid rgba(250,76,0,0.30)" }
                          : { border: "1px solid transparent" }
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 text-sm transition-colors"
                      onMouseEnter={(e) => !selected && (e.currentTarget.style.background = itemHover)}
                      onMouseLeave={(e) => !selected && (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: selected ? textMain : labelColor }}>
                        {c.nomeCompleto}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: metaText }}>{c.opsId}</span>
                        {selected && <CheckCircle size={15} className="text-[#FA4C00]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            <div
              style={{ borderTop: `1px solid ${modalDivider}` }}
              className="px-5 py-4 flex justify-end gap-3"
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", color: textMain }}
                className="px-5 py-2 rounded-xl text-sm transition-colors hover:opacity-80"
              >
                Cancelar
              </button>
              <button
                onClick={salvarParticipantes}
                disabled={salvando}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  salvando ? "bg-[#FA4C00]/50 cursor-not-allowed" : "bg-[#FA4C00] hover:bg-[#D84300]"
                }`}
              >
                <Plus size={15} />
                {salvando ? "Salvando..." : "Salvar participantes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
