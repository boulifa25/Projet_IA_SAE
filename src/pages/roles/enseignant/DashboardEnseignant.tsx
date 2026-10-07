import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck, Sparkles, GraduationCap, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  conventionsApi,
  stagesApi,
  recommandationsApi,
  ApiError,
  type ConventionResponse,
  type StageResponse,
  type AlerteRisqueResponse,
} from '@/lib/api';
import { niveauRisqueConfig } from '@/lib/statusStyles';

const ORDRE_RISQUE = { ELEVE: 0, MOYEN: 1, FAIBLE: 2 };

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
};

export default function DashboardEnseignant() {
  const { token, user } = useAuth();
  const [conventionsEnAttente, setConventionsEnAttente] = useState<ConventionResponse[]>([]);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [alertes, setAlertes] = useState<AlerteRisqueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([conventionsApi.enAttenteEnseignant(token), stagesApi.mesStages(token), recommandationsApi.mesAlertes(token)])
      .then(([conventionsData, stagesData, alertesData]) => {
        setConventionsEnAttente(conventionsData);
        setStages(stagesData);
        setAlertes([...alertesData].sort((a, b) => ORDRE_RISQUE[a.niveauRisque] - ORDRE_RISQUE[b.niveauRisque]));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger le tableau de bord.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const stagesEnCours = stages.filter((s) => s.statut === 'EN_COURS').length;
  const risqueEleve = alertes.filter((a) => a.niveauRisque === 'ELEVE').length;

  const cards = [
    { label: 'Étudiants suivis', value: stages.length, icon: Users, color: 'primary' },
    { label: 'Conventions à valider', value: conventionsEnAttente.length, icon: FileCheck, color: 'amber' },
    { label: 'Alertes risque élevé', value: risqueEleve, icon: Sparkles, color: 'rose' },
    { label: 'Stages en cours', value: stagesEnCours, icon: GraduationCap, color: 'emerald' },
  ];

  const topAlertes = alertes.slice(0, 4);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-400/20 rounded-full translate-y-1/2 blur-2xl" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">Bonjour, {user?.prenom} 👋</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">Bienvenue sur votre espace enseignant</h2>
          <p className="text-primary-100 text-sm max-w-lg">
            Suivez vos étudiants encadrés et les alertes de risque générées par l'assistant IA.
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

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <div>
              <h3 className="font-display font-bold text-slate-900">Alertes IA récentes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Classées par niveau de risque de décrochage</p>
            </div>
          </div>
          <Link to="/app/enseignant/suivi-ia" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {topAlertes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Aucune alerte pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {topAlertes.map((a) => {
              const config = niveauRisqueConfig[a.niveauRisque];
              return (
                <div key={a.stageId} className="flex items-start gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                    {a.etudiantPrenom[0]}{a.etudiantNom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{a.etudiantPrenom} {a.etudiantNom}</p>
                    <p className="text-xs text-slate-400">{a.entrepriseNom}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${config.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {conventionsEnAttente.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-slate-900">Conventions à valider</h3>
              <p className="text-xs text-slate-400 mt-0.5">En attente de votre validation pédagogique</p>
            </div>
            <Link to="/app/enseignant/conventions" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {conventionsEnAttente.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.etudiantPrenom} {c.etudiantNom}</p>
                  <p className="text-xs text-slate-400 truncate">{c.offreTitre} · {c.entrepriseNom}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">{c.reference}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
