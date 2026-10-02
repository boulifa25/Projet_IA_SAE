import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, AlertCircle, KeyRound, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usersApi, ApiError, type UserResponse, type Role } from '@/lib/api';

const roleLabels: Record<Role, string> = {
  ETUDIANT: 'Étudiant',
  ENSEIGNANT: 'Enseignant',
  ENTREPRISE: 'Entreprise',
  ADMINISTRATEUR: 'Administrateur',
};

const roleBadgeClasses: Record<Role, string> = {
  ETUDIANT: 'bg-primary-50 text-primary-700 border-primary-200',
  ENSEIGNANT: 'bg-violet-50 text-violet-700 border-violet-200',
  ENTREPRISE: 'bg-accent-50 text-accent-700 border-accent-200',
  ADMINISTRATEUR: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function UtilisateursAdmin() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [resetTarget, setResetTarget] = useState<UserResponse | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setUsers(await usersApi.tous(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = users.filter((u) => {
    const matchSearch =
      `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 flex-1 min-w-[220px] focus-within:border-primary-300 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un email..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-primary-300"
        >
          <option value="">Tous les rôles</option>
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <option key={r} value={r}>{roleLabels[r]}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Aucun utilisateur ne correspond à votre recherche.</p>
          ) : (
            filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {u.prenom[0]}{u.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{u.prenom} {u.nom}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${roleBadgeClasses[u.role]}`}>
                  {roleLabels[u.role]}
                </span>
                <button
                  onClick={() => setResetTarget(u)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50 shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Réinitialiser le mot de passe
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}
    </div>
  );
}

function ResetPasswordModal({ user, onClose }: { user: UserResponse; onClose: () => void }) {
  const { token } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      await usersApi.resetPassword(user.id, password, token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de réinitialiser ce mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Réinitialiser le mot de passe</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-6 space-y-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm text-slate-600">
              Le mot de passe de <strong>{user.prenom} {user.nom}</strong> a été mis à jour.
            </p>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">Nouveau mot de passe</p>
              <p className="text-sm font-mono font-semibold text-slate-900">{password}</p>
            </div>
            <p className="text-xs text-slate-400">Communiquez-le à l'utilisateur de façon sécurisée.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-500">
              Pour <strong className="text-slate-700">{user.prenom} {user.nom}</strong> ({user.email})
            </p>

            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
              <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-primary-300 focus-within:bg-white transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Réinitialiser'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
