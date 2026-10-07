const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export type Role = 'ETUDIANT' | 'ENSEIGNANT' | 'ENTREPRISE' | 'ADMINISTRATEUR';

export interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  dateCreation: string;
  matricule?: string | null;
  filiere?: string | null;
  promotion?: string | null;
  departement?: string | null;
  specialite?: string | null;
  raisonSociale?: string | null;
  secteur?: string | null;
  adresse?: string | null;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: Exclude<Role, 'ADMINISTRATEUR'>;
  matricule?: string;
  filiere?: string;
  promotion?: string;
  departement?: string;
  specialite?: string;
  raisonSociale?: string;
  secteur?: string;
  adresse?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // pas de corps JSON, on garde le message par défaut
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface DashboardStatsResponse {
  offresActives: number;
  candidaturesTotal: number;
  etudiantsPlaces: number;
  entreprisesPartenaires: number;
}

export interface EntrepriseAdminResponse {
  id: number;
  raisonSociale: string;
  secteur: string | null;
  adresse: string | null;
  email: string;
  nombreOffresActives: number;
  nombreCandidaturesRecues: number;
  nombreEmbauches: number;
}

export type StatutStageAdmin = 'AUCUN' | 'EN_COURS' | 'TERMINE';

export interface EtudiantAdminResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string | null;
  filiere: string | null;
  promotion: string | null;
  statutStage: StatutStageAdmin;
  entrepriseNom: string | null;
}

export const adminApi = {
  stats: (token: string) => apiFetch<DashboardStatsResponse>('/api/admin/stats', {}, token),
  entreprises: (token: string) => apiFetch<EntrepriseAdminResponse[]>('/api/admin/entreprises', {}, token),
  etudiants: (token: string) => apiFetch<EtudiantAdminResponse[]>('/api/admin/etudiants', {}, token),
};

export const usersApi = {
  tous: (token: string) => apiFetch<UserResponse[]>('/api/admin/utilisateurs', {}, token),
  resetPassword: (id: number, nouveauMotDePasse: string, token: string) =>
    apiFetch<void>(`/api/admin/utilisateurs/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ nouveauMotDePasse }) }, token),
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  me: (token: string) => apiFetch<UserResponse>('/api/auth/me', {}, token),
};

export type StatutOffre = 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE';
export type StatutCandidature = 'EN_ATTENTE' | 'EN_EVALUATION' | 'ACCEPTEE' | 'REFUSEE';

export interface OffreResponse {
  id: number;
  titre: string;
  description: string;
  filiere: string | null;
  lieu: string | null;
  dureeMois: number | null;
  dateDebut: string;
  competencesRequises: string[];
  statut: StatutOffre;
  entrepriseId: number;
  entrepriseNom: string;
  nombreCandidatures: number;
  dateCreation: string;
}

export interface OffrePayload {
  titre: string;
  description: string;
  filiere?: string;
  lieu?: string;
  dureeMois?: number;
  dateDebut: string;
  competencesRequises?: string[];
}

export interface CandidatureResponse {
  id: number;
  offreId: number;
  offreTitre: string;
  entrepriseNom: string;
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  lettreMotivation: string;
  cvOriginalName: string;
  statut: StatutCandidature;
  dateEnvoi: string;
}

export interface OffreMatchingResultat {
  offreId: number;
  score: number;
  raison: string;
}

export const offresApi = {
  list: (token: string) => apiFetch<OffreResponse[]>('/api/offres', {}, token),
  toutes: (token: string) => apiFetch<OffreResponse[]>('/api/offres/toutes', {}, token),
  matching: (token: string) => apiFetch<OffreMatchingResultat[]>('/api/offres/matching', {}, token),
  mesOffres: (token: string) => apiFetch<OffreResponse[]>('/api/offres/mes-offres', {}, token),
  detail: (id: number, token: string) => apiFetch<OffreResponse>(`/api/offres/${id}`, {}, token),
  create: (payload: OffrePayload, token: string) =>
    apiFetch<OffreResponse>('/api/offres', { method: 'POST', body: JSON.stringify(payload) }, token),
  update: (id: number, payload: OffrePayload, token: string) =>
    apiFetch<OffreResponse>(`/api/offres/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  publier: (id: number, token: string) =>
    apiFetch<OffreResponse>(`/api/offres/${id}/publier`, { method: 'POST' }, token),
  cloturer: (id: number, token: string) =>
    apiFetch<OffreResponse>(`/api/offres/${id}/cloturer`, { method: 'POST' }, token),
};

export const candidaturesApi = {
  postuler: async (offreId: number, lettreMotivation: string, cv: File, token: string): Promise<CandidatureResponse> => {
    const formData = new FormData();
    formData.append('offreId', String(offreId));
    formData.append('lettreMotivation', lettreMotivation);
    formData.append('cv', cv);

    const response = await fetch(`${API_URL}/api/candidatures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      let message = `Erreur ${response.status}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {
        // pas de corps JSON
      }
      throw new ApiError(response.status, message);
    }

    return response.json() as Promise<CandidatureResponse>;
  },

  mesCandidatures: (token: string) => apiFetch<CandidatureResponse[]>('/api/candidatures/mes-candidatures', {}, token),
  toutes: (token: string) => apiFetch<CandidatureResponse[]>('/api/candidatures/toutes', {}, token),
  recues: (token: string) => apiFetch<CandidatureResponse[]>('/api/candidatures/recues', {}, token),

  changerStatut: (id: number, statut: StatutCandidature, token: string) =>
    apiFetch<CandidatureResponse>(`/api/candidatures/${id}/statut`, { method: 'PATCH', body: JSON.stringify({ statut }) }, token),

  getCvBlob: async (id: number, token: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/api/candidatures/${id}/cv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Impossible de récupérer le CV.');
    }
    return response.blob();
  },
};

export type StatutConvention = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
export type StatutStage = 'EN_COURS' | 'TERMINE';
export type TypeRapport = 'INTERMEDIAIRE' | 'FINAL';

export interface ConventionResponse {
  id: number;
  reference: string;
  sujet: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutConvention;
  valideeParEnseignant: boolean;
  valideeParAdmin: boolean;
  offreId: number;
  offreTitre: string;
  entrepriseNom: string;
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  enseignantId: number | null;
  enseignantNom: string | null;
  dateGeneration: string;
}

export interface StageResponse {
  id: number;
  conventionId: number;
  sujet: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutStage;
  etudiantNom: string;
  etudiantPrenom: string;
  entrepriseNom: string;
  enseignantNom: string | null;
  nombreRapports: number;
}

export interface RapportResponse {
  id: number;
  stageId: number;
  type: TypeRapport;
  titre: string;
  commentaire: string | null;
  fichierOriginalName: string;
  dateDepot: string;
}

export const conventionsApi = {
  enAttenteEnseignant: (token: string) => apiFetch<ConventionResponse[]>('/api/conventions/en-attente-enseignant', {}, token),
  mesConventions: (token: string) => apiFetch<ConventionResponse[]>('/api/conventions/mes-conventions', {}, token),
  validerEnseignant: (id: number, token: string) =>
    apiFetch<ConventionResponse>(`/api/conventions/${id}/valider-enseignant`, { method: 'POST' }, token),
  aValiderAdmin: (token: string) => apiFetch<ConventionResponse[]>('/api/conventions/a-valider-admin', {}, token),
  validerAdmin: (id: number, token: string) =>
    apiFetch<ConventionResponse>(`/api/conventions/${id}/valider-admin`, { method: 'POST' }, token),
  maConvention: (token: string) => apiFetch<ConventionResponse>('/api/conventions/ma-convention', {}, token),
};

export const stagesApi = {
  toutes: (token: string) => apiFetch<StageResponse[]>('/api/stages', {}, token),
  monStage: (token: string) => apiFetch<StageResponse>('/api/stages/mon-stage', {}, token),
  mesStages: (token: string) => apiFetch<StageResponse[]>('/api/stages/mes-stages', {}, token),
  mesStagesEntreprise: (token: string) => apiFetch<StageResponse[]>('/api/stages/mes-stages-entreprise', {}, token),
  detail: (id: number, token: string) => apiFetch<StageResponse>(`/api/stages/${id}`, {}, token),
  getAttestationBlob: async (id: number, token: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/api/stages/${id}/attestation`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new ApiError(response.status, "Impossible de récupérer l'attestation.");
    }
    return response.blob();
  },
};

export interface MessageResponse {
  id: number;
  stageId: number;
  auteurId: number;
  auteurNom: string;
  auteurPrenom: string;
  auteurRole: Role;
  contenu: string;
  dateEnvoi: string;
}

export type StatutSoutenance = 'PLANIFIEE' | 'REALISEE';

export interface SoutenanceResponse {
  id: number;
  stageId: number;
  dateSoutenance: string;
  lieuOuLien: string;
  jury: string[];
  statut: StatutSoutenance;
  etudiantNom: string;
  etudiantPrenom: string;
  entrepriseNom: string;
  noteFinale: number | null;
  attestationDisponible: boolean;
}

export interface SoutenancePayload {
  stageId: number;
  dateSoutenance: string;
  lieuOuLien: string;
  jury?: string[];
}

export interface CritereNote {
  critere: string;
  note: number;
  commentaire?: string;
}

export interface EvaluationResponse {
  id: number;
  soutenanceId: number;
  evaluateurId: number;
  evaluateurNom: string;
  evaluateurRole: Role;
  critere: string;
  note: number;
  commentaire: string | null;
  dateEvaluation: string;
}

export const soutenancesApi = {
  planifier: (payload: SoutenancePayload, token: string) =>
    apiFetch<SoutenanceResponse>('/api/soutenances', { method: 'POST', body: JSON.stringify(payload) }, token),
  toutes: (token: string) => apiFetch<SoutenanceResponse[]>('/api/soutenances', {}, token),
  pourStage: (stageId: number, token: string) => apiFetch<SoutenanceResponse>(`/api/soutenances/stage/${stageId}`, {}, token),
};

export const evaluationsApi = {
  soumettre: (soutenanceId: number, notes: CritereNote[], token: string) =>
    apiFetch<EvaluationResponse[]>('/api/evaluations', { method: 'POST', body: JSON.stringify({ soutenanceId, notes }) }, token),
  parSoutenance: (soutenanceId: number, token: string) =>
    apiFetch<EvaluationResponse[]>(`/api/evaluations/soutenance/${soutenanceId}`, {}, token),
  finaliser: (soutenanceId: number, token: string) =>
    apiFetch<SoutenanceResponse>(`/api/evaluations/soutenance/${soutenanceId}/finaliser`, { method: 'POST' }, token),
};

export type TypeRecommandation = 'RESUME_RAPPORT' | 'ALERTE_RISQUE' | 'CONSEIL' | 'MATCHING_OFFRE';
export type NiveauRisque = 'FAIBLE' | 'MOYEN' | 'ELEVE';

export interface RecommandationIAResponse {
  id: number;
  stageId: number;
  rapportId: number | null;
  type: TypeRecommandation;
  contenu: string;
  niveauRisque: NiveauRisque | null;
  dateGeneration: string;
}

export interface AlerteRisqueResponse {
  stageId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  entrepriseNom: string;
  niveauRisque: NiveauRisque;
  justification: string;
  dateGeneration: string;
}

export const recommandationsApi = {
  parStage: (stageId: number, token: string) =>
    apiFetch<RecommandationIAResponse[]>(`/api/recommandations/stage/${stageId}`, {}, token),
  mesAlertes: (token: string) => apiFetch<AlerteRisqueResponse[]>('/api/recommandations/mes-alertes', {}, token),
};

export interface ChatMessage {
  role: 'user' | 'model';
  contenu: string;
}

export const chatbotApi = {
  envoyer: (message: string, historique: ChatMessage[], token: string) =>
    apiFetch<{ reponse: string }>('/api/chatbot/message', { method: 'POST', body: JSON.stringify({ message, historique }) }, token),
};

export const messagesApi = {
  envoyer: (stageId: number, contenu: string, token: string) =>
    apiFetch<MessageResponse>('/api/messages', { method: 'POST', body: JSON.stringify({ stageId, contenu }) }, token),
  parStage: (stageId: number, token: string) => apiFetch<MessageResponse[]>(`/api/messages/stage/${stageId}`, {}, token),
};

export type TypeNotification = 'OFFRE' | 'MESSAGE' | 'CANDIDATURE' | 'CONVENTION' | 'SOUTENANCE' | 'EVALUATION';

export interface NotificationResponse {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  dateCreation: string;
}

export const notificationsApi = {
  lister: (token: string) => apiFetch<NotificationResponse[]>('/api/notifications', {}, token),
  nonLues: (token: string) => apiFetch<{ count: number }>('/api/notifications/non-lues', {}, token),
  marquerLue: (id: number, token: string) =>
    apiFetch<NotificationResponse>(`/api/notifications/${id}/lire`, { method: 'POST' }, token),
  marquerToutesLues: (token: string) => apiFetch<void>('/api/notifications/lire-tout', { method: 'POST' }, token),
};

export const rapportsApi = {
  deposer: async (
    stageId: number,
    type: TypeRapport,
    titre: string,
    commentaire: string,
    fichier: File,
    token: string
  ): Promise<RapportResponse> => {
    const formData = new FormData();
    formData.append('stageId', String(stageId));
    formData.append('type', type);
    formData.append('titre', titre);
    if (commentaire) formData.append('commentaire', commentaire);
    formData.append('fichier', fichier);

    const response = await fetch(`${API_URL}/api/rapports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      let message = `Erreur ${response.status}`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {
        // pas de corps JSON
      }
      throw new ApiError(response.status, message);
    }

    return response.json() as Promise<RapportResponse>;
  },

  parStage: (stageId: number, token: string) => apiFetch<RapportResponse[]>(`/api/rapports/stage/${stageId}`, {}, token),

  getFichierBlob: async (id: number, token: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/api/rapports/${id}/fichier`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Impossible de récupérer le fichier.');
    }
    return response.blob();
  },
};
