// src/pages/DailyWorks/dwNovo.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import api from "../../services/api";

export default function DwNovoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDw, setLoadingDw] = useState(false);
  const [empresas, setEmpresas] = useState([]);

  const [form, setForm] = useState({
    data: editData?.data || "",
    idTurno: editData?.turno || "",
    observacaoReal: "",
    observacaoPlanejado: "",
    real: {},
    planejado: {},
  });

  /* ==============================
     CARREGAR EMPRESAS DA API
  ===============================*/
  useEffect(() => {
    api.get("/empresas")
      .then((res) => {
        const lista = res.data.data || res.data || [];
        setEmpresas(lista);
        // inicializa form com os IDs reais do banco
        const initReal = {};
        const initPlanejado = {};
        lista.forEach((e) => {
          initReal[e.idEmpresa] = "";
          initPlanejado[e.idEmpresa] = "";
        });
        setForm((prev) => ({
          ...prev,
          real: initReal,
          planejado: initPlanejado,
        }));
      })
      .catch((err) => console.error("Erro ao carregar empresas:", err));
  }, []);

  /* ==============================
     CARREGAR DW EXISTENTE (EDIÇÃO)
  ===============================*/
  useEffect(() => {
    if (!editData?.data || !editData?.turno) return;

    async function loadDw() {
      try {
        setLoadingDw(true);

        const [resReal, resPlanejado] = await Promise.all([
          api.get("/dw/real", {
            params: { data: editData.data, idTurno: editData.turno },
          }),
          api.get("/dw/planejado", {
            params: { data: editData.data, idTurno: editData.turno },
          }),
        ]);

        const registrosReal = resReal.data.data || [];
        const registrosPlanejado = resPlanejado.data.data || [];

        let obsReal = "";
        let obsPlanejado = "";

        setForm((prev) => {
          const novoReal = { ...prev.real };
          const novoPlanejado = { ...prev.planejado };

          registrosReal.forEach((r) => {
            novoReal[r.idEmpresa] = r.quantidade;
            if (r.observacao) obsReal = r.observacao;
          });
          registrosPlanejado.forEach((r) => {
            novoPlanejado[r.idEmpresa] = r.quantidade;
            if (r.observacao) obsPlanejado = r.observacao;
          });

          return {
            ...prev,
            real: novoReal,
            planejado: novoPlanejado,
            observacaoReal: obsReal,
            observacaoPlanejado: obsPlanejado,
          };
        });
      } catch (error) {
        console.error("Erro ao carregar DW:", error);
      } finally {
        setLoadingDw(false);
      }
    }

    loadDw();
  }, [editData]);

  /* ================= HANDLERS ================= */

  const handleReal = (idEmpresa, value) =>
    setForm((prev) => ({
      ...prev,
      real: { ...prev.real, [idEmpresa]: value },
    }));

  const handlePlanejado = (idEmpresa, value) =>
    setForm((prev) => ({
      ...prev,
      planejado: { ...prev.planejado, [idEmpresa]: value },
    }));

  const handleSave = async () => {
    if (!form.data || !form.idTurno) {
      alert("Data e Turno são obrigatórios");
      return;
    }

    const valoresReal = empresas.map((e) => form.real[e.idEmpresa]);
    const valoresPlanejado = empresas.map((e) => form.planejado[e.idEmpresa]);

    if (valoresReal.some((v) => v === "" || v === undefined)) {
      alert("Informe a quantidade Real de todas as empresas");
      return;
    }
    if (valoresPlanejado.some((v) => v === "" || v === undefined)) {
      alert("Informe a quantidade Planejada de todas as empresas");
      return;
    }

    try {
      setSaving(true);

      await Promise.all([
        // Salva Real
        ...empresas.map((e) =>
          api.post("/dw/real", {
            data: form.data,
            idTurno: Number(form.idTurno),
            idEmpresa: e.idEmpresa,
            quantidade: Number(form.real[e.idEmpresa] || 0),
            observacao: form.observacaoReal || null,
          })
        ),
        // Salva Planejado
        ...empresas.map((e) =>
          api.post("/dw/planejado", {
            data: form.data,
            idTurno: Number(form.idTurno),
            idEmpresa: e.idEmpresa,
            quantidade: Number(form.planejado[e.idEmpresa] || 0),
            observacao: form.observacaoPlanejado || null,
          })
        ),
      ]);

      navigate("/dw");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar Daily Work");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!editData;

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigate={navigate}
      />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-8 max-w-4xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dw")}
                className="p-2 rounded-lg bg-[#1A1A1C] hover:bg-[#2A2A2C]"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-2xl font-semibold">
                  {isEdit ? "Editar Daily Work" : "Novo Daily Work"}
                </h1>
                <p className="text-sm text-[#BFBFC3]">
                  Lançamento de DW Real por empresa e turno
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FA4C00] hover:bg-[#ff5a1a] rounded-xl font-medium disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {/* ================= DADOS ================= */}
          <Section title="Dados do Daily Work">
            <Input
              type="date"
              label="Data *"
              value={form.data}
              onChange={(e) =>
                setForm((p) => ({ ...p, data: e.target.value }))
              }
            />

            <Select
              label="Turno *"
              value={form.idTurno}
              onChange={(e) =>
                setForm((p) => ({ ...p, idTurno: e.target.value }))
              }
              options={[
                { value: "1", label: "T1" },
                { value: "2", label: "T2" },
                { value: "3", label: "T3" },
              ]}
            />
          </Section>

          {/* ================= PLANEJADO ================= */}
          <Section title="Quantidade Planejada por Empresa">
            {empresas.map((e) => (
              <Input
                key={e.idEmpresa}
                type="number"
                min="0"
                label={`${e.razaoSocial} *`}
                value={form.planejado[e.idEmpresa] ?? ""}
                onChange={(ev) => handlePlanejado(e.idEmpresa, ev.target.value)}
              />
            ))}
            <Textarea
              label="Observação Planejado"
              value={form.observacaoPlanejado}
              onChange={(e) =>
                setForm((p) => ({ ...p, observacaoPlanejado: e.target.value }))
              }
            />
          </Section>

          {/* ================= REAL ================= */}
          <Section title="Quantidade Real por Empresa">
            {empresas.map((e) => (
              <Input
                key={e.idEmpresa}
                type="number"
                min="0"
                label={`${e.razaoSocial} *`}
                value={form.real[e.idEmpresa] ?? ""}
                onChange={(ev) => handleReal(e.idEmpresa, ev.target.value)}
              />
            ))}
            <Textarea
              label="Observação Real"
              value={form.observacaoReal}
              onChange={(e) =>
                setForm((p) => ({ ...p, observacaoReal: e.target.value }))
              }
            />
          </Section>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENTES AUX ================= */

function Section({ title, children }) {
  return (
    <div className="bg-[#1A1A1C] border border-[#3D3D40] rounded-2xl p-6">
      <h2 className="text-xs font-semibold text-[#BFBFC3] mb-6 uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#BFBFC3]">{label}</label>
      <input
        {...props}
        className="px-4 py-2.5 bg-[#2A2A2C] border border-[#3D3D40] rounded-xl outline-none focus:ring-1 focus:ring-[#FA4C00]"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#BFBFC3]">{label}</label>
      <select
        {...props}
        className="px-4 py-2.5 bg-[#2A2A2C] border border-[#3D3D40] rounded-xl outline-none focus:ring-1 focus:ring-[#FA4C00]"
      >
        <option value="">Selecione</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1 md:col-span-2">
      <label className="text-xs text-[#BFBFC3]">{label}</label>
      <textarea
        rows={4}
        {...props}
        className="px-4 py-2.5 bg-[#2A2A2C] border border-[#3D3D40] rounded-xl outline-none focus:ring-1 focus:ring-[#FA4C00]"
      />
    </div>
  );
}