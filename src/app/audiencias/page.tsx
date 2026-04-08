"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  Users,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Loader2,
  X,
  User,
  Phone,
  FileText,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  eachDayOfInterval,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos
interface Envolvido {
  id?: string;
  nome: string;
  papel: string;
  telefone?: string;
  documento?: string;
  presenca_confirmada: boolean;
}

interface Audiencia {
  id: string;
  data_hora: string;
  numero_processo: string;
  classe: string;
  tipo: string;
  modalidade: "PRESENCIAL" | "ONLINE" | "HIBRIDA";
  link_video_conferencia?: string;
  status: "AGENDADA" | "REALIZADA" | "CANCELADA" | "REDESIGNADA";
  observacoes?: string;
  envolvidos: Envolvido[];
}

const statusConfig = {
  AGENDADA: {
    label: "Agendada",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  REALIZADA: {
    label: "Realizada",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  REDESIGNADA: {
    label: "Redesignada",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
};

export default function AudienciasPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAudiencia, setEditingAudiencia] = useState<Audiencia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    data_hora: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    numero_processo: "",
    classe: "",
    tipo: "",
    modalidade: "PRESENCIAL" as "PRESENCIAL" | "ONLINE" | "HIBRIDA",
    link_video_conferencia: "",
    status: "AGENDADA" as "AGENDADA" | "REALIZADA" | "CANCELADA" | "REDESIGNADA",
    observacoes: "",
    envolvidos: [] as Envolvido[],
  });

  const fetchAudiencias = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const res = await fetch(`/api/audiencias?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAudiencias(data);
      } else {
        setAudiencias([]);
        console.error("API retornou dados inválidos:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar audiências:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAudiencias();
  }, [fetchAudiencias]);

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const audienciasDoDia = useMemo(() => {
    return audiencias
      .filter((a) => isSameDay(parseISO(a.data_hora), selectedDay))
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora));
  }, [audiencias, selectedDay]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleOpenModal = (audiencia?: Audiencia) => {
    if (audiencia) {
      setEditingAudiencia(audiencia);
      setFormData({
        data_hora: format(parseISO(audiencia.data_hora), "yyyy-MM-dd'T'HH:mm"),
        numero_processo: audiencia.numero_processo,
        classe: audiencia.classe,
        tipo: audiencia.tipo,
        modalidade: audiencia.modalidade,
        link_video_conferencia: audiencia.link_video_conferencia || "",
        status: audiencia.status,
        observacoes: audiencia.observacoes || "",
        envolvidos: [...audiencia.envolvidos],
      });
    } else {
      setEditingAudiencia(null);
      // Ajustar data padrão para o dia selecionado + hora atual
      const now = new Date();
      const defaultDate = setMinutes(setHours(selectedDay, now.getHours()), now.getMinutes());
      setFormData({
        data_hora: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        numero_processo: "",
        classe: "",
        tipo: "",
        modalidade: "PRESENCIAL",
        link_video_conferencia: "",
        status: "AGENDADA",
        observacoes: "",
        envolvidos: [],
      });
    }
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleAddEnvolvido = () => {
    setFormData((prev) => ({
      ...prev,
      envolvidos: [
        ...prev.envolvidos,
        { nome: "", papel: "", documento: "", telefone: "", presenca_confirmada: false },
      ],
    }));
  };

  const handleRemoveEnvolvido = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      envolvidos: prev.envolvidos.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateEnvolvido = (index: number, field: keyof Envolvido, value: any) => {
    setFormData((prev) => ({
      ...prev,
      envolvidos: prev.envolvidos.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingAudiencia ? `/api/audiencias/${editingAudiencia.id}` : "/api/audiencias";
      const method = editingAudiencia ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchAudiencias();
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "Erro ao salvar audiência");
      }
    } catch (error) {
      console.error("Erro ao salvar audiência:", error);
      setErrorMsg("Erro de conexão com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta audiência?")) return;
    try {
      await fetch(`/api/audiencias/${id}`, { method: "DELETE" });
      fetchAudiencias();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/audiencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAudiencias();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Agenda de Audiências
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão inteligente de pautas e videoconferências
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Nova Audiência
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-white rounded-xl border border-slate-200 text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 hover:bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-white rounded-xl border border-slate-200 text-slate-600 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayAudiencias = audiencias.filter((a) =>
                  isSameDay(parseISO(a.data_hora), day)
                );
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[100px] sm:min-h-[140px] p-2 border-r border-b border-slate-100 cursor-pointer transition-all
                      ${!isCurrentMonth ? "bg-slate-50/30 text-slate-300" : "text-slate-700 hover:bg-blue-50/40"}
                      ${isSelected ? "bg-blue-50/80 ring-2 ring-inset ring-blue-500/20" : ""}
                      ${idx % 7 === 6 ? "border-r-0" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`
                          text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday(day) ? "bg-blue-600 text-white" : ""}
                        `}
                      >
                        {format(day, "d")}
                      </span>
                      {dayAudiencias.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {dayAudiencias.length}
                        </span>
                      )}
                    </div>

                    {/* Compact Hearing List on Desktop */}
                    <div className="hidden sm:flex flex-col gap-1 overflow-hidden">
                      {dayAudiencias.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className={`
                            text-[10px] px-2 py-1 rounded-md border truncate font-medium
                            ${statusConfig[a.status].color}
                          `}
                        >
                          {format(parseISO(a.data_hora), "HH:mm")} · {a.tipo}
                        </div>
                      ))}
                      {dayAudiencias.length > 3 && (
                        <div className="text-[10px] text-slate-400 pl-1">
                          + {dayAudiencias.length - 3} mais...
                        </div>
                      )}
                    </div>

                    {/* Tiny dots on Mobile */}
                    <div className="flex sm:hidden justify-center gap-0.5 mt-auto">
                      {dayAudiencias.slice(0, 3).map((a) => (
                        <div key={a.id} className={`w-1.5 h-1.5 rounded-full ${statusConfig[a.status].dot}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day / Details Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <CalendarIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Pauta de {format(selectedDay, "dd/MM/yyyy")}
                </h3>
                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wide">
                  {format(selectedDay, "EEEE", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p>Carregando pauta...</p>
                </div>
              ) : audienciasDoDia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                  <Clock size={40} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">Nenhuma audiência</p>
                  <p className="text-slate-400 text-xs px-4">Não há audiências agendadas para este dia.</p>
                </div>
              ) : (
                audienciasDoDia.map((a) => (
                  <div
                    key={a.id}
                    className="group relative bg-[#ffffff] hover:bg-[#f8fafc] rounded-2xl border border-slate-100 p-4 transition-all duration-300 hover:shadow-md hover:border-blue-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800 tabular-nums">
                          {format(parseISO(a.data_hora), "HH:mm")}
                        </span>
                        <div className={`w-1 h-3 rounded-full ${statusConfig[a.status].dot}`} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${statusConfig[a.status].color}`}>
                        {statusConfig[a.status].label}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 leading-tight mb-2">
                      {a.tipo} <span className="text-slate-400 font-normal">({a.classe})</span>
                    </h4>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <FileText size={14} className="text-blue-500" />
                        {a.numero_processo}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        {a.modalidade === "ONLINE" ? (
                          <Video size={14} className="text-indigo-500" />
                        ) : (
                          <MapPin size={14} className="text-emerald-500" />
                        )}
                        {a.modalidade}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(a)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {a.status === "AGENDADA" && (
                          <button
                            onClick={() => updateStatus(a.id, "REALIZADA")}
                            className="text-[10px] font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            Concluir
                          </button>
                        )}
                        {a.link_video_conferencia && (
                          <a
                            href={a.link_video_conferencia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            title="Entrar na Videoconferência"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-none">
                  {editingAudiencia ? "Editar Audiência" : "Agendar Audiência"}
                </h2>
                <p className="text-slate-500 mt-1.5 text-sm font-medium">Preencha os detalhes da pauta judicial</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {errorMsg && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-fade-in-up">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{errorMsg}</p>
                    <button onClick={() => setErrorMsg(null)} className="ml-auto hover:bg-rose-100 p-1 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Processo (CNJ)</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                      placeholder="0000000-00.0000.8.15.0001"
                      value={formData.numero_processo}
                      onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Classe</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium"
                        placeholder="Ex: Ação Penal"
                        value={formData.classe}
                        onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium"
                        placeholder="Ex: Instrução"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Data e Hora</label>
                      <input
                        required
                        type="datetime-local"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium"
                        value={formData.data_hora}
                        onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Modalidade</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium appearance-none"
                        value={formData.modalidade}
                        onChange={(e) => setFormData({ ...formData, modalidade: e.target.value as any })}
                      >
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="ONLINE">Online (Videoconferência)</option>
                        <option value="HIBRIDA">Híbrida</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Link da Videoconferência</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="url"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3 text-sm font-medium"
                        placeholder="zoom.us/j/..., meet.google.com/..."
                        value={formData.link_video_conferencia}
                        onChange={(e) => setFormData({ ...formData, link_video_conferencia: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(statusConfig).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: s as any })}
                          className={`
                            px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all
                            ${formData.status === s 
                              ? statusConfig[s as keyof typeof statusConfig].color + " ring-4 ring-slate-100" 
                              : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}
                          `}
                        >
                          {statusConfig[s as keyof typeof statusConfig].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
                    <textarea
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium resize-none"
                      placeholder="Informações adicionais para a pauta..."
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Envolvidos Section */}
              <div className="border-t border-slate-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    <h3 className="font-bold text-slate-800">Partes / Envolvidos</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEnvolvido}
                    className="text-[12px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    + Adicionar Parte
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.envolvidos.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm italic font-medium">Nenhum envolvido cadastrado</div>
                  ) : (
                    formData.envolvidos.map((env, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end animate-fade-in-up">
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome Completo</label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 text-slate-300" size={14} />
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold"
                              value={env.nome}
                              onChange={(e) => handleUpdateEnvolvido(idx, "nome", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Papel</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 text-slate-300" size={14} />
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold"
                              placeholder="Autor, Réu, Vítima..."
                              value={env.papel}
                              onChange={(e) => handleUpdateEnvolvido(idx, "papel", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">CPF/OAB</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                              value={env.documento}
                              onChange={(e) => handleUpdateEnvolvido(idx, "documento", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Telefone</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                              value={env.telefone}
                              onChange={(e) => handleUpdateEnvolvido(idx, "telefone", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateEnvolvido(idx, "presenca_confirmada", !env.presenca_confirmada)}
                            className={`flex-1 text-[10px] font-bold min-w-[100px] h-9 rounded-xl border transition-all ${
                              env.presenca_confirmada 
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm" 
                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {env.presenca_confirmada ? "Presente" : "Confirmar Presença"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEnvolvido(idx)}
                            className="p-2 text-rose-400 hover:text-rose-600"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

              {/* Modal Footer (moved inside form) */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-sm font-bold text-slate-500 hover:text-slate-700 px-6 py-3 rounded-2xl transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {editingAudiencia ? "Salvar Alterações" : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Global Styles for Animations & Scrollbar */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
