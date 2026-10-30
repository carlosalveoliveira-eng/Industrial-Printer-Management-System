import React, { useState } from 'react';
import { UserRole } from '../types/printer';
import { logoutUser, changeCurrentUserPassword } from '../services/firebase';
import { X, Shield, User, LogOut, CheckCircle2, AlertCircle, KeyRound, Lock, Check } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onRoleChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logoutUser();
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPasswordSuccess(null);

    try {
      await changeCurrentUserPassword(newPassword);
      setPasswordSuccess('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Perfil e Segurança</h2>
              <p className="text-[11px] text-slate-400">Controle de acesso e credenciais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {currentUser ? (
            <div className="space-y-4">
              {/* User details card */}
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-sm">
                      {currentUser.email?.replace('@gestao-impressoras.local', '') || 'tiadmin'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-blue-900/80 text-blue-300 border border-blue-700/60">
                    {currentRole === 'admin' ? 'Administrador' : currentRole === 'tech' ? 'Técnico' : 'Consulta'}
                  </span>
                </div>
                <div className="mt-2 text-[11px] space-y-0.5 text-slate-400">
                  <p>Identificador: {currentUser.email || 'Conta Corporativa'}</p>
                  <p>Status: Autenticado e sincronizado com Cloud Firestore</p>
                </div>
              </div>

              {/* Change Password Section */}
              <form onSubmit={handleChangePassword} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alterar Senha de Acesso</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nova Senha:</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Confirmar Nova Senha:</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                {passwordSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Salvando...' : 'Atualizar Senha'}</span>
                </button>
              </form>

              {/* Role selection if Admin */}
              {currentRole === 'admin' && (
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <span className="font-bold text-slate-300 block mb-1.5 text-[11px]">
                    Simular Perfil de Acesso (Modo Admin):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['admin', 'tech', 'viewer'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onRoleChange(r)}
                        className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-center text-xs ${
                          currentRole === r
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {r === 'admin' ? 'Admin' : r === 'tech' ? 'Técnico' : 'Consulta'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-rose-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400">
              <p>Nenhuma sessão autenticada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
