import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  candidaturesApi,
  conventionsApi,
  stagesApi,
  soutenancesApi,
  recommandationsApi,
  ApiError,
  type CandidatureResponse,
  type ConventionResponse,
  type StageResponse,
  type SoutenanceResponse,
  type RecommandationIAResponse,
} from '@/lib/api';
import { conventionStatutConfig, stageStatutConfig } from '@/lib/statusStyles';

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'ring-accent-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
};

export default function DashboardEtudiant() {
  const { token, user } = useAuth();
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [convention, setConvention] = useState<ConventionResponse | null>(null);
  const [stage, setStage] = useState<StageResponse | null>(null);
  const [soutenance, setSoutenance] = useState<SoutenanceResponse | null>(null);
  const [conseils, setConseils] = useState<RecommandationIAResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingAttestation, setDownloadingAttestation] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setCandidatures(await candidaturesApi.mesCandidatures(token));

        try {
          const conv = await conventionsApi.maConvention(token);
          setConvention(conv);

          if (conv.statut === 'VALIDEE') {
            const stageData = await stagesApi.monStage(token);
            setStage(stageData);

            try {
              setSoutenance(await soutenancesApi.pourStage(stageData.id, token));
            } catch (err) {
              if (!(err instanceof ApiError && err.status === 404)) throw err;
            }

            const recommandations = await recommandationsApi.parStage(stageData.id, token);
            setConseils(recommandations.filter((r) => r.type === 'CONSEIL'));
          }
        } catch (err) {
          if (!(err instanceof ApiError && err.status === 404)) throw err;
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Impossible de charger votre tableau de bord.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleDownloadAttestation = async () => {
    if (!token || !stage) return;
    setDownloadingAttestation(true);
    try {
      const blob = await stagesApi.getAttestationBlob(stage.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Impossible de télécharger l'attestation.");
    } finally {
      setDownloadingAttestation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const enAttente = candidatures.filter((c) => c.statut === 'EN_ATTENTE' || c.statut === 'EN_EVALUATION').length;
  const acceptees = candidatures.filter((c) => c.statut === 'ACCEPTEE').length;

  const cards = [
    { label: 'Candidatures envoyées', value: candidatures.length, icon: FileText, color: 'primary' },
    { label: 'En attente de réponse', value: enAttente, icon: Clock, color: 'amber' },
    { label: 'Candidatures acceptées', value: acceptees, icon: CheckCircle2, color: 'emerald' },
    { label: 'Conseils IA reçus', value: conseils.length, icon: Sparkles, color: 'accent' },
  ];

  const latestConseil = conseils[0];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-400/20 rounded-full translate-y-1/2 blur-2xl" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">Bonjour, {user?.prenom} 👋</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">Bienvenue sur votre espace stage</h2>
          <p className="text-primary-100 text-sm max-w-lg">
            Retrouvez ici vos candidatures, l'avancement de votre stage et les conseils personnalisés de l'assistant IA.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-soft transition-all duration-300 group">
              <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300 mb-4`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-display font-bold text-slate-900 mb-4">Mon parcours</h3>

          {!convention ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <Building2 className="w-9 h-9 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 max-w-sm mb-4">
                Vous n'avez pas encore de stage confirmé. Postulez à une offre pour démarrer votre parcours.
              </p>
              <Link
                to="/app/etudiant/offres"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Parcourir les offres <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                    {convention.entrepriseNom.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{convention.offreTitre}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      {convention.entrepriseNom}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${
                    stage ? stageStatutConfig[stage.statut].classes : conventionStatutConfig[convention.statut].classes
                  }`}
                >
                  {stage ? stageStatutConfig[stage.statut].label : conventionStatutConfig[convention.statut].label}
                </span>
              </div>

              {soutenance?.statut === 'REALISEE' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 mb-4">
                  <p className="text-sm text-emerald-800 font-semibold">
                    Note finale : {soutenance.noteFinale?.toFixed(1)} / 20
                  </p>
                  {soutenance.attestationDisponible && (
                    <button
                      onClick={handleDownloadAttestation}
                      disabled={downloadingAttestation}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                    >
                      {downloadingAttestation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Attestation
                    </button>
                  )}
                </div>
              )}

              <Link
                to="/app/etudiant/stage"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Voir le détail de mon stage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h3 className="font-display font-bold text-slate-900">Dernier conseil IA</h3>
          </div>

          {!latestConseil ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Vos conseils personnalisés apparaîtront ici après le dépôt de votre premier rapport.
            </p>
          ) : (
            <div>
              <p className="text-sm text-slate-600 line-clamp-5 mb-3">{latestConseil.contenu}</p>
              <p className="text-xs text-slate-400 mb-4">{new Date(latestConseil.dateGeneration).toLocaleDateString('fr-FR')}</p>
              <Link
                to="/app/etudiant/stage"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Voir tous les conseils <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
