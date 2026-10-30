import React, { useState } from 'react';
import { loginWithUsernameAndPassword } from '../services/firebase';
import { Printer, Lock, User, LogIn, AlertCircle, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Por favor, digite seu nome de usuário.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await loginWithUsernameAndPassword(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-blue-600/25 border border-blue-400/30">
            <Printer className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sistema de Gestão e Inspeção de Impressoras
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            Acesso Restrito • Gestão de Ativos e Vistorias Industriais
          </p>
        </div>

        {/* Clean Login Box */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuário */}
            <div>
              <label htmlFor="login-username" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Mensagem de Erro Clara */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Botão Entrar & Indicador de Carregamento */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="mt-5 text-center text-[11px] text-slate-400 space-y-1">
          <p>🔒 Autenticação protegida via Cloud Firestore e Firebase Auth (Plano Spark).</p>
          <p>As senhas não são armazenadas em texto puro no banco de dados.</p>
        </div>
      </div>
    </div>
  );
};
