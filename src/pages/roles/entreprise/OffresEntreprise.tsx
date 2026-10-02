import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Briefcase,
  Loader2,
  AlertCircle,
  X,
  MapPin,
  Clock,
  Users,
  Send,
  Ban,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { offresApi, ApiError, type OffreResponse, type OffrePayload } from '@/lib/api';
import { offreStatutConfig } from '@/lib/statusStyles';

export default function OffresEntreprise() {
  const { token } = useAuth();
  const [offres, setOffres] = useState<OffreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadOffres = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOffres(await offresApi.mesOffres(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger vos offres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePublier = async (id: number) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      await offresApi.publier(id, token);
      await loadOffres();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de publier cette offre.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloturer = async (id: number) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      await offresApi.cloturer(id, token);
      await loadOffres();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de clôturer cette offre.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nouvelle offre
        </button>
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
      ) : offres.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm mb-4">Vous n'avez publié aucune offre pour le moment.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Créer votre première offre →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offres.map((offre) => {
            const statut = offreStatutConfig[offre.statut];
            const isLoading = actionLoadingId === offre.id;
            return (
              <div key={offre.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold text-slate-900">{offre.titre}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${statut.classes}`}>
                    {statut.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{offre.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                  {offre.lieu && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{offre.lieu}</span>}
                  {offre.dureeMois && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{offre.dureeMois} mois</span>}
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{offre.nombreCandidatures} candidature{offre.nombreCandidatures > 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  {offre.statut === 'BROUILLON' && (
                    <button
                      onClick={() => handlePublier(offre.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Publier
                    </button>
                  )}
                  {offre.statut !== 'CLOTUREE' && (
                    <button
                      onClick={() => handleCloturer(offre.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      Clôturer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateOffreModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadOffres();
          }}
        />
      )}
    </div>
  );
}

function CreateOffreModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { token } = useAuth();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [filiere, setFiliere] = useState('');
  const [lieu, setLieu] = useState('');
  const [dureeMois, setDureeMois] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [competences, setCompetences] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return;

    const payload: OffrePayload = {
      titre,
      description,
      filiere: filiere || undefined,
      lieu: lieu || undefined,
      dureeMois: dureeMois ? Number(dureeMois) : undefined,
      dateDebut,
      competencesRequises: competences
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    };

    setLoading(true);
    try {
      await offresApi.create(payload, token);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer cette offre.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors';

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-slate-900">Nouvelle offre de stage</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du poste</label>
            <input required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Développeur Front-End React" className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez les missions du stage..." className={`${fieldClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Filière</label>
              <input value={filiere} onChange={(e) => setFiliere(e.target.value)} placeholder="Informatique" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lieu</label>
              <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Paris" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Durée (mois)</label>
              <input type="number" min={1} value={dureeMois} onChange={(e) => setDureeMois(e.target.value)} placeholder="6" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date de début</label>
              <input required type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Compétences requises</label>
            <input value={competences} onChange={(e) => setCompetences(e.target.value)} placeholder="React, TypeScript, Figma (séparées par des virgules)" className={fieldClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer l\'offre (brouillon)'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
