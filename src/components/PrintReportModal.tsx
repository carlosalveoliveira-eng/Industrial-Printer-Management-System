import React from 'react';
import { Printer, Inspection } from '../types/printer';
import { formatDateBR, calculatePrinterStatus, getLatestInspection, getStatusBadgeInfo } from '../utils/exportUtils';
import { X, Printer as PrinterIcon, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
  inspections: Inspection[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  printers,
  inspections,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatDateBR(new Date().toISOString().split('T')[0]);

  const total = printers.length;
  const pending = printers.filter(p => calculatePrinterStatus(p, inspections) === 'pending').length;
  const issues = printers.filter(p => calculatePrinterStatus(p, inspections) === 'issue').length;
  const ok = total - pending - issues;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Modal Controls (Hidden in print) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <PrinterIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold">Relatório Executivo da Frota de Impressoras</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 text-slate-900 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Suporte Técnico • Infraestrutura de TI
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Relatório de Vistoria de Impressoras
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Ativos de impressão térmica, códigos de barra e documentos fiscais
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 block">Data de Emissão:</span>
              <strong className="text-sm font-bold text-slate-900">{todayStr}</strong>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total</span>
              <strong className="text-xl font-bold text-slate-900">{total}</strong>
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-950">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Operacionais</span>
              <strong className="text-xl font-bold text-emerald-800">{ok}</strong>
            </div>
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-950">
              <span className="text-[11px] font-semibold text-amber-700 uppercase block">Pendentes</span>
              <strong className="text-xl font-bold text-amber-800">{pending}</strong>
            </div>
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-950">
              <span className="text-[11px] font-semibold text-rose-700 uppercase block">Com Defeito</span>
              <strong className="text-xl font-bold text-rose-800">{issues}</strong>
            </div>
          </div>

          {/* Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Detalhamento por Ativo e Setor
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Setor</th>
                    <th className="p-2.5">Impressora / Modelo</th>
                    <th className="p-2.5">IP / Série</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Última Vistoria</th>
                    <th className="p-2.5">Defeito / Ação Registrada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printers.map((p) => {
                    const latest = getLatestInspection(p.id, inspections);
                    const status = calculatePrinterStatus(p, inspections);
                    const badge = getStatusBadgeInfo(status);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-800 align-top">
                          {p.sector}
                        </td>
                        <td className="p-2.5 align-top">
                          <strong className="text-slate-900 block">{p.name}</strong>
                          <span className="text-slate-500 text-[11px]">{p.model || '—'}</span>
                        </td>
                        <td className="p-2.5 align-top font-mono text-[11px]">
                          <div>{p.ip || '—'}</div>
                          <span className="text-slate-400">{p.serial || ''}</span>
                        </td>
                        <td className="p-2.5 align-top">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-2.5 align-top">
                          {latest ? (
                            <div>
                              <strong className="block">{formatDateBR(latest.date)}</strong>
                              <span className="text-slate-500 text-[10px]">{latest.tech || 'Técnico'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pendente</span>
                          )}
                        </td>
                        <td className="p-2.5 align-top max-w-xs text-slate-700">
                          {latest ? (
                            <div>
                              {latest.problemType && latest.problemType !== 'Nenhum' && (
                                <strong className="text-rose-700 block text-[11px]">
                                  {latest.problemType}
                                </strong>
                              )}
                              <p className="text-[11px] text-slate-600 line-clamp-2">
                                {latest.actionNeeded || latest.errorMessage || latest.observations || 'Sem pendências'}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures for physical documentation */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 border-t border-slate-200 mt-8">
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
              <span>Assinatura do Técnico Responsável</span>
            </div>
            <div>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
              <span>Assinatura do Gestor do Setor / Operações</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
