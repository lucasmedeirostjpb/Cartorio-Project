"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Scroll,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Users,
  Bell,
} from "lucide-react";

interface Stats {
  ano: number;
  totalOficios: number;
  totalAlvaras: number;
  totalExpedientes: number;
}

const alertas = [
  {
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "3 Presos Provisórios com prazo de revisão vencendo",
    badge: "Urgente",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "2 Minutas Sisbajud pendentes de assinatura",
    badge: "Pendente",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "1 Criança em acolhimento aguardando reavaliação",
    badge: "Atenção",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: AlertTriangle,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "5 Processos paralisados há mais de 100 dias",
    badge: "Controle",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/expedientes/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Visão geral da 2ª Vara Mista — Comarca de Queimadas/PB
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {/* Ofícios */}
        <div className="animate-fade-in-up stagger-1 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Ofícios emitidos
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse" />
                ) : (
                  stats?.totalOficios ?? 0
                )}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Ano {stats?.ano ?? new Date().getFullYear()}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Alvarás */}
        <div className="animate-fade-in-up stagger-2 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Alvarás emitidos
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse" />
                ) : (
                  stats?.totalAlvaras ?? 0
                )}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Ano {stats?.ano ?? new Date().getFullYear()}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Scroll className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="animate-fade-in-up stagger-3 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total de Expedientes
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse" />
                ) : (
                  stats?.totalExpedientes ?? 0
                )}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Ano {stats?.ano ?? new Date().getFullYear()}
              </p>
            </div>
            <div className="bg-violet-50 p-3 rounded-xl group-hover:bg-violet-100 transition-colors">
              <TrendingUp className="text-violet-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Alerts */}
      <div className="animate-fade-in-up stagger-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-slate-700" size={20} />
          <h2 className="text-lg font-semibold text-slate-800">
            Alertas Proativos
          </h2>
          <span className="bg-red-100 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertas.map((alerta, i) => (
            <div
              key={i}
              className={`
                flex items-start gap-4 p-4 rounded-xl border
                ${alerta.bg} ${alerta.border}
                hover:shadow-md transition-all duration-200 cursor-pointer
                animate-slide-in-right
              `}
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <div className="mt-0.5">
                <alerta.icon className={alerta.color} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">
                  {alerta.text}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${alerta.badgeColor}`}
              >
                {alerta.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
