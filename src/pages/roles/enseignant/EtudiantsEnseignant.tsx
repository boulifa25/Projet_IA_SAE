import { useEffect, useState } from 'react';
import { Users, Loader2, AlertCircle, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { stagesApi, rapportsApi, ApiError, type StageResponse, type RapportResponse } from '@/lib/api';
import { stageStatutConfig } from '@/lib/statusStyles';

export default function EtudiantsEnseignant() {
  const { token } = useAuth();
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    stagesApi.mesStages(token)
      .then(setStages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger vos étudiants.'))
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

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">Vous n'encadrez aucun stage pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
          {stages.map((stage) => (
            <StageRow
              key={stage.id}
              stage={stage}
              expanded={expandedId === stage.id}
              onToggle={() => setExpandedId(expandedId === stage.id ? null : stage.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StageRow({ stage, expanded, onToggle }: { stage: StageResponse; expanded: boolean; onToggle: () => void }) {
  const { token } = useAuth();
  const [rapports, setRapports] = useState<RapportResponse[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const statut = stageStatutConfig[stage.statut];

  useEffect(() => {
    if (expanded && rapports === null && token) {
      rapportsApi.parStage(stage.id, token).then(setRapports).catch(() => setRapports([]));
    }
  }, [expanded, rapports, stage.id, token]);

  const handleDownload = async (rapport: RapportResponse) => {
    if (!token) return;
    setDownloadingId(rapport.id);
    try {
      const blob = await rapportsApi.getFichierBlob(rapport.id, token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
          {stage.etudiantPrenom[0]}{stage.etudiantNom[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{stage.etudiantPrenom} {stage.etudiantNom}</p>
          <p className="text-xs text-slate-400 truncate">{stage.entrepriseNom} · {stage.sujet}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <FileText className="w-3.5 h-3.5" />
          {stage.nombreRapports}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>{statut.label}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-4 pl-[4.25rem] space-y-2 animate-fade-in">
          {rapports === null ? (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          ) : rapports.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun rapport déposé pour le moment.</p>
          ) : (
            rapports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-700 flex-1 truncate">{r.titre}</span>
                <span className="text-xs text-slate-400 shrink-0">{new Date(r.dateDepot).toLocaleDateString('fr-FR')}</span>
                <button
                  onClick={() => handleDownload(r)}
                  disabled={downloadingId === r.id}
                  className="text-slate-400 hover:text-primary-600 transition-colors shrink-0"
                >
                  {downloadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
