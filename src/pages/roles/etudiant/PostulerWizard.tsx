import { useState, type DragEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  FileText,
  FileCheck2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { candidaturesApi, ApiError, type OffreResponse } from '@/lib/api';

const STEPS = ['CV', 'Motivation', 'Vérification'] as const;

interface PostulerWizardProps {
  offre: OffreResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostulerWizard({ offre, onClose, onSuccess }: PostulerWizardProps) {
  const { token, user } = useAuth();
  const [step, setStep] = useState(0);
  const [cv, setCv] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Le CV doit être un fichier PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le CV ne doit pas dépasser 5 Mo.');
      return;
    }
    setError(null);
    setCv(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const goNext = () => {
    setError(null);
    if (step === 0 && !cv) {
      setError('Merci de joindre votre CV pour continuer.');
      return;
    }
    if (step === 1 && lettreMotivation.trim().length < 20) {
      setError('Votre lettre de motivation semble trop courte (20 caractères minimum).');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!token || !cv) return;
    setLoading(true);
    setError(null);
    try {
      await candidaturesApi.postuler(offre.id, lettreMotivation, cv, token);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer votre candidature.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
              {offre.entrepriseNom.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-slate-900 truncate">{offre.titre}</h3>
              <p className="text-xs text-slate-400 truncate">
                {offre.entrepriseNom}{offre.lieu ? ` · ${offre.lieu}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-6 py-4 shrink-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${i <= step ? 'text-slate-900' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded transition-colors ${i < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 flex-1 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4 pb-4">
              <p className="text-sm text-slate-500">
                Ajoutez votre CV au format PDF (5 Mo max). Il sera transmis directement à {offre.entrepriseNom}.
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-2xl border-2 border-dashed transition-colors ${
                  dragActive ? 'border-primary-400 bg-primary-50' : cv ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                {cv ? (
                  <>
                    <FileCheck2 className="w-10 h-10 text-emerald-500" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900">{cv.name}</p>
                      <p className="text-xs text-slate-400">{(cv.size / 1024).toFixed(0)} Ko</p>
                    </div>
                    <label className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer">
                      Remplacer le fichier
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-300" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Glissez votre CV ici</p>
                      <p className="text-xs text-slate-400">ou cliquez pour parcourir vos fichiers</p>
                    </div>
                    <label className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl cursor-pointer transition-colors">
                      Choisir un fichier
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Lettre de motivation</label>
                <span className="text-xs text-slate-400">{lettreMotivation.length} caractères</span>
              </div>
              <textarea
                autoFocus
                rows={10}
                value={lettreMotivation}
                onChange={(e) => setLettreMotivation(e.target.value)}
                placeholder={`Bonjour,\n\nJe me permets de vous adresser ma candidature pour le poste de ${offre.titre}...`}
                className="w-full px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary-300 focus:bg-white outline-none text-sm text-slate-700 placeholder-slate-400 transition-colors resize-none"
              />
              <p className="text-xs text-slate-400">Astuce : mentionnez vos compétences clés et votre motivation pour cette entreprise.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 pb-4">
              <p className="text-sm text-slate-500">Vérifiez votre candidature avant de l'envoyer.</p>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidat</span>
                </div>
                <p className="text-sm text-slate-700">{user?.prenom} {user?.nom} · {user?.email}</p>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CV joint</span>
                  <button onClick={() => setStep(0)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">Modifier</button>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{cv?.name}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lettre de motivation</span>
                  <button onClick={() => setStep(1)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">Modifier</button>
                </div>
                <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">{lettreMotivation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={step === 0 ? onClose : goBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Annuler' : 'Précédent'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Envoyer ma candidature
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
