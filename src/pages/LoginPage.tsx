import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <Logo className="w-10 h-10 drop-shadow-sm" />
            <div>
              <h1 className="font-display font-bold text-slate-900 text-lg leading-none">StageIO</h1>
              <p className="text-xs text-slate-400">Gestion des stages</p>
            </div>
          </div>

          <h2 className="font-display font-extrabold text-3xl text-slate-900 mb-2">
            Bon retour !
          </h2>
          <p className="text-slate-500 mb-8">
            Connectez-vous pour accéder à votre tableau de bord.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-primary-300 focus-within:bg-white transition-colors">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@ecole.fr"
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-primary-300 focus-within:bg-white transition-colors">
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — visual */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="relative max-w-md text-white">
          <h2 className="font-display font-extrabold text-3xl mb-6 leading-tight">
            La plateforme de référence pour la gestion des stages
          </h2>
          <div className="space-y-4">
            {[
              'Centralisez toutes vos offres de stage',
              'Suivez les candidatures en temps réel',
              'Gérez votre réseau d\'entreprises partenaires',
              'Accompagnez chaque étudiant vers le succès',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-primary-50">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['AD', 'LM', 'ED', 'HL'].map((initials) => (
                  <div key={initials} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-primary-600">
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary-100">Plus de 200 écoles nous font confiance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
