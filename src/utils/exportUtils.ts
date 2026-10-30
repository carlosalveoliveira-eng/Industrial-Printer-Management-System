import { Inspection, Printer, PrinterStatus } from '../types/printer';

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '—';
  // Check if dateStr is YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatDateTimeBR(isoStr?: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return formatDateBR(isoStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return formatDateBR(isoStr);
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLatestInspection(printerId: string, inspections: Inspection[]): Inspection | undefined {
  return inspections
    .filter(i => i.printerId === printerId)
    .sort((a, b) => (b.date + (b.createdAt || '')).localeCompare(a.date + (a.createdAt || '')))[0];
}

export function calculatePrinterStatus(printer: Printer, inspections: Inspection[]): PrinterStatus {
  const latest = getLatestInspection(printer.id, inspections);
  if (!latest) return 'pending';
  
  if (
    latest.result === 'Requer manutenção' ||
    latest.result === 'Fora de operação' ||
    latest.power === 'Não' ||
    latest.printing === 'Não' ||
    latest.quality === 'Ruim' ||
    latest.priority === 'Crítica'
  ) {
    return 'issue';
  }
  
  if (latest.result === 'Funcionando com ressalva' || latest.quality === 'Regular' || latest.physical === 'Regular') {
    return 'warning';
  }
  
  return 'ok';
}

export function getStatusBadgeInfo(status: PrinterStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Pendente', bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' };
    case 'issue':
      return { label: 'Com problema', bg: 'bg-red-100 text-red-900 border-red-300', dot: 'bg-red-600' };
    case 'warning':
      return { label: 'Com ressalva', bg: 'bg-orange-100 text-orange-900 border-orange-300', dot: 'bg-orange-500' };
    case 'ok':
    default:
      return { label: 'Funcionando', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' };
  }
}

function csvEscape(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportInspectionsToCSV(printers: Printer[], inspections: Inspection[]) {
  const printerMap = new Map<string, Printer>();
  printers.forEach(p => printerMap.set(p.id, p));

  const headers = [
    'Data da Inspeção',
    'Horário de Registro',
    'Técnico Responsável',
    'Setor / Departamento',
    'Nome da Impressora',
    'Modelo',
    'Endereço IP',
    'Número de Série',
    'Patrimônio / Inventário',
    'Tipo de Conexão',
    'A Impressora Liga?',
    'Imprime Corretamente?',
    'Qualidade da Impressão',
    'Estado Físico',
    'Tipo de Problema',
    'Mensagem de Erro / Defeito',
    'Ação Realizada / Necessária',
    'Nível de Prioridade',
    'Resultado Final',
    'Observações do Checklist'
  ];

  const sortedInspections = [...inspections].sort((a, b) => 
    (b.date + (b.createdAt || '')).localeCompare(a.date + (a.createdAt || ''))
  );

  const rows = sortedInspections.map(insp => {
    const printer = printerMap.get(insp.printerId);
    return [
      formatDateBR(insp.date),
      formatDateTimeBR(insp.createdAt),
      insp.tech || 'Não informado',
      printer ? printer.sector : 'Impressora excluída',
      printer ? printer.name : '—',
      printer ? printer.model || '—' : '—',
      printer ? printer.ip || '—' : '—',
      printer ? printer.serial || '—' : '—',
      printer ? printer.patrimony || '—' : '—',
      printer ? printer.connectionType || '—' : '—',
      insp.power,
      insp.printing,
      insp.quality,
      insp.physical,
      insp.problemType,
      insp.errorMessage || 'Nenhum',
      insp.actionNeeded || 'Nenhuma',
      insp.priority,
      insp.result,
      insp.observations || ''
    ];
  });

  // UTF-8 BOM is required for Excel to recognize UTF-8 special characters (ç, ã, é, etc.)
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.map(csvEscape).join(';'),
    ...rows.map(row => row.map(csvEscape).join(';'))
  ].join('\r\n');

  downloadBlob(
    new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
    `inspecoes_impressoras_${getTodayDateString()}.csv`
  );
}

export function exportFullBackupJSON(data: { printers: Printer[]; inspections: any; defaultTech?: string }) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(
    new Blob([json], { type: 'application/json;charset=utf-8;' }),
    `backup_impressoras_${getTodayDateString()}.json`
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function formatWhatsAppMessage(printer: Printer, inspection: Inspection): string {
  const dateFormatted = formatDateBR(inspection.date);
  return encodeURIComponent(
`📋 *LAUDO DE INSPEÇÃO TÉCNICA*
🖨️ *Impressora:* ${printer.name}
🏢 *Setor:* ${printer.sector}
🌐 *IP:* ${printer.ip || 'Não configurado'}
📅 *Data:* ${dateFormatted}
👤 *Técnico:* ${inspection.tech || 'Não informado'}

⚡ *Liga:* ${inspection.power}
🖨️ *Imprime:* ${inspection.printing}
✨ *Qualidade:* ${inspection.quality}
📦 *Estado Físico:* ${inspection.physical}

⚠️ *Problema:* ${inspection.problemType}
${inspection.errorMessage ? `🔍 *Defeito Relatado:* ${inspection.errorMessage}\n` : ''}${inspection.actionNeeded ? `🛠️ *Ação Realizada/Necessária:* ${inspection.actionNeeded}\n` : ''}🚨 *Prioridade:* ${inspection.priority}
📊 *Resultado:* ${inspection.result}
${inspection.observations ? `📝 *Observações:* ${inspection.observations}\n` : ''}
_Registrado via Painel de Inspeção de Impressoras_`
  );
}
