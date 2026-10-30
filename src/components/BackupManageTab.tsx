import React, { useRef, useState } from 'react';
import { Printer, Inspection } from '../types/printer';
import { exportInspectionsToCSV, exportFullBackupJSON } from '../utils/exportUtils';
import { seedInitialPrintersIfEmpty } from '../services/firebase';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Database, 
  Trash2, 
  AlertCircle, 
  Check, 
  Info, 
  Printer as PrinterIcon,
  RotateCcw,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Globe
} from 'lucide-react';

interface BackupManageTabProps {
  printers: Printer[];
  inspections: Inspection[];
  defaultTech: string;
  onImportBackup: (data: { printers: Printer[]; inspections: Inspection[]; defaultTech?: string }) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
  onOpenPrintReport: () => void;
  canManage?: boolean;
}

export const BackupManageTab: React.FC<BackupManageTabProps> = ({
  printers,
  inspections,
  defaultTech,
  onImportBackup,
  onResetToDemoData,
  onClearAllData,
  onOpenPrintReport,
  canManage = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleExportCsv = () => {
    exportInspectionsToCSV(printers, inspections);
  };

  const handleExportJson = () => {
    exportFullBackupJSON({ printers, inspections, defaultTech });
  };

  const handleSeedPrinters = async () => {
    setSeeding(true);
    try {
      const count = await seedInitialPrintersIfEmpty();
      setImportStatus(`Base atualizada no Cloud Firestore com ${count} impressoras!`);
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      alert('Erro ao semear dados: ' + (err.message || String(err)));
    } finally {
      setSeeding(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || !Array.isArray(parsed.printers) || !Array.isArray(parsed.inspections)) {
        throw new Error('Formato de backup inválido.');
      }

      const confirmImport = window.confirm(
        `Deseja restaurar este backup no Cloud Firestore?\n\n` +
        `• Impressoras no arquivo: ${parsed.printers.length}\n` +
        `• Inspeções no arquivo: ${parsed.inspections.length}\n\n` +
        `Os dados serão compartilhados entre todos os dispositivos conectados.`
      );

      if (!confirmImport) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      onImportBackup(parsed);
      setImportStatus(`Backup importado com sucesso! (${parsed.printers.length} impressoras e ${parsed.inspections.length} laudos)`);
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      alert('Não foi possível importar o arquivo. Certifique-se de que é um backup JSON exportado por este sistema.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 pb-12 max-w-3xl mx-auto">
      {/* Cloud Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Banco Centralizado Cloud Firestore (Spark - Custo Zero)
            </h2>
            <p className="text-xs text-slate-500">
              Dados compartilhados em tempo real entre iPhone, Android e computadores da empresa
            </p>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block">Impressoras Conectadas</span>
            <strong className="text-xl font-black text-slate-900">{printers.length}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block">Laudos na Nuvem</span>
            <strong className="text-xl font-black text-slate-900">{inspections.length}</strong>
          </div>
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
            <span className="text-emerald-700 font-medium block">Plano Financeiro</span>
            <strong className="text-sm font-black text-emerald-950 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Gratuito (Spark)
            </strong>
          </div>
        </div>

        {/* Quick seed button for the 28 printers */}
        {canManage && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-slate-600">
              Ativos industriais da planta (ABATE, Desossa, Almoxarifado, etc.):
            </span>
            <button
              onClick={handleSeedPrinters}
              disabled={seeding}
              className="py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>Semear 28 Impressoras do PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Exportar para Relatórios e Planilhas Excel
        </h3>
        <p className="text-xs text-slate-500">
          Gere um arquivo CSV compatível com o Microsoft Excel do Brasil (com codificação UTF-8 BOM, ponto e vírgula e número de patrimônio).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportCsv}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar para Excel (CSV)</span>
          </button>

          <button
            onClick={onOpenPrintReport}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors flex items-center justify-center gap-2"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Visualizar Relatório de Frota (PDF/Imprimir)</span>
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Cópia de Segurança Completa (JSON)
        </h3>
        <p className="text-xs text-slate-500">
          Faça download de um backup offline completo para guardar no computador ou transferir de conta.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportJson}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Baixar Backup Completo (.json)</span>
          </button>

          {canManage && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Restaurar Backup (.json)</span>
              </button>
            </div>
          )}
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Free Tier Details Card */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-950">
          <Globe className="w-4 h-4 text-blue-600" />
          Como Esta Arquitetura Mantém Custo Zero Permanente
        </div>
        <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
          <li><strong>Firebase Spark:</strong> Plano oficial gratuito do Google sem cartão de crédito cadastrado.</li>
          <li><strong>50.000 leituras e 20.000 gravações gratuitas por dia:</strong> Uma fábrica com 28 impressoras realiza tipicamente 50 a 100 vistorias/dia, consumindo menos de 0,5% da cota gratuita diária.</li>
          <li><strong>1 GiB de armazenamento:</strong> Espaço suficiente para milhares de registros de texto estruturados.</li>
          <li><strong>Sem containers pagos:</strong> A aplicação funciona como Single Page Application no navegador, comunicando diretamente com o Firestore com cache offline nativo.</li>
        </ul>
      </div>

      {/* Danger Zone */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Área Administrativa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onResetToDemoData}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
              title="Restaura os 28 ativos e dados padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar 28 Ativos do PDF</span>
            </button>

            <button
              onClick={onClearAllData}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Limpar Registros Locais</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
