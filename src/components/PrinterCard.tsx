import React, { useState } from 'react';
import { Printer, Inspection } from '../types/printer';
import { 
  calculatePrinterStatus, 
  getLatestInspection, 
  formatDateBR, 
  getStatusBadgeInfo 
} from '../utils/exportUtils';
import { 
  CheckSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  EthernetPort, 
  Usb, 
  Activity, 
  Edit3, 
  Trash2, 
  Clock, 
  AlertCircle,
  MoreVertical
} from 'lucide-react';

interface PrinterCardProps {
  printer: Printer;
  inspections: Inspection[];
  onInspect: (printerId: string) => void;
  onViewHistory: (printerId: string) => void;
  onEdit: (printer: Printer) => void;
  onDelete: (printerId: string) => void;
  onDiagnose: (printer: Printer) => void;
  canEdit?: boolean;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({
  printer,
  inspections,
  onInspect,
  onViewHistory,
  onEdit,
  onDelete,
  onDiagnose,
  canEdit = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const latest = getLatestInspection(printer.id, inspections);
  const status = calculatePrinterStatus(printer, inspections);
  const badge = getStatusBadgeInfo(status);

  const handleCopyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!printer.ip) return;
    navigator.clipboard.writeText(printer.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConnectionIcon = () => {
    switch (printer.connectionType) {
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5 text-blue-500" />;
      case 'usb':
        return <Usb className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ethernet':
      default:
        return <EthernetPort className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-4 relative group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {printer.sector}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                {getConnectionIcon()}
                <span className="capitalize">{printer.connectionType || 'Ethernet'}</span>
              </span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug break-words">
              {printer.name}
            </h3>

            {printer.model && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {printer.model}
              </p>
            )}
          </div>

          {/* Status Badge & Actions Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${badge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>

            {/* Menu trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Opções da impressora"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 divide-y divide-slate-100">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDiagnose(printer);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Diagnóstico / Teste de Rede
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onViewHistory(printer.id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Histórico desta impressora
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(printer);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        Editar Cadastro
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(printer.id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir Impressora
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* IP and Serial Info row */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-400">IP:</span>
            {printer.ip ? (
              <div className="flex items-center gap-1 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                <span>{printer.ip}</span>
                <button
                  type="button"
                  onClick={handleCopyIp}
                  className="text-slate-400 hover:text-slate-700 ml-1 p-0.5"
                  title="Copiar IP"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={`http://${printer.ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 p-0.5"
                  title="Abrir página web da impressora"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <span className="text-slate-400 italic">Não configurado</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-400">Série:</span>
            <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 truncate">
              {printer.serial || '—'}
            </span>
            {printer.patrimony && (
              <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                Patr: {printer.patrimony}
              </span>
            )}
          </div>
        </div>

        {/* Notes preview if available */}
        {printer.notes && (
          <p className="mt-2 text-[11px] text-slate-500 bg-slate-50/70 p-2 rounded-lg border border-slate-100 line-clamp-2">
            💡 {printer.notes}
          </p>
        )}

        {/* Latest Inspection preview */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Última vistoria:
            </span>
            <span className="font-semibold text-slate-800">
              {latest ? formatDateBR(latest.date) : 'Nunca inspecionada'}
            </span>
          </div>

          {latest ? (
            <div className="mt-1.5 text-xs flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">
                  Técnico: <strong className="text-slate-700 font-semibold">{latest.tech || 'Não informado'}</strong>
                </span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {latest.result}
                </span>
              </div>
              {latest.problemType && latest.problemType !== 'Nenhum' && (
                <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mt-0.5 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{latest.problemType}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-amber-700 font-medium">
              Ainda não possui checklist registrado.
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onInspect(printer.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-600/20 active:scale-98"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Inspecionar</span>
        </button>

        <button
          onClick={() => onViewHistory(printer.id)}
          className="inline-flex items-center justify-center py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Ver histórico de inspeções"
        >
          Histórico
        </button>
      </div>
    </div>
  );
};
