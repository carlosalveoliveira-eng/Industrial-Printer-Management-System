import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  Network, 
  CheckCircle2 
} from 'lucide-react';

interface GuideItem {
  id: string;
  title: string;
  category: 'Zebra' | 'Elgin' | 'Geral' | 'Rede';
  problem: string;
  solution: string[];
  tip?: string;
}

const GUIDES: GuideItem[] = [
  {
    id: 'zebra-calibrate',
    title: 'Calibração de Sensor (Zebra ZT230 / ZD220 / ZT411)',
    category: 'Zebra',
    problem: 'Impressora cospe várias etiquetas em branco, LED "Media" vermelho piscando ou pula etiquetas no meio do lote.',
    solution: [
      'Abra a tampa e certifique-se de que as guias de mídia amarelas estão ajustadas na largura exata da etiqueta sem amassar.',
      'Verifique se o sensor de mídia (LED móvel) está posicionado exatamente onde passa o gap (espaço entre etiquetas) ou a marca preta.',
      'Feche a tampa e trave os dois lados do cabeçote.',
      'Na ZT230/ZT411: Acesse o menu > Calibrate > Media and Ribbon > Pressione CALIBRATE.',
      'Nas desktops (ZD220/GK420): Com a impressora ligada, segure o botão FEED até o LED piscar 2 vezes consecutivas e solte. Ela avançará 2 a 3 etiquetas e calibrará automaticamente.',
    ],
    tip: 'Se continuar piscando, limpe a lente do fotossensor inferior e superior com um pincel antiestático ou ar comprimido para remover pó de papel.',
  },
  {
    id: 'printhead-clean',
    title: 'Limpeza de Cabeça Térmica e Linhas Brancas',
    category: 'Geral',
    problem: 'Riscos verticais brancos contínuos no código de barras, falha de leitura no scanner óptico ou impressão fosca/apagada.',
    solution: [
      'Desligue a impressora da tomada antes de iniciar a limpeza.',
      'Utilize uma caneta de limpeza térmica ou algodão/gaze umedecido em Álcool Isopropílico 99.8%.',
      'Passe suavemente sobre a linha marrom/escura dos micropontos térmicos da esquerda para a direita, sem fazer pressão excessiva.',
      'Aguarde 1 minuto para o álcool evaporar completamente antes de religar.',
      'Inspecione o rolete de borracha (platen roller): se houver cola ou sujeira acumulada, limpe-o também para garantir tração uniforme.',
    ],
    tip: 'Nunca utilize objetos metálicos, estiletes ou álcool comum 70% (contém água que oxida os contatos).',
  },
  {
    id: 'ribbon-wrinkle',
    title: 'Ribbon Enrugando / Linhas Diagonais na Etiqueta',
    category: 'Geral',
    problem: 'O ribbon (fita preta) forma dobras/vincos durante a impressão, cortando partes do texto e gerando ruído de estalo.',
    solution: [
      'Verifique se a largura do ribbon é ligeiramente maior que a largura da etiqueta (ex.: etiqueta de 100mm exige ribbon de 110mm).',
      'Confira se os tubetes de papelão de suprimento e recolhimento estão alinhados nas travas plásticas.',
      'Ajuste o controle de pressão da cabeça de impressão (knobs na ZT230/ZT411): equilibre a pressão entre o lado esquerdo e direito.',
      'Reduza a temperatura (Darkness) no driver do Windows ou software de impressão. Calor excessivo enruga a fita de poliéster.',
    ],
    tip: 'Ribbon cera/resina suporta velocidades mais altas com menos temperatura do que ribbon 100% resina.',
  },
  {
    id: 'elgin-calibrate',
    title: 'Calibração de Sensor Elgin L42 Pro',
    category: 'Elgin',
    problem: 'Impressora Elgin não reconhece o início da etiqueta e trava com LED piscando em roxo/vermelho.',
    solution: [
      'Desligue a impressora na chave traseira.',
      'Mantenha pressionado o botão FEED no painel frontal.',
      'Ligue a chave traseira mantendo o botão FEED pressionado.',
      'Aguarde o LED piscar 3 vezes na cor laranja/âmbar e solte o botão imediatamente.',
      'A impressora entrará em modo de auto-calibração, avançando cerca de 3 etiquetas e pausando com o LED em Verde contínuo.',
    ],
    tip: 'Certifique-se de que o sensor ajustável deslizante no fundo da impressora esteja alinhado com o centro das etiquetas.',
  },
  {
    id: 'network-spooler',
    title: 'Impressora em Rede Offline / Fila de Impressão Travada',
    category: 'Rede',
    problem: 'Documentos enviados pelo ERP/sistema ficam acumulados na fila do Windows com status "Erro - Imprimindo".',
    solution: [
      'Teste a conectividade física: verifique os LEDs verde/laranja na porta RJ-45 da impressora.',
      'Pressione o botão de diagnóstico de rede aqui no painel ou abra o prompt de comando: "ping 192.168.x.x".',
      'No computador do usuário, abra os Serviços do Windows (services.msc) e reinicie o serviço "Spooler de Impressão" (Print Spooler).',
      'Verifique se a impressora está configurada com IP Fixo/Estático ou reserva de DHCP no roteador/switch para não trocar de endereço.',
      'Porta padrão de comunicação RAW com impressoras térmicas é a porta TCP 9100.',
    ],
    tip: 'Caso precise reimprimir uma etiqueta de configuração com o IP atual, segure o botão Cancel/Feed durante a inicialização.',
  },
];

export const TroubleshootingGuide: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('zebra-calibrate');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredGuides = categoryFilter === 'all' 
    ? GUIDES 
    : GUIDES.filter(g => g.category === categoryFilter);

  return (
    <div className="space-y-4 pb-12 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Guia Técnico de Suporte a Impressoras
            </h2>
            <p className="text-xs text-slate-500">
              Instruções de calibração, manutenção rápida de cabeçote e resolução de falhas comuns
            </p>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex gap-1.5 flex-wrap mt-3.5">
          {['all', 'Zebra', 'Elgin', 'Geral', 'Rede'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'all' ? 'Todos os Guias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion guides */}
      <div className="space-y-3">
        {filteredGuides.map((guide) => {
          const isOpen = openId === guide.id;
          return (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(guide.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-rose-700 mt-1 font-medium">
                    ⚠️ {guide.problem}
                  </p>
                </div>
                <div className="p-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-700 space-y-3 bg-slate-50/50">
                  <div className="space-y-2 mt-2">
                    <strong className="text-slate-900 block font-bold text-xs uppercase tracking-wider">
                      Passo a Passo de Solução:
                    </strong>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 leading-relaxed">
                      {guide.solution.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {guide.tip && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <strong className="font-bold">💡 Dica do Especialista:</strong> {guide.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
