import React, { useState } from 'react';
import { Inspection, Printer } from '../types/printer';
import { formatDateBR } from '../utils/exportUtils';
import { 
  Search, 
  FileSpreadsheet, 
  Layers, 
  Filter, 
  Eye, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar 
} from 'lucide-react';

interface HistoryListProps {
  inspections: Inspection[];
  printers: Printer[];
  selectedPrinterFilter?: string | null;
  onClearPrinterFilter?: () => void;
  onViewDetails: (inspection: Inspection) => void;
  onDeleteInspection: (inspectionId: string) => void;
  onExportCsv: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  inspections,
  printers,
  selectedPrinterFilter,
  onClearPrinterFilter,
  onViewDetails,
  onDeleteInspection,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const printerMap = new Map<string, Printer>();
  printers.forEach(p => printerMap.set(p.id, p));

  // Extract unique sectors
  const allSectors = Array.from(new Set(printers.map(p => p.sector))).filter(Boolean);

  const filtered = inspections.filter((insp) => {
    const printer = printerMap.get(insp.printerId);
    
    // Printer filter (if accessed via "Histórico desta impressora")
    if (selectedPrinterFilter && insp.printerId !== selectedPrinterFilter) {
      return false;
    }

    // Result filter
    if (resultFilter !== 'all' && insp.result !== resultFilter) {
      return false;
    }

    // Sector filter
    if (sectorFilter !== 'all' && printer?.sector !== sectorFilter) {
      return false;
    }

    // Search query
    const q = searchTerm.toLowerCase();
    const matchPrinter = printer?.name.toLowerCase().includes(q) || false;
    const matchSector = printer?.sector.toLowerCase().includes(q) || false;
    const matchIp = printer?.ip?.toLowerCase().includes(q) || false;
    const matchTech = insp.tech?.toLowerCase().includes(q) || false;
    const matchProblem = insp.problemType.toLowerCase().includes(q);
    const matchError = insp.errorMessage?.toLowerCase().includes(q) || false;
    const matchAction = insp.actionNeeded?.toLowerCase().includes(q) || false;
    const matchResult = insp.result.toLowerCase().includes(q);

    return matchPrinter || matchSector || matchIp || matchTech || matchProblem || matchError || matchAction || matchResult;
  });

  const targetPrinter = selectedPrinterFilter ? printerMap.get(selectedPrinterFilter) : null;

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Excel Export */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Histórico de Laudos e Vistorias
                </h2>
                <p className="text-xs text-slate-500">
                  {filtered.length} {filtered.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar para Excel (CSV)</span>
          </button>
        </div>

        {/* Active printer filter badge */}
        {targetPrinter && (
          <div className="mt-3 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
            <span className="text-xs text-blue-900 font-medium">
              Filtrando histórico de: <strong>{targetPrinter.name}</strong> ({targetPrinter.sector})
            </span>
            <button
              onClick={onClearPrinterFilter}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              Ver todas as impressoras
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              placeholder="Buscar por impressora, técnico, defeito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Todos os setores</option>
              {allSectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Todos os resultados</option>
              <option value="Funcionando">Funcionando</option>
              <option value="Funcionando com ressalva">Funcionando com ressalva</option>
              <option value="Requer manutenção">Requer manutenção</option>
              <option value="Fora de operação">Fora de operação</option>
              <option value="Não testada">Não testada</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-bold text-slate-700">Nenhum laudo encontrado</p>
          <p className="text-xs text-slate-500 mt-1">
            Tente alterar o termo de busca ou filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((insp) => {
            const printer = printerMap.get(insp.printerId);
            const isOk = insp.result === 'Funcionando';
            const isIssue = insp.result === 'Requer manutenção' || insp.result === 'Fora de operação';

            return (
              <div
                key={insp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {printer?.sector || 'Setor —'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateBR(insp.date)}
                    </span>
                    {insp.tech && (
                      <span className="text-xs text-slate-500">
                        • Técnico: <strong className="text-slate-700">{insp.tech}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {printer?.name || 'Impressora removida'}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border ${
                      isOk
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isIssue
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {isOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {insp.result}
                    </span>

                    {insp.problemType && insp.problemType !== 'Nenhum' && (
                      <span className="text-rose-700 font-medium">
                        Problema: {insp.problemType}
                      </span>
                    )}

                    <span className="text-slate-500">
                      Prioridade: <strong className="text-slate-700 font-medium">{insp.priority}</strong>
                    </span>
                  </div>

                  {insp.errorMessage && (
                    <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                      <strong className="text-slate-700">Defeito:</strong> {insp.errorMessage}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onViewDetails(insp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Laudo</span>
                  </button>

                  <button
                    onClick={() => onDeleteInspection(insp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir inspeção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
