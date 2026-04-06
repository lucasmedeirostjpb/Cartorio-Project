"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Copy,
  Check,
  Phone,
  Mail,
  Scale,
  Building2,
  Shield,
  Landmark,
  MoreHorizontal,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Contato {
  id: number;
  nome: string;
  tipo: string;
  telefone: string | null;
  email: string | null;
  oab: string | null;
}

const TIPO_TABS = [
  { value: "", label: "Todos", icon: Users },
  { value: "ADVOGADO", label: "Advogados", icon: Scale },
  { value: "DELEGACIA", label: "Delegacias", icon: Shield },
  { value: "PRESIDIO", label: "Presídios", icon: Building2 },
  { value: "CONSELHO", label: "Conselhos", icon: Landmark },
  { value: "OUTROS", label: "Outros", icon: MoreHorizontal },
];

const TIPO_LABELS: Record<string, string> = {
  ADVOGADO: "Advogado(a)",
  DELEGACIA: "Delegacia",
  PRESIDIO: "Presídio",
  CONSELHO: "Conselho",
  OUTROS: "Outros",
};

const TIPO_COLORS: Record<string, string> = {
  ADVOGADO: "bg-blue-100 text-blue-700",
  DELEGACIA: "bg-red-100 text-red-700",
  PRESIDIO: "bg-amber-100 text-amber-700",
  CONSELHO: "bg-emerald-100 text-emerald-700",
  OUTROS: "bg-slate-100 text-slate-700",
};

export default function ContatosPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formNome, setFormNome] = useState("");
  const [formTipo, setFormTipo] = useState("ADVOGADO");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOab, setFormOab] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchContatos = useCallback(async (tipo = "") => {
    try {
      const params = tipo ? `?tipo=${tipo}` : "";
      const res = await fetch(`/api/contatos${params}`);
      const data = await res.json();
      setContatos(data);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchContatos(activeTab);
  }, [activeTab, fetchContatos]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error("Falha ao copiar para clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/contatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formNome,
          tipo: formTipo,
          telefone: formTelefone || null,
          email: formEmail || null,
          oab: formTipo === "ADVOGADO" ? formOab || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error });
        return;
      }

      setFeedback({
        type: "success",
        message: `Contato "${formNome}" adicionado com sucesso!`,
      });
      setFormNome("");
      setFormTelefone("");
      setFormEmail("");
      setFormOab("");
      fetchContatos(activeTab);

      setTimeout(() => {
        setShowForm(false);
        setFeedback(null);
      }, 1500);
    } catch {
      setFeedback({
        type: "error",
        message: "Erro de conexão com o servidor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Diretório de Contatos
          </h1>
          <p className="text-slate-500 mt-1">
            Agenda compartilhada de contatos do cartório
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFeedback(null);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Fechar" : "Adicionar Contato"}
        </button>
      </div>

      {/* Add Contact Form */}
      {showForm && (
        <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            Novo Contato
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Nome do contato"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Tipo *
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="ADVOGADO">Advogado(a)</option>
                  <option value="DELEGACIA">Delegacia</option>
                  <option value="PRESIDIO">Presídio</option>
                  <option value="CONSELHO">Conselho</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                  placeholder="(83) 99999-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contato@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
              {formTipo === "ADVOGADO" && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    OAB
                  </label>
                  <input
                    type="text"
                    value={formOab}
                    onChange={(e) => setFormOab(e.target.value)}
                    placeholder="PB 12.345"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium animate-fade-in-up ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {submitting ? "Salvando..." : "Salvar Contato"}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TIPO_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.value
                  ? "bg-[#0f2b4c] text-white shadow-md shadow-blue-900/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          : contatos.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              Nenhum contato encontrado para esta categoria.
            </div>
          ) : (
            contatos.map((contato, index) => (
              <div
                key={contato.id}
                className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* Name & Type */}
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                    {contato.nome}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        TIPO_COLORS[contato.tipo] || TIPO_COLORS.OUTROS
                      }`}
                    >
                      {TIPO_LABELS[contato.tipo] || contato.tipo}
                    </span>
                    {contato.oab && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        OAB {contato.oab}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2">
                  {contato.telefone && (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 min-w-0">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{contato.telefone}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(contato.telefone!, `tel-${contato.id}`)
                        }
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all"
                        title="Copiar telefone"
                      >
                        {copiedId === `tel-${contato.id}` ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  )}
                  {contato.email && (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 min-w-0">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{contato.email}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(contato.email!, `email-${contato.id}`)
                        }
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all"
                        title="Copiar e-mail"
                      >
                        {copiedId === `email-${contato.id}` ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  )}
                  {!contato.telefone && !contato.email && (
                    <p className="text-xs text-slate-400 italic">
                      Sem informações de contato
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}
