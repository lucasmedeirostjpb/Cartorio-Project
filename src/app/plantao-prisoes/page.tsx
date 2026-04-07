/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Gavel,
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Edit2,
  Trash2,
} from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "PRESOS" | "BENS";

export default function PlantaoPrisoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("PRESOS");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ presosVencendo: 0, bensTotal: 0 });

  // Form States - Presos
  const [presoNome, setPresoNome] = useState("");
  const [presoProcesso, setPresoProcesso] = useState("");
  const [presoDataPrisao, setPresoDataPrisao] = useState("");
  const [presoSituacao, setPresoSituacao] = useState("");
  const [presoUltimaRevisao, setPresoUltimaRevisao] = useState("");

  // Form States - Bens
  const [bemProcesso, setBemProcesso] = useState("");
  const [bemDescricao, setBemDescricao] = useState("");
  const [bemLocalizacao, setBemLocalizacao] = useState("");
  const [bemSngb, setBemSngb] = useState("NÃO");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "PRESOS" ? "/api/presos" : "/api/bens";
      const res = await fetch(endpoint);
      
      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`);
      }

      const json = await res.json();
      setData(json);

      if (activeTab === "PRESOS") {
        const soon = json.filter((p: any) => {
          const v = new Date(p.data_vencimento);
          return isBefore(v, addDays(new Date(), 7));
        }).length;
        setStats(prev => ({ ...prev, presosVencendo: soon }));
      } else if (activeTab === "BENS") {
        setStats(prev => ({ ...prev, bensTotal: json.length }));
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
    setPresoNome(""); setPresoProcesso(""); setPresoDataPrisao(""); setPresoSituacao(""); setPresoUltimaRevisao("");
    setBemProcesso(""); setBemDescricao(""); setBemLocalizacao("");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFeedback(null);
    if (activeTab === "PRESOS") {
      setPresoNome(item.nome);
      setPresoProcesso(item.processo.numero_processo);
      setPresoDataPrisao(item.data_prisao ? item.data_prisao.split("T")[0] : "");
      setPresoSituacao(item.situacao_criminal || "");
      setPresoUltimaRevisao(item.data_ultima_revisao ? item.data_ultima_revisao.split("T")[0] : "");
    } else {
      setBemProcesso(item.processo?.numero_processo || "");
      setBemDescricao(item.descricao);
      setBemLocalizacao(item.localizacao || "");
      setBemSngb(item.cadastrado_sngb);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const endpoint = activeTab === "PRESOS" ? "/api/presos" : "/api/bens";
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

    if (activeTab === "PRESOS") {
      endpoint = "/api/presos";
      body = {
        id: editingId,
        nome: presoNome,
        numero_processo: presoProcesso,
        data_prisao: presoDataPrisao || null,
        situacao_criminal: presoSituacao,
        data_ultima_revisao: presoUltimaRevisao,
      };
    } else {
      endpoint = "/api/bens";
      body = {
        id: editingId,
        numero_processo: bemProcesso,
        descricao: bemDescricao,
        localizacao: bemLocalizacao,
        cadastrado_sngb: bemSngb,
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
          <Shield className="text-blue-600" />
          Plantão e Prisões
        </h1>
        <p className="text-slate-500 mt-1">
          Controle de flagrantes, presos provisórios e bens apreendidos
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prisões Vencendo</p>
            <p className="text-2xl font-bold text-slate-800">{stats.presosVencendo}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Bens Registrados</p>
            <p className="text-2xl font-bold text-slate-800">{stats.bensTotal}</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          {editingId ? <Edit2 size={20} className="text-amber-600" /> : <Plus size={20} className="text-blue-600" />}
          {editingId ? (
            activeTab === "PRESOS" ? "Editar Revisão de Prisão" : "Editar Bem Apreendido"
          ) : (
            activeTab === "PRESOS" ? "Nova Revisão de Prisão" : "Cadastrar Bem Apreendido"
          )}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeTab === "PRESOS" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Preso</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={presoNome} onChange={e => setPresoNome(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nº Processo/CNJ</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={presoProcesso} onChange={e => setPresoProcesso(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Última Revisão</label>
                <input required type="date" className="w-full px-4 py-2 border rounded-xl" value={presoUltimaRevisao} onChange={e => setPresoUltimaRevisao(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Data Prisão (Opcional)</label>
                <input type="date" className="w-full px-4 py-2 border rounded-xl" value={presoDataPrisao} onChange={e => setPresoDataPrisao(e.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Situação Criminal</label>
                <input type="text" placeholder="Ex: Preventiva, Instrução..." className="w-full px-4 py-2 border rounded-xl" value={presoSituacao} onChange={e => setPresoSituacao(e.target.value)} />
              </div>
            </>
          )}



          {activeTab === "BENS" && (
            <>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Descrição do Bem</label>
                <input required type="text" placeholder="Ex: Veículo, Arma, Celular..." className="w-full px-4 py-2 border rounded-xl" value={bemDescricao} onChange={e => setBemDescricao(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nº Processo/CNJ</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={bemProcesso} onChange={e => setBemProcesso(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Localização</label>
                <input type="text" placeholder="Ex: Depósito, Delegacia..." className="w-full px-4 py-2 border rounded-xl" value={bemLocalizacao} onChange={e => setBemLocalizacao(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Cadastrado SNGB?</label>
                <select className="w-full px-4 py-2 border rounded-xl" value={bemSngb} onChange={e => setBemSngb(e.target.value)}>
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
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
                  className="px-6 py-2 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button 
                disabled={submitting} 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {editingId ? "Atualizar Registro" : "Salvar Registro"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-md">
        <button
          onClick={() => { setActiveTab("PRESOS"); setFeedback(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "PRESOS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Presos Provisórios
        </button>

        <button
          onClick={() => { setActiveTab("BENS"); setFeedback(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "BENS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Bens
        </button>
      </div>

      {/* List & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            {activeTab === "PRESOS" ? <Clock className="text-red-500" /> : <Package className="text-amber-500" />}
            {activeTab === "PRESOS" ? "Revisão de Prisões" : "Bens Apreendidos"}
          </h2>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center text-slate-400">Nenhum registro encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  {activeTab === "PRESOS" && (
                    <>
                      <th className="py-3 px-4 text-left">Nome</th>
                      <th className="py-3 px-4 text-left">Processo</th>
                      <th className="py-3 px-4 text-left">Data Prisão</th>
                      <th className="py-3 px-4 text-left">Última Revisão</th>
                      <th className="py-3 px-4 text-left">Vencimento</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </>
                  )}

                  {activeTab === "BENS" && (
                    <>
                      <th className="py-3 px-4 text-left">Processo</th>
                      <th className="py-3 px-4 text-left">Descrição</th>
                      <th className="py-3 px-4 text-left">Localização</th>
                      <th className="py-3 px-4 text-left">SNGB</th>
                      <th className="py-3 px-4 text-left">Data Cadastro</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {activeTab === "PRESOS" && (
                      <>
                        <td className="py-4 px-4 font-medium text-slate-700">{item.nome}</td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-xs">{item.processo?.numero_processo}</td>
                        <td className="py-4 px-4 text-slate-600">{formatDate(item.data_prisao)}</td>
                        <td className="py-4 px-4 text-slate-600">{formatDate(item.data_ultima_revisao)}</td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${
                            isBefore(new Date(item.data_vencimento), addDays(new Date(), 7)) ? "text-red-500" : "text-slate-600"
                          }`}>
                            {formatDate(item.data_vencimento)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                             isBefore(new Date(item.data_vencimento), new Date()) ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                           }`}>
                             {isBefore(new Date(item.data_vencimento), new Date()) ? "VENCIDO" : "OK"}
                           </span>
                        </td>
                      </>
                    )}

                    {activeTab === "BENS" && (
                      <>
                        <td className="py-4 px-4 text-slate-500 font-mono text-xs">{item.processo?.numero_processo}</td>
                        <td className="py-4 px-4 text-slate-700">{item.descricao}</td>
                        <td className="py-4 px-4 text-slate-600">{item.localizacao || "—"}</td>
                        <td className="py-4 px-4 font-semibold text-slate-600">{item.cadastrado_sngb || "NÃO"}</td>
                        <td className="py-4 px-4 text-slate-500">{formatDate(item.data_cadastro_sngb)}</td>
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
