import React from 'react';
import { UserRole } from '../types/printer';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Printer, 
  CheckSquare, 
  Plus, 
  FileSpreadsheet, 
  BookOpen, 
  Layers, 
  Cloud, 
  ShieldCheck, 
  User as UserIcon,
  Settings
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'inspect' | 'history' | 'manage' | 'guide';
  setActiveTab: (tab: 'home' | 'inspect' | 'history' | 'manage' | 'guide') => void;
  onQuickAdd: () => void;
  onExportCsv: () => void;
  totalPrinters: number;
  currentUser: FirebaseUser | null;
  currentRole: UserRole;
  onOpenAuth: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickAdd,
  onExportCsv,
  totalPrinters,
  currentUser,
  currentRole,
  onOpenAuth,
  isOnline,
}) => {
  const getRoleLabel = () => {
    switch (currentRole) {
      case 'admin':
        return 'Admin';
      case 'tech':
        return 'Técnico';
      case 'viewer':
      default:
        return 'Consulta';
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3.5 pb-2.5">
        {/* Top line with branding & Cloud Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50">
                  Suporte Técnico • TI
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Cloud Firestore (Spark Grátis)</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                Sistema de Gestão e Inspeção de Impressoras
              </h1>
            </div>
          </div>

          {/* Quick Header Actions & User Auth Pill */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* User Profile / Login Button */}
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-2xs"
              title="Gerenciar usuário e permissões"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[120px] truncate">
                {currentUser?.email ? currentUser.email.replace('@gestao-impressoras.local', '') : 'tiadmin'}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                {getRoleLabel()}
              </span>
            </button>

            <button
              onClick={onExportCsv}
              title="Exportar inspeções para Excel (CSV compatível)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span> Excel
            </button>

            {currentRole !== 'viewer' && (
              <button
                onClick={onQuickAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm shadow-blue-600/30 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Impressora</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Nav pills */}
        <nav className="flex items-center gap-1 mt-3 border-t border-slate-700/60 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Impressoras ({totalPrinters})</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'inspect'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Nova Inspeção</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Histórico de Laudos</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia Técnico</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cloud & Backup</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
