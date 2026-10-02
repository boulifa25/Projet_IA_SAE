import { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { recommandationsApi, ApiError, type AlerteRisqueResponse } from '@/lib/api';
import { niveauRisqueConfig } from '@/lib/statusStyles';

const ORDRE_RISQUE = { ELEVE: 0, MOYEN: 1, FAIBLE: 2 };

export default function SuiviIAEnseignant() {
  const { token } = useAuth();
  const [alertes, setAlertes] = useState<AlerteRisqueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    recommandationsApi.mesAlertes(token)
      .then((data) => setAlertes([...data].sort((a, b) => ORDRE_RISQUE[a.niveauRisque] - ORDRE_RISQUE[b.niveauRisque])))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger le suivi IA.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {alertes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm max-w-sm">
            Aucune alerte pour le moment. Les indicateurs de risque apparaîtront ici dès que vos étudiants déposeront des rapports.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {alertes.map((a) => {
            const config = niveauRisqueConfig[a.niveauRisque];
            return (
              <div key={a.stageId} className="flex items-start gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {a.etudiantPrenom[0]}{a.etudiantNom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{a.etudiantPrenom} {a.etudiantNom}</p>
                  <p className="text-xs text-slate-400 mb-1.5">{a.entrepriseNom} · {new Date(a.dateGeneration).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-slate-600">{a.justification}</p>
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
  );
}
