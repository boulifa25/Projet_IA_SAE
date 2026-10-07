import { Mail, Calendar, GraduationCap, Building2, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleLabels } from '@/config/navigation';

const roleBadgeClasses: Record<string, string> = {
  ETUDIANT: 'bg-primary-50 text-primary-700 border-primary-200',
  ENSEIGNANT: 'bg-accent-50 text-accent-700 border-accent-200',
  ENTREPRISE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMINISTRATEUR: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ProfilPage() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.prenom[0] ?? ''}${user.nom[0] ?? ''}`.toUpperCase();

  const champsRole: { icon: typeof GraduationCap; label: string; value: string }[] = [];
  if (user.role === 'ETUDIANT') {
    if (user.matricule) champsRole.push({ icon: BookOpen, label: 'Matricule', value: user.matricule });
    if (user.filiere) champsRole.push({ icon: GraduationCap, label: 'Filière', value: user.filiere });
    if (user.promotion) champsRole.push({ icon: Calendar, label: 'Promotion', value: user.promotion });
  } else if (user.role === 'ENSEIGNANT') {
    if (user.departement) champsRole.push({ icon: Building2, label: 'Département', value: user.departement });
    if (user.specialite) champsRole.push({ icon: BookOpen, label: 'Spécialité', value: user.specialite });
  } else if (user.role === 'ENTREPRISE') {
    if (user.raisonSociale) champsRole.push({ icon: Building2, label: 'Raison sociale', value: user.raisonSociale });
    if (user.secteur) champsRole.push({ icon: BookOpen, label: 'Secteur', value: user.secteur });
    if (user.adresse) champsRole.push({ icon: Building2, label: 'Adresse', value: user.adresse });
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-2xl truncate">{user.prenom} {user.nom}</h2>
              <p className="text-primary-100 text-sm truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-display font-bold text-slate-900 mb-2">Informations du compte</h3>

          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Adresse email</p>
              <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Membre depuis</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(user.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${roleBadgeClasses[user.role]}`}>
              {roleLabels[user.role]}
            </span>
          </div>
        </div>

        {champsRole.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-900 mb-2">
              {user.role === 'ENTREPRISE' ? "Informations de l'entreprise" : 'Informations académiques'}
            </h3>
            {champsRole.map((champ) => (
              <div key={champ.label} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <champ.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{champ.label}</p>
                  <p className="text-sm font-medium text-slate-800">{champ.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
