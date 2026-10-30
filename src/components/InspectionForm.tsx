import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Inspection, 
  InspectionPower, 
  InspectionPrinting, 
  InspectionQuality, 
  InspectionPhysical, 
  PriorityLevel, 
  InspectionResult 
} from '../types/printer';
import { getTodayDateString } from '../utils/exportUtils';
import { 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  X, 
  Printer as PrinterIcon, 
  Calendar, 
  User, 
  HelpCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface InspectionFormProps {
  printers: Printer[];
  initialPrinterId?: string;
  defaultTech: string;
  onSave: (inspection: Omit<Inspection, 'id' | 'createdAt'>, saveAnother?: boolean) => void;
  onCancel: () => void;
  onUpdateDefaultTech: (tech: string) => void;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({
  printers,
  initialPrinterId,
  defaultTech,
  onSave,
  onCancel,
  onUpdateDefaultTech,
}) => {
  const [printerId, setPrinterId] = useState<string>(initialPrinterId || (printers[0]?.id ?? ''));
  const [date, setDate] = useState<string>(getTodayDateString());
  const [tech, setTech] = useState<string>(defaultTech || '');
  const [power, setPower] = useState<InspectionPower>('Sim');
  const [printing, setPrinting] = useState<InspectionPrinting>('Sim');
  const [quality, setQuality] = useState<InspectionQuality>('Boa');
  const [physical, setPhysical] = useState<InspectionPhysical>('Bom');
  const [problemType, setProblemType] = useState<string>('Nenhum');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [actionNeeded, setActionNeeded] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('Média');
  const [result, setResult] = useState<InspectionResult>('Funcionando');
  const [observations, setObservations] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialPrinterId if passed
  useEffect(() => {
    if (initialPrinterId) {
      setPrinterId(initialPrinterId);
    } else if (!printerId && printers.length > 0) {
      setPrinterId(printers[0].id);
    }
  }, [initialPrinterId, printers]);

  // Selected printer info
  const selectedPrinter = printers.find(p => p.id === printerId);

  // Intelligent warning & auto-adjustment logic
  const handlePowerChange = (val: InspectionPower) => {
    setPower(val);
    if (val === 'Não') {
      setPrinting('Não');
      setQuality('Ruim');
      if (problemType === 'Nenhum') setProblemType('Não liga');
      setResult('Fora de operação');
      setPriority('Alta');
    }
  };

  const handlePrintingChange = (val: InspectionPrinting) => {
    setPrinting(val);
    if (val === 'Não') {
      if (problemType === 'Nenhum') setProblemType('Falha de impressão');
      setResult('Requer manutenção');
      if (priority === 'Baixa') setPriority('Média');
    }
  };

  const handleQualityChange = (val: InspectionQuality) => {
    setQuality(val);
    if (val === 'Ruim') {
      if (problemType === 'Nenhum') setProblemType('Etiqueta com baixa qualidade');
      if (result === 'Funcionando') setResult('Requer manutenção');
    } else if (val === 'Regular' && result === 'Funcionando') {
      setResult('Funcionando com ressalva');
    }
  };

  // Quick Preset Actions
  const applyPreset100Ok = () => {
    setPower('Sim');
    setPrinting('Sim');
    setQuality('Boa');
    setPhysical('Bom');
    setProblemType('Nenhum');
    setErrorMessage('');
    setActionNeeded('Limpeza preventiva de rotina concluída. Sem pendências.');
    setPriority('Baixa');
    setResult('Funcionando');
  };

  const applyPresetSensorIssue = () => {
    setPower('Sim');
    setPrinting('Não');
    setQuality('Regular');
    setPhysical('Bom');
    setProblemType('Problema com sensor');
    setErrorMessage('Sensor de gap / marca preta descalibrado. LED de mídia piscando.');
    setActionNeeded('Necessária calibração do sensor e verificação do alinhamento do rolo.');
    setPriority('Alta');
    setResult('Requer manutenção');
  };

  const applyPresetRibbonIssue = () => {
    setPower('Sim');
    setPrinting('Sim');
    setQuality('Ruim');
    setPhysical('Bom');
    setProblemType('Problema com ribbon/fita');
    setErrorMessage('Ribbon enrugando ou travando no rebobinador. Riscos na impressão.');
    setActionNeeded('Ajuste de pressão do cabeçote e troca do tubete de ribbon.');
    setPriority('Média');
    setResult('Funcionando com ressalva');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma foto de até 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent, saveAnother = false) => {
    e.preventDefault();

    if (!printerId) {
      alert('Por favor, selecione uma impressora.');
      return;
    }

    if (tech.trim()) {
      onUpdateDefaultTech(tech.trim());
    }

    onSave({
      printerId,
      date,
      tech: tech.trim(),
      power,
      printing,
      quality,
      physical,
      problemType,
      errorMessage: errorMessage.trim(),
      actionNeeded: actionNeeded.trim(),
      priority,
      result,
      observations: observations.trim(),
      photoUrl,
    }, saveAnother);

    if (saveAnother) {
      // Reset form but keep tech and date
      setPower('Sim');
      setPrinting('Sim');
      setQuality('Boa');
      setPhysical('Bom');
      setProblemType('Nenhum');
      setErrorMessage('');
      setActionNeeded('');
      setPriority('Média');
      setResult('Funcionando');
      setObservations('');
      setPhotoUrl(undefined);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header and Quick Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <CheckSquare className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Checklist de Inspeção Técnica</h2>
                <p className="text-xs text-slate-500">Valide os componentes e registre anomalias</p>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Preenchimento:
            </span>
            <button
              type="button"
              onClick={applyPreset100Ok}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Preencher como 100% funcionando"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% OK
            </button>
            <button
              type="button"
              onClick={applyPresetSensorIssue}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
              title="Preencher com erro comum de sensor"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Sensor Gap
            </button>
            <button
              type="button"
              onClick={applyPresetRibbonIssue}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 transition-colors shadow-2xs"
              title="Preencher com falha de ribbon"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Ribbon
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-5 space-y-5">
          {/* Printer Selection */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Impressora em Inspeção *</span>
              {selectedPrinter && (
                <span className="text-slate-500 font-normal normal-case">
                  Setor: <strong>{selectedPrinter.sector}</strong> {selectedPrinter.ip ? `• IP: ${selectedPrinter.ip}` : ''}
                </span>
              )}
            </label>
            <select
              value={printerId}
              onChange={(e) => setPrinterId(e.target.value)}
              required
              className="w-full h-11 px-3 text-sm font-medium bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="" disabled>Selecione a impressora da lista</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sector}] {p.name} {p.ip ? `— IP ${p.ip}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data da Inspeção *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Técnico Responsável
              </label>
              <input
                type="text"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                placeholder="Ex.: Carlos Silva"
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Core Technical Checklist Cards */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verificações de Campo
            </h3>

            {/* 1. Liga? */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. A impressora liga normalmente? (Fonte / LEDs)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Sim', 'Não'] as InspectionPower[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePowerChange(val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      power === val
                        ? val === 'Sim'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{val === 'Sim' ? '✓ Sim, liga' : '✕ Não liga'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Imprime? */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                2. Imprime corretamente? (Avanço de mídia e tração)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Sim', 'Não', 'Não testado'] as InspectionPrinting[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePrintingChange(val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center text-center ${
                      printing === val
                        ? val === 'Sim'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : val === 'Não'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{val === 'Sim' ? '✓ Sim' : val === 'Não' ? '✕ Não' : '— Não testado'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Qualidade da impressão */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                3. Qualidade da etiqueta / código de barras
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Boa', 'Regular', 'Ruim'] as InspectionQuality[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQualityChange(val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                      quality === val
                        ? val === 'Boa'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : val === 'Regular'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{val}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Estado físico */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                4. Estado físico geral (Carcaça, travas, rolete, cabos)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Bom', 'Regular', 'Ruim'] as InspectionPhysical[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPhysical(val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                      physical === val
                        ? val === 'Bom'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : val === 'Regular'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{val}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Classification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Problema Encontrado / Categoria de Defeito
            </label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Nenhum">Nenhum (Tudo funcionando)</option>
              <option value="Falha de impressão">Falha de impressão (linhas brancas / riscos)</option>
              <option value="Etiqueta com baixa qualidade">Etiqueta com baixa qualidade / código ilegível</option>
              <option value="Erro no painel">Erro no painel / LEDs piscando em vermelho</option>
              <option value="Problema de conexão/rede">Problema de conexão/rede (IP inacessível / Spooler)</option>
              <option value="Não liga">Não liga / Fonte de alimentação sem energia</option>
              <option value="Problema com ribbon/fita">Problema com ribbon/fita (enrugamento / ruptura)</option>
              <option value="Problema com sensor">Problema com sensor (Gap / Marca preta desalinhada)</option>
              <option value="Problema mecânico">Problema mecânico / Rolete de tração danificado</option>
              <option value="Cabeça de impressão desgastada">Cabeça de impressão gasta ou com pontos queimados</option>
              <option value="Necessita limpeza/manutenção">Necessita limpeza preventiva com álcool isopropílico</option>
              <option value="Papel/mídia inadequada">Papel/mídia com tamanho ou formato inadequado</option>
              <option value="Outro">Outro (detalhar abaixo)</option>
            </select>
          </div>

          {/* Error Message & Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mensagem de Erro / Defeito Observado
              </label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                rows={3}
                placeholder="Ex.: Aviso 'Ribbon Out' no display, LED Pause aceso, código de barras falhado na lateral..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ação Realizada ou Necessária
              </label>
              <textarea
                value={actionNeeded}
                onChange={(e) => setActionNeeded(e.target.value)}
                rows={3}
                placeholder="Ex.: Limpeza do cabeçote com álcool isopropílico, calibração manual do sensor de gap, chamado RMA..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Priority & Overall Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prioridade de Tratamento
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Baixa">Baixa (Pode aguardar próxima rota)</option>
                <option value="Média">Média (Acompanhamento rotineiro)</option>
                <option value="Alta">Alta (Afeta expedição / faturamento)</option>
                <option value="Crítica">Crítica (Setor parado - Urgente)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resultado Final da Vistoria
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as InspectionResult)}
                className="w-full h-10 px-3 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Funcionando">Funcionando (100% Operacional)</option>
                <option value="Funcionando com ressalva">Funcionando com ressalva</option>
                <option value="Requer manutenção">Requer manutenção técnica</option>
                <option value="Fora de operação">Fora de operação (Inoperante)</option>
                <option value="Não testada">Não testada</option>
              </select>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações Complementares para o Próximo Técnico
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              placeholder="Ex.: Rolo de ribbon no final. Operador foi orientado a não puxar a etiqueta manualmente."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Photo Attachment (Optional) */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                Foto de Evidência / Etiqueta de Teste (Opcional)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Máx 2MB</span>
            </label>

            {photoUrl ? (
              <div className="relative inline-block border rounded-xl overflow-hidden shadow-xs">
                <img
                  src={photoUrl}
                  alt="Evidência da inspeção"
                  className="w-44 h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors"
                  title="Remover foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Anexar foto da etiqueta ou erro</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-600/30 active:scale-98 flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Salvar Inspeção</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors active:scale-98"
            >
              Salvar e Nova Inspeção
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
