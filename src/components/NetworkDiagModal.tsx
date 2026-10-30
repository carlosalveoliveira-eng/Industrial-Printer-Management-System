import React, { useState } from 'react';
import { Printer } from '../types/printer';
import { 
  X, 
  Activity, 
  Check, 
  ExternalLink, 
  Copy, 
  Terminal, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface NetworkDiagModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkDiagModal: React.FC<NetworkDiagModalProps> = ({
  printer,
  isOpen,
  onClose,
}) => {
  const [pingRunning, setPingRunning] = useState(false);
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [testPrintSent, setTestPrintSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !printer) return null;

  const handleCopyIp = () => {
    if (!printer.ip) return;
    navigator.clipboard.writeText(printer.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulatedPing = () => {
    if (!printer.ip) return;
    setPingRunning(true);
    setPingLogs([`Disparando contra ${printer.ip} com 32 bytes de dados:`]);

    setTimeout(() => {
      setPingLogs(prev => [...prev, `Resposta de ${printer.ip}: bytes=32 tempo=2ms TTL=64`]);
    }, 400);

    setTimeout(() => {
      setPingLogs(prev => [...prev, `Resposta de ${printer.ip}: bytes=32 tempo=1ms TTL=64`]);
    }, 800);

    setTimeout(() => {
      setPingLogs(prev => [...prev, `Resposta de ${printer.ip}: bytes=32 tempo=3ms TTL=64`]);
    }, 1200);

    setTimeout(() => {
      setPingLogs(prev => [
        ...prev,
        `Resposta de ${printer.ip}: bytes=32 tempo=2ms TTL=64`,
        `Estatísticas do Ping para ${printer.ip}:`,
        `    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda),`,
        `    Porta 9100 (RAW/ZPL): ABERTA (Escutando spooler)`,
        `    Porta 80 (HTTP Web): ABERTA (Interface ativa)`
      ]);
      setPingRunning(false);
    }, 1600);
  };

  const handleSendTestCommand = () => {
    setTestPrintSent(true);
    setTimeout(() => setTestPrintSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Diagnóstico de Rede</h2>
              <p className="text-xs text-slate-400">
                Verificação de conectividade e portas de impressão
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
        <div className="p-5 space-y-4 text-xs">
          {/* Target Printer Header */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm text-slate-900 block font-bold">{printer.name}</strong>
                <span className="text-slate-500">Setor: {printer.sector} • {printer.model || 'Térmica'}</span>
              </div>
              {printer.ip && (
                <a
                  href={`http://${printer.ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Web</span>
                </a>
              )}
            </div>

            {/* IP info */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/80">
              <span className="font-semibold text-slate-600">Endereço IP Configurado:</span>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                <span>{printer.ip || 'Não configurado'}</span>
                {printer.ip && (
                  <button
                    onClick={handleCopyIp}
                    className="text-slate-400 hover:text-slate-700 ml-1 p-0.5"
                    title="Copiar IP"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostics Actions */}
          {printer.ip ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={runSimulatedPing}
                  disabled={pingRunning}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{pingRunning ? 'Testando Conexão...' : 'Executar Teste de Ping'}</span>
                </button>

                <button
                  onClick={handleSendTestCommand}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Simular envio de comando RAW (ZPL/EPL) de teste"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Comando Teste</span>
                </button>
              </div>

              {testPrintSent && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comando de teste de impressão enviado com sucesso para a porta 9100!</span>
                </div>
              )}

              {/* Console log box */}
              {pingLogs.length > 0 && (
                <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto border border-slate-800">
                  {pingLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}

              {/* Ports info table */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Portas de Comunicação Padrão
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500">Porta 9100 (RAW):</span>
                    <strong className="text-emerald-700 font-mono">Disponível</strong>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500">Porta 80 (HTTP):</span>
                    <strong className="text-emerald-700 font-mono">Disponível</strong>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500">Porta 515 (LPR):</span>
                    <strong className="text-slate-600 font-mono">Opcional</strong>
                  </div>
                  <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500">Porta 161 (SNMP):</span>
                    <strong className="text-slate-600 font-mono">Ativa</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Endereço IP não informado</strong>
                <p className="mt-0.5">
                  Para realizar testes de ping e diagnóstico remoto, edite o cadastro desta impressora e informe o IP fixo da bancada.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
