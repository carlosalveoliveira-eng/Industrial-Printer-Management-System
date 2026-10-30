import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone, Check, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone mode or dismissed by the user, don't show the floating banner
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only render if Android/Desktop prompt is ready OR if running on iOS/iPadOS browser
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-800/50 text-white px-3 sm:px-4 py-2.5 shadow-md relative z-30 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-blue-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>Instalar aplicativo Gestão Impressoras</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded hidden sm:inline">PWA</span>
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                {isIOS
                  ? 'Acesso rápido direto da tela de início com suporte offline.'
                  : 'Funciona como app nativo em tela cheia no computador, celular e tablet.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Instalando...' : 'Instalar aplicativo'}</span>
              </button>
            )}

            {isIOS && (
              <button
                type="button"
                onClick={() => setShowIOSModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Como Instalar no iOS</span>
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              title="Dispensar aviso de instalação"
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Instalar no iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">Atalho nativo via Safari</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              No sistema iOS, o Safari permite adicionar o sistema como aplicativo de tela cheia sem precisar da App Store:
            </p>

            <div className="space-y-2.5 text-xs bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-slate-200">
                  Toque no botão <strong className="text-white">Compartilhar</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-400 mb-0.5" />) na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-slate-200">
                  Role a lista e selecione <strong className="text-white">Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mb-0.5" />).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-slate-200">
                  Confirme em <strong className="text-white">Adicionar</strong> no canto superior direito.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span>O ícone ficará disponível na sua tela de início e abrirá em modo app completo.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
