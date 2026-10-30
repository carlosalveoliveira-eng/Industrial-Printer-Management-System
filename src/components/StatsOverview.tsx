import React from 'react';
import { FilterStatus } from '../types/printer';
import { Printer, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StatsOverviewProps {
  total: number;
  pending: number;
  issues: number;
  ok: number;
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  total,
  pending,
  issues,
  ok,
  currentFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
          currentFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-semibold uppercase tracking-wider ${currentFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Impressoras
          </span>
          <Printer className={`w-4 h-4 ${currentFilter === 'all' ? 'text-blue-400' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {total}
        </div>
        <div className={`text-[11px] mt-1 ${currentFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
          Total cadastradas
        </div>
      </button>

      {/* Pendentes */}
      <button
        onClick={() => onSelectFilter('pending')}
        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
          currentFilter === 'pending'
            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
            : 'bg-amber-50/70 hover:bg-amber-50 text-amber-950 border-amber-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-bold uppercase tracking-wider ${currentFilter === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>
            Pendentes
          </span>
          <AlertTriangle className={`w-4 h-4 ${currentFilter === 'pending' ? 'text-amber-100' : 'text-amber-600'}`} />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {pending}
        </div>
        <div className={`text-[11px] mt-1 ${currentFilter === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>
          Aguardando vistoria
        </div>
      </button>

      {/* Com problema */}
      <button
        onClick={() => onSelectFilter('issue')}
        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
          currentFilter === 'issue'
            ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40'
            : 'bg-rose-50/70 hover:bg-rose-50 text-rose-950 border-rose-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-bold uppercase tracking-wider ${currentFilter === 'issue' ? 'text-rose-100' : 'text-rose-700'}`}>
            Com Defeito
          </span>
          <AlertCircle className={`w-4 h-4 ${currentFilter === 'issue' ? 'text-rose-100' : 'text-rose-600'}`} />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {issues}
        </div>
        <div className={`text-[11px] mt-1 ${currentFilter === 'issue' ? 'text-rose-100' : 'text-rose-700'}`}>
          Requerem reparo
        </div>
      </button>

      {/* Em operação / OK */}
      <button
        onClick={() => onSelectFilter('ok')}
        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
          currentFilter === 'ok'
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
            : 'bg-emerald-50/70 hover:bg-emerald-50 text-emerald-950 border-emerald-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-bold uppercase tracking-wider ${currentFilter === 'ok' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Operacionais
          </span>
          <CheckCircle2 className={`w-4 h-4 ${currentFilter === 'ok' ? 'text-emerald-100' : 'text-emerald-600'}`} />
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {ok}
        </div>
        <div className={`text-[11px] mt-1 ${currentFilter === 'ok' ? 'text-emerald-100' : 'text-emerald-700'}`}>
          100% funcionando
        </div>
      </button>
    </div>
  );
};
