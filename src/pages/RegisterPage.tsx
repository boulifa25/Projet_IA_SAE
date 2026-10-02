import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  BookUser,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { RegisterPayload } from '@/lib/api';

type RegistrableRole = RegisterPayload['role'];

const roleOptions: { value: RegistrableRole; label: string; icon: typeof User }[] = [
  { value: 'ETUDIANT', label: 'Étudiant', icon: User },
  { value: 'ENSEIGNANT', label: 'Enseignant', icon: BookUser },
  { value: 'ENTREPRISE', label: 'Entreprise', icon: Building2 },
];

const inputClass =
  'w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1';
const fieldWrapperClass =
  'flex items-center gap-2 px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-primary-300 focus-within:bg-white transition-colors';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RegistrableRole>('ETUDIANT');

  const [matricule, setMatricule] = useState('');
  const [filiere, setFiliere] = useState('');
  const [promotion, setPromotion] = useState('');
  const [departement, setDepartement] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');
  const [secteur, setSecteur] = useState('');
  const [adresse, setAdresse] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { test: (p: string) => p.length >= 8, label: 'Au moins 8 caractères' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'Une majuscule' },
    { test: (p: string) => /[0-9]/.test(p), label: 'Un chiffre' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!passwordRules.every((r) => r.test(password))) {
      setError('Le mot de passe ne respecte pas les exigences de sécurité.');
      return;
    }

    const payload: RegisterPayload = {
      nom,
      prenom,
      email,
      password,
      role,
      ...(role === 'ETUDIANT' && { matricule, filiere, promotion }),
      ...(role === 'ENSEIGNANT' && { departement, specialite }),
      ...(role === 'ENTREPRISE' && { raisonSociale, secteur, adresse }),
    };

    setLoading(true);
    const { error } = await signUp(payload);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — visual */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-accent-600 via-primary-600 to-primary-700 items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="relative max-w-md text-white">
          <h2 className="font-display font-extrabold text-3xl mb-6 leading-tight">
            Rejoignez la plateforme de gestion des stages
          </h2>
          <p className="text-primary-50 text-lg mb-8">
            Inscrivez-vous gratuitement et digitalisez la gestion des stages de votre école en quelques minutes.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Mise en service en moins de 5 minutes' },
              { icon: '📊', text: 'Tableau de bord et statistiques en temps réel' },
              { icon: '🤝', text: 'Réseau d\'entreprises partenaires intégré' },
              { icon: '🔒', text: 'Données sécurisées et conformes' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg shrink-0">
                  {item.icon}
                </div>
                <p className="text-primary-50">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-900 text-lg leading-none">StageÉcole</h1>
              <p className="text-xs text-slate-400">Gestion des stages</p>
            </div>
          </div>

          <h2 className="font-display font-extrabold text-3xl text-slate-900 mb-2">
            Créer un compte
          </h2>
          <p className="text-slate-500 mb-8">
            Commencez gratuitement, aucune carte bancaire requise.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Je suis</label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const active = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                        active
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                <div className={fieldWrapperClass}>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Lucas"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                <div className={fieldWrapperClass}>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Martin"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className={fieldWrapperClass}>
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@ecole.fr"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {role === 'ETUDIANT' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Matricule</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      placeholder="E12345"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Promotion</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={promotion}
                      onChange={(e) => setPromotion(e.target.value)}
                      placeholder="2026"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Filière</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={filiere}
                      onChange={(e) => setFiliere(e.target.value)}
                      placeholder="Informatique"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'ENSEIGNANT' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Département</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={departement}
                      onChange={(e) => setDepartement(e.target.value)}
                      placeholder="Informatique"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Spécialité</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={specialite}
                      onChange={(e) => setSpecialite(e.target.value)}
                      placeholder="Data & IA"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'ENTREPRISE' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Raison sociale</label>
                  <div className={fieldWrapperClass}>
                    <input
                      type="text"
                      value={raisonSociale}
                      onChange={(e) => setRaisonSociale(e.target.value)}
                      placeholder="TechNova"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Secteur</label>
                    <div className={fieldWrapperClass}>
                      <input
                        type="text"
                        value={secteur}
                        onChange={(e) => setSecteur(e.target.value)}
                        placeholder="Technologie"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                    <div className={fieldWrapperClass}>
                      <input
                        type="text"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        placeholder="Paris, France"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
              <div className={fieldWrapperClass}>
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5 animate-fade-in">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <span
                        key={rule.label}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                          passed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {passed ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                        {rule.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
              <div className={fieldWrapperClass}>
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
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
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
