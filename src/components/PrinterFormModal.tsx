import React, { useState, useEffect } from 'react';
import { Printer, ConnectionType } from '../types/printer';
import { X, Printer as PrinterIcon, Plus, Save, Network, Hash, Tag, Building } from 'lucide-react';

interface PrinterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (printerData: Omit<Printer, 'id' | 'createdAt'>, printerId?: string) => void;
  printerToEdit?: Printer | null;
}

const COMMON_SECTORS = [
  'Expedição',
  'Recebimento',
  'Almoxarifado',
  'Separação / Picking',
  'Produção',
  'Faturamento',
  'Logística',
  'Controle de Qualidade',
  'Laboratório',
  'Balcão / Atendimento'
];

const COMMON_MODELS = [
  'Zebra ZT230 (Industrial)',
  'Zebra ZT411 (Industrial)',
  'Zebra ZD220 (Desktop)',
  'Zebra ZD420 (Desktop)',
  'Elgin L42 Pro',
  'Argox OS-214 Plus',
  'Datamax E-Class Mark III',
  'Epson TM-T20X (Não-fiscal)',
  'HP LaserJet Pro M404n',
  'Brother TD-4520TN'
];

export const PrinterFormModal: React.FC<PrinterFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  printerToEdit,
}) => {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [model, setModel] = useState('');
  const [ip, setIp] = useState('');
  const [serial, setSerial] = useState('');
  const [patrimony, setPatrimony] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('ethernet');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (printerToEdit) {
      setName(printerToEdit.name || '');
      setSector(printerToEdit.sector || '');
      setModel(printerToEdit.model || '');
      setIp(printerToEdit.ip || '');
      setSerial(printerToEdit.serial || '');
      setPatrimony(printerToEdit.patrimony || '');
      setConnectionType(printerToEdit.connectionType || 'ethernet');
      setNotes(printerToEdit.notes || '');
    } else {
      setName('');
      setSector('');
      setModel('');
      setIp('');
      setSerial('');
      setPatrimony('');
      setConnectionType('ethernet');
      setNotes('');
    }
  }, [printerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sector.trim()) {
      alert('Por favor, preencha o Nome e o Setor da impressora.');
      return;
    }

    onSave({
      name: name.trim(),
      sector: sector.trim(),
      model: model.trim() || undefined,
      ip: ip.trim() || undefined,
      serial: serial.trim() || undefined,
      patrimony: patrimony.trim() || undefined,
      connectionType,
      notes: notes.trim() || undefined,
    }, printerToEdit?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PrinterIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {printerToEdit ? 'Editar Cadastro de Impressora' : 'Cadastrar Nova Impressora'}
              </h2>
              <p className="text-xs text-slate-400">
                Identificação física e configuração de rede
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              Nome / Identificação da Impressora *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Zebra ZT230 - Expedição 01"
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Setor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              Setor / Departamento *
            </label>
            <input
              type="text"
              required
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ex.: Expedição, Almoxarifado, Separação..."
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {/* Sector Suggestions Chips */}
            <div className="flex gap-1.5 flex-wrap mt-2">
              {COMMON_SECTORS.slice(0, 5).map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSector(sec)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200"
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <PrinterIcon className="w-3.5 h-3.5 text-blue-600" />
              Modelo do Equipamento
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex.: Zebra ZT230, Elgin L42 Pro..."
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {/* Model Suggestions */}
            <div className="flex gap-1.5 flex-wrap mt-2">
              {COMMON_MODELS.slice(0, 4).map((mod) => (
                <button
                  type="button"
                  key={mod}
                  onClick={() => setModel(mod)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200"
                >
                  {mod.split(' ')[0]} {mod.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* IP & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                Endereço IP
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Ex.: 192.168.1.100"
                className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                Número de Série
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Ex.: 53J1720042"
                className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Patrimônio / Inventário */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              Número de Inventário / Patrimônio
            </label>
            <input
              type="text"
              value={patrimony}
              onChange={(e) => setPatrimony(e.target.value)}
              placeholder="Ex.: NFBBRPR9311"
              className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Conexão */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tipo de Comunicação / Interface
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'ethernet', label: 'Ethernet' },
                { id: 'wifi', label: 'Wi-Fi' },
                { id: 'usb', label: 'USB' },
                { id: 'outro', label: 'Outro' },
              ].map((conn) => (
                <button
                  type="button"
                  key={conn.id}
                  onClick={() => setConnectionType(conn.id as ConnectionType)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                    connectionType === conn.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {conn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações / Localização */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações / Localização Física
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex.: Bancada 02 da expedição, conectada ao switch SW-PISO2 porta 14, tipo de ribbon 450m..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{printerToEdit ? 'Atualizar Dados' : 'Cadastrar Impressora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
