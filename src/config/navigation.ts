import {
  LayoutDashboard,
  Briefcase,
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
  Sparkles,
  FileCheck,
  Building2,
  Settings,
  ClipboardCheck,
  Award,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/api';

export interface NavItem {
  to: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  end?: boolean;
}

export const roleBasePath: Record<Role, string> = {
  ETUDIANT: '/app/etudiant',
  ENSEIGNANT: '/app/enseignant',
  ENTREPRISE: '/app/entreprise',
  ADMINISTRATEUR: '/app/admin',
};

export const roleLabels: Record<Role, string> = {
  ETUDIANT: 'Étudiant',
  ENSEIGNANT: 'Enseignant',
  ENTREPRISE: 'Entreprise',
  ADMINISTRATEUR: 'Administrateur',
};

export const etudiantNav: NavItem[] = [
  { to: '/app/etudiant', label: 'Tableau de bord', subtitle: "Vue d'ensemble de votre parcours de stage", icon: LayoutDashboard, end: true },
  { to: '/app/etudiant/offres', label: 'Offres de stage', subtitle: 'Recherchez et postulez aux offres publiées', icon: Briefcase },
  { to: '/app/etudiant/candidatures', label: 'Mes candidatures', subtitle: 'Suivez le statut de vos candidatures', icon: FileText },
  { to: '/app/etudiant/stage', label: 'Mon stage', subtitle: 'Rapports, jalons et conseils personnalisés', icon: GraduationCap },
  { to: '/app/etudiant/messagerie', label: 'Messagerie', subtitle: 'Échangez avec vos tuteurs', icon: MessageSquare },
];

export const entrepriseNav: NavItem[] = [
  { to: '/app/entreprise', label: 'Tableau de bord', subtitle: "Vue d'ensemble de vos offres et candidatures", icon: LayoutDashboard, end: true },
  { to: '/app/entreprise/offres', label: 'Mes offres', subtitle: 'Publiez et gérez vos offres de stage', icon: Briefcase },
  { to: '/app/entreprise/candidatures', label: 'Candidatures reçues', subtitle: 'Présélectionnez et évaluez les candidats', icon: FileText },
  { to: '/app/entreprise/evaluation', label: 'Évaluation', subtitle: 'Évaluez vos stagiaires après la soutenance', icon: Award },
  { to: '/app/entreprise/messagerie', label: 'Messagerie', subtitle: 'Échangez avec les candidats et l\'école', icon: MessageSquare },
];

export const enseignantNav: NavItem[] = [
  { to: '/app/enseignant', label: 'Tableau de bord', subtitle: "Vue d'ensemble des étudiants encadrés", icon: LayoutDashboard, end: true },
  { to: '/app/enseignant/etudiants', label: 'Mes étudiants', subtitle: 'Suivez le parcours de vos étudiants encadrés', icon: Users },
  { to: '/app/enseignant/suivi-ia', label: 'Suivi IA', subtitle: 'Alertes et recommandations générées par l\'IA', icon: Sparkles },
  { to: '/app/enseignant/conventions', label: 'Conventions', subtitle: 'Validez les conventions de stage', icon: FileCheck },
  { to: '/app/enseignant/evaluation', label: 'Évaluation', subtitle: 'Évaluez vos étudiants après la soutenance', icon: Award },
  { to: '/app/enseignant/messagerie', label: 'Messagerie', subtitle: 'Échangez avec vos étudiants', icon: MessageSquare },
];

export const adminNav: NavItem[] = [
  { to: '/app/admin', label: 'Tableau de bord', subtitle: "Vue d'ensemble de la plateforme de stages", icon: LayoutDashboard, end: true },
  { to: '/app/admin/offres', label: 'Offres de stage', subtitle: 'Gérez et publiez les offres disponibles', icon: Briefcase },
  { to: '/app/admin/candidatures', label: 'Candidatures', subtitle: 'Suivez et évaluez les candidatures des étudiants', icon: FileText },
  { to: '/app/admin/conventions', label: 'Conventions', subtitle: 'Validez administrativement les conventions de stage', icon: FileCheck },
  { to: '/app/admin/soutenances', label: 'Soutenances', subtitle: 'Planifiez les soutenances et finalisez les évaluations', icon: ClipboardCheck },
  { to: '/app/admin/entreprises', label: 'Entreprises partenaires', subtitle: 'Gérez vos relations avec les entreprises', icon: Building2 },
  { to: '/app/admin/etudiants', label: 'Étudiants', subtitle: 'Suivez le parcours et le placement des étudiants', icon: Users },
  { to: '/app/admin/utilisateurs', label: 'Utilisateurs', subtitle: 'Gérez les comptes et réinitialisez les mots de passe', icon: UserCog },
  { to: '/app/admin/parametres', label: 'Paramètres', subtitle: 'Configuration de la plateforme', icon: Settings },
];
