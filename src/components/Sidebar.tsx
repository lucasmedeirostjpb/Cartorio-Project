"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expedientes", label: "Expedientes", icon: FileText },
  { href: "/contatos", label: "Contatos", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#0f2b4c] text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-[#0a1e36]
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">
              Gestão Cartorária
            </h1>
            <p className="text-blue-300/70 text-[11px]">
              2ª Vara Mista · Queimadas
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600/20 text-blue-300 shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-blue-400" : "text-slate-500"}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[10px] text-slate-500 text-center">
            TJPB — Comarca de Queimadas
          </p>
          <p className="text-[10px] text-slate-600 text-center mt-0.5">
            MVP v1.0 · {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
