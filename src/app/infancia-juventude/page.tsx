/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Baby,
  Users,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Heart,
  FileBadge,
  Edit2,
  Trash2,
} from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "ACOLHIMENTO" | "GUIAS_MSE";

export default function InfanciaJuventudePage() {
  const [activeTab, setActiveTab] = useState<Tab>("ACOLHIMENTO");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ reavaliacoesVencendo: 0, acolhidosAtuais: 0 });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States - Acolhimento
  const [acolhidoNome, setAcolhidoNome] = useState("");
  const [acolhidoData, setAcolhidoData] = useState("");
  const [acolhidoProcesso, setAcolhidoProcesso] = useState("");
  const [acolhidoLocal, setAcolhidoLocal] = useState("");

  // Form States - Guia MSE
  const [guiaNumero, setGuiaNumero] = useState("");
  const [guiaInfrator, setGuiaInfrator] = useState("");
  const [guiaProcesso, setGuiaProcesso] = useState("");
  const [guiaDestino, setGuiaDestino] = useState("");
  const [guiaProvidencia, setGuiaProvidencia] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "ACOLHIMENTO" ? "/api/acolhimento" : "/api/guias-mse";
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json);

      if (activeTab === "ACOLHIMENTO") {
        const soon = json.filter((a: any) => {
          const v = new Date(a.data_proxima_revaliacao);
          return isBefore(v, addDays(new Date(), 15));
        }).length;
        const total = json.filter((a: any) => a.status === "ACOLHIDO").length;
        setStats({ reavaliacoesVencendo: soon, acolhidosAtuais: total });
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    clearForm();
    setFeedback(null);
  }, [activeTab]);

  const clearForm = () => {
    setEditingId(null);
    setAcolhidoNome(""); setAcolhidoData(""); setAcolhidoProcesso(""); setAcolhidoLocal("");
    setGuiaNumero(""); setGuiaInfrator(""); setGuiaProcesso(""); setGuiaDestino(""); setGuiaProvidencia("");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFeedback(null);
    if (activeTab === "ACOLHIMENTO") {
      setAcolhidoNome(item.nome_menor);
      setAcolhidoData(item.data_acolhimento ? item.data_acolhimento.split("T")[0] : "");
      setAcolhidoProcesso(item.processo?.numero_processo || "");
      setAcolhidoLocal(item.local_acolhimento || "");
    } else {
      setGuiaNumero(item.numero_guia || "");
      setGuiaInfrator(item.infrator);
      setGuiaProcesso(item.processo?.numero_processo || "");
      setGuiaDestino(item.comarca_destino || "");
      setGuiaProvidencia(item.providencia || "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const endpoint = activeTab === "ACOLHIMENTO" ? "/api/acolhimento" : "/api/guias-mse";
      const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback({ type: "success", message: "Registro removido com sucesso" });
        fetchData();
      } else {
        setFeedback({ type: "error", message: "Erro ao excluir" });
      }
    } catch {
      setFeedback({ type: "error", message: "Erro de conexão" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    let endpoint = "";
    let body = {};

    if (activeTab === "ACOLHIMENTO") {
      endpoint = "/api/acolhimento";
      body = {
        id: editingId,
        nome_menor: acolhidoNome,
        data_acolhimento: acolhidoData,
        numero_processo: acolhidoProcesso,
        local_acolhimento: acolhidoLocal,
        status: "ACOLHIDO",
      };
    } else {
      endpoint = "/api/guias-mse";
      body = {
        id: editingId,
        numero_guia: guiaNumero,
        infrator: guiaInfrator,
        numero_processo: guiaProcesso,
        comarca_destino: guiaDestino,
        providencia: guiaProvidencia,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: result.error || "Erro ao salvar" });
      } else {
        setFeedback({ type: "success", message: editingId ? "Registro atualizado com sucesso!" : "Registro salvo com sucesso!" });
        clearForm();
        fetchData();
      }
    } catch {
      setFeedback({ type: "error", message: "Erro de conexão" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Baby className="text-pink-600" />
          Infância e Juventude
        </h1>
        <p className="text-slate-500 mt-1">
          Controle de acolhimento institucional e guias de medidas socioeducativas (MSE)
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Reavaliações Vencendo</p>
            <p className="text-2xl font-bold text-slate-800">{stats.reavaliacoesVencendo}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Acolhidos Atuais</p>
            <p className="text-2xl font-bold text-slate-800">
              {stats.acolhidosAtuais}
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          {editingId ? <Edit2 size={20} className="text-amber-600" /> : <Plus size={20} className="text-pink-600" />}
          {editingId ? (
            activeTab === "ACOLHIMENTO" ? "Editar Acolhimento Institucional" : "Editar Guia MSE"
          ) : (
            activeTab === "ACOLHIMENTO" ? "Novo Acolhimento Institucional" : "Nova Guia MSE"
          )}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeTab === "ACOLHIMENTO" && (
            <>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Menor</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={acolhidoNome} onChange={e => setAcolhidoNome(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Data de Acolhimento</label>
                <input required type="date" className="w-full px-4 py-2 border rounded-xl" value={acolhidoData} onChange={e => setAcolhidoData(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nº Processo (Se houver)</label>
                <input type="text" className="w-full px-4 py-2 border rounded-xl" value={acolhidoProcesso} onChange={e => setAcolhidoProcesso(e.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Local (Abrigo/Família)</label>
                <input required type="text" placeholder="Ex: Abrigo Esperança..." className="w-full px-4 py-2 border rounded-xl" value={acolhidoLocal} onChange={e => setAcolhidoLocal(e.target.value)} />
              </div>
            </>
          )}

          {activeTab === "GUIAS_MSE" && (
            <>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Infrator</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={guiaInfrator} onChange={e => setGuiaInfrator(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nº da Guia</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={guiaNumero} onChange={e => setGuiaNumero(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nº Processo/CNJ</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={guiaProcesso} onChange={e => setGuiaProcesso(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Comarca de Destino</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={guiaDestino} onChange={e => setGuiaDestino(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Providência</label>
                <input type="text" placeholder="Ex: Internação, Semiliberdade..." className="w-full px-4 py-2 border rounded-xl" value={guiaProvidencia} onChange={e => setGuiaProvidencia(e.target.value)} />
              </div>
            </>
          )}

          <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between border-t pt-5">
            {feedback && (
              <div className={`text-sm flex items-center gap-2 ${feedback.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {feedback.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {feedback.message}
              </div>
            )}
            <div className="flex items-center gap-3">
              {editingId && (
                <button 
                  type="button" 
                  onClick={clearForm}
                  className="px-6 py-2 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-sans"
                >
                  Cancelar
                </button>
              )}
              <button 
                disabled={submitting} 
                type="submit" 
                className="bg-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {editingId ? "Atualizar Registro" : "Salvar Registro"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-sm">
        <button
          onClick={() => { setActiveTab("ACOLHIMENTO"); setFeedback(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "ACOLHIMENTO" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Acolhimento
        </button>
        <button
          onClick={() => { setActiveTab("GUIAS_MSE"); setFeedback(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "GUIAS_MSE" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Guias MSE
        </button>
      </div>

      {/* List & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            {activeTab === "ACOLHIMENTO" ? <Heart className="text-pink-500" /> : <FileBadge className="text-blue-500" />}
            {activeTab === "ACOLHIMENTO" ? "Acolhimento Institucional" : "Controle de Guias MSE"}
          </h2>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-pink-500" size={32} />
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center text-slate-400">Nenhum registro encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  {activeTab === "ACOLHIMENTO" && (
                    <>
                      <th className="py-3 px-4 text-left">Menor</th>
                      <th className="py-3 px-4 text-left">Acolhimento</th>
                      <th className="py-3 px-4 text-left">Reavaliação</th>
                      <th className="py-3 px-4 text-left">Processo</th>
                      <th className="py-3 px-4 text-left">Local</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </>
                  )}
                  {activeTab === "GUIAS_MSE" && (
                    <>
                      <th className="py-3 px-4 text-left">Infrator</th>
                      <th className="py-3 px-4 text-left">Nº Guia</th>
                      <th className="py-3 px-4 text-left">Processo</th>
                      <th className="py-3 px-4 text-left">Destino</th>
                      <th className="py-3 px-4 text-left">Providência</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {activeTab === "ACOLHIMENTO" && (
                      <>
                        <td className="py-4 px-4 font-medium text-slate-700">{item.nome_menor}</td>
                        <td className="py-4 px-4 text-slate-600">{formatDate(item.data_acolhimento)}</td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${
                            isBefore(new Date(item.data_proxima_revaliacao), addDays(new Date(), 15)) ? "text-red-500" : "text-slate-600"
                          }`}>
                            {formatDate(item.data_proxima_revaliacao)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-xs">{item.processo?.numero_processo || "—"}</td>
                        <td className="py-4 px-4 text-slate-600">{item.local_acolhimento}</td>
                        <td className="py-4 px-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                             item.status === "ACOLHIDO" ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-700"
                           }`}>
                             {item.status}
                           </span>
                        </td>
                      </>
                    )}
                    {activeTab === "GUIAS_MSE" && (
                      <>
                        <td className="py-4 px-4 font-medium text-slate-700">{item.infrator}</td>
                        <td className="py-4 px-4 text-slate-600">{item.numero_guia || "—"}</td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-xs">{item.processo?.numero_processo}</td>
                        <td className="py-4 px-4 text-slate-600 font-semibold">{item.comarca_destino}</td>
                        <td className="py-4 px-4 text-slate-500 text-xs italic">{item.providencia || "—"}</td>
                      </>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
