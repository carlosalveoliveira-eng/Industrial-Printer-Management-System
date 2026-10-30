import React, { useState } from 'react';
import { Inspection, Printer } from '../types/printer';
import { formatDateBR, formatDateTimeBR, formatWhatsAppMessage } from '../utils/exportUtils';
import { 
  X, 
  Printer as PrinterIcon, 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  PrinterCheck,
  FileText
} from 'lucide-react';

interface InspectionDetailModalProps {
  inspection: Inspection | null;
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (inspectionId: string) => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  inspection,
  printer,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !inspection) return null;

  const handleCopyReport = () => {
    if (!printer) return;
    const text = decodeURIComponent(formatWhatsAppMessage(printer, inspection)).replace(/\*/g, '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareWhatsApp = () => {
    if (!printer) return;
    const encoded = formatWhatsAppMessage(printer, inspection);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const getResultBadgeStyle = (result: string) => {
    switch (result) {
      case 'Funcionando':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Funcionando com ressalva':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Requer manutenção':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Fora de operação':
        return 'bg-red-200 text-red-950 border-red-400';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PrinterCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Laudo da Inspeção</h2>
              <p className="text-xs text-slate-400">
                Registrado em {formatDateBR(inspection.date)} • {inspection.tech || 'Técnico não informado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Printer Context Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {printer ? printer.sector : 'Setor não informado'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {printer ? printer.name : 'Impressora excluída'}
                </h3>
                <p className="text-xs text-slate-500">
                  {printer?.model || 'Modelo padrão'} {printer?.ip ? `• IP: ${printer.ip}` : ''} {printer?.serial ? `• Serial: ${printer.serial}` : ''}
                </p>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${getResultBadgeStyle(inspection.result)}`}>
                {inspection.result}
              </span>
            </div>
          </div>

          {/* Checklist Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Status dos Componentes Verificados
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Liga normalmente:</span>
                <strong className={`font-bold ${inspection.power === 'Sim' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {inspection.power === 'Sim' ? '✓ Sim' : '✕ Não'}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Imprime:</span>
                <strong className={`font-bold ${inspection.printing === 'Sim' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {inspection.printing}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Qualidade da mídia:</span>
                <strong className={`font-bold ${inspection.quality === 'Boa' ? 'text-emerald-700' : inspection.quality === 'Regular' ? 'text-amber-700' : 'text-rose-700'}`}>
                  {inspection.quality}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Estado físico:</span>
                <strong className={`font-bold ${inspection.physical === 'Bom' ? 'text-emerald-700' : inspection.physical === 'Regular' ? 'text-amber-700' : 'text-rose-700'}`}>
                  {inspection.physical}
                </strong>
              </div>
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-600 block mb-0.5">Tipo de Problema:</span>
              <span className={`font-semibold ${inspection.problemType !== 'Nenhum' ? 'text-rose-700' : 'text-slate-800'}`}>
                {inspection.problemType || 'Nenhum'}
              </span>
            </div>

            {inspection.errorMessage && (
              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-900 block mb-0.5">Defeito / Mensagem de Erro:</span>
                <p className="text-rose-800 whitespace-pre-wrap">{inspection.errorMessage}</p>
              </div>
            )}

            {inspection.actionNeeded && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-0.5">Ação Realizada ou Necessária:</span>
                <p className="text-blue-800 whitespace-pre-wrap">{inspection.actionNeeded}</p>
              </div>
            )}

            {inspection.observations && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Observações Adicionais:</span>
                <p className="text-slate-600 whitespace-pre-wrap">{inspection.observations}</p>
              </div>
            )}
          </div>

          {/* Evidence photo if present */}
          {inspection.photoUrl && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Foto de Evidência Anexada:
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={inspection.photoUrl}
                  alt="Evidência do teste"
                  className="w-full max-h-56 object-contain"
                />
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Prioridade: <strong className="text-slate-600">{inspection.priority}</strong></span>
            <span>Gravado: {formatDateTimeBR(inspection.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              title="Compartilhar laudo pelo WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(inspection.id)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              title="Excluir este laudo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
