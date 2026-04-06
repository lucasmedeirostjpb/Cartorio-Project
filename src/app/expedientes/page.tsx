"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Scroll,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Hash,
  User,
  DollarSign,
} from "lucide-react";

interface Expediente {
  id: number;
  tipo: string;
  ano: number;
  numero_sequencial: number;
  destinatario_beneficiario: string;
  valor: number | null;
  data_emissao: string;
  processo: {
    numero_processo: string;
  };
}

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [tipo, setTipo] = useState<"OFICIO" | "ALVARA">("OFICIO");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [valor, setValor] = useState("");

  // Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchExpedientes = useCallback(async (search = "") => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/expedientes${params}`);
      const data = await res.json();
      setExpedientes(data);
    } catch (error) {
      console.error("Erro ao buscar expedientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpedientes(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchExpedientes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_processo: numeroProcesso,
          tipo,
          destinatario_beneficiario: destinatario,
          valor: tipo === "ALVARA" ? valor : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error });
        return;
      }

      setFeedback({ type: "success", message: data.mensagem });
      setNumeroProcesso("");
      setDestinatario("");
      setValor("");
      fetchExpedientes(searchTerm);
    } catch {
      setFeedback({
        type: "error",
        message: "Erro de conexão com o servidor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Expedientes
        </h1>
        <p className="text-slate-500 mt-1">
          Emissão e controle de Ofícios e Alvarás
        </p>
      </div>

      {/* Emission Form */}
      <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          Emitir Novo Expediente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Tipo do Expediente
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTipo("OFICIO")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                  ${
                    tipo === "OFICIO"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
              >
                <FileText size={18} />
                Ofício
              </button>
              <button
                type="button"
                onClick={() => setTipo("ALVARA")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                  ${
                    tipo === "ALVARA"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
              >
                <Scroll size={18} />
                Alvará
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Número do Processo */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Número do Processo (CNJ)
              </label>
              <div className="relative">
                <Hash
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                  placeholder="0000123-45.2024.8.15.0001"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Destinatário */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Destinatário / Beneficiário
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder="Nome do destinatário"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Valor (conditional) */}
          {tipo === "ALVARA" && (
            <div className="animate-fade-in-up max-w-sm">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Valor (R$)
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Feedback */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200
              ${
                tipo === "OFICIO"
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/30"
                  : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/30"
              }
              focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {submitting ? "Gerando..." : `Emitir ${tipo === "OFICIO" ? "Ofício" : "Alvará"}`}
          </button>
        </form>
      </div>

      {/* History & Search */}
      <div className="animate-fade-in-up stagger-2 bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-slate-500" />
            Histórico de Expedientes
          </h2>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nº do processo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nº / Ano
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Processo
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Destinatário
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-3">
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : expedientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400"
                  >
                    {searchTerm
                      ? "Nenhum expediente encontrado para este processo."
                      : "Nenhum expediente emitido ainda."}
                  </td>
                </tr>
              ) : (
                expedientes.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          exp.tipo === "OFICIO"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {exp.tipo === "OFICIO" ? (
                          <FileText size={12} />
                        ) : (
                          <Scroll size={12} />
                        )}
                        {exp.tipo === "OFICIO" ? "Ofício" : "Alvará"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {exp.numero_sequencial}/{exp.ano}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      {exp.processo.numero_processo}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {exp.destinatario_beneficiario}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {exp.valor ? formatCurrency(exp.valor) : "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(exp.data_emissao)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
