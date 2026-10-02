import type { StatutOffre, StatutCandidature, StatutConvention, StatutStage, StatutSoutenance, NiveauRisque } from '@/lib/api';

export const offreStatutConfig: Record<StatutOffre, { label: string; classes: string }> = {
  BROUILLON: { label: 'Brouillon', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  PUBLIEE: { label: 'Publiée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOTUREE: { label: 'Clôturée', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const candidatureStatutConfig: Record<StatutCandidature, { label: string; classes: string; dot: string }> = {
  EN_ATTENTE: { label: 'En attente', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  EN_EVALUATION: { label: 'En évaluation', classes: 'bg-primary-50 text-primary-700 border-primary-200', dot: 'bg-primary-500' },
  ACCEPTEE: { label: 'Acceptée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  REFUSEE: { label: 'Refusée', classes: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

export const conventionStatutConfig: Record<StatutConvention, { label: string; classes: string }> = {
  EN_ATTENTE: { label: 'En attente de validation', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  VALIDEE: { label: 'Validée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUSEE: { label: 'Refusée', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const stageStatutConfig: Record<StatutStage, { label: string; classes: string }> = {
  EN_COURS: { label: 'En cours', classes: 'bg-primary-50 text-primary-700 border-primary-200' },
  TERMINE: { label: 'Terminé', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const soutenanceStatutConfig: Record<StatutSoutenance, { label: string; classes: string }> = {
  PLANIFIEE: { label: 'Planifiée', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  REALISEE: { label: 'Réalisée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const niveauRisqueConfig: Record<NiveauRisque, { label: string; classes: string; dot: string }> = {
  FAIBLE: { label: 'Risque faible', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  MOYEN: { label: 'Risque moyen', classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  ELEVE: { label: 'Risque élevé', classes: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};
