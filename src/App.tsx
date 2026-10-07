import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RoleLayout from '@/layouts/RoleLayout';
import DashboardEtudiant from '@/pages/roles/etudiant/DashboardEtudiant';
import OffresEtudiant from '@/pages/roles/etudiant/OffresEtudiant';
import CandidaturesEtudiant from '@/pages/roles/etudiant/CandidaturesEtudiant';
import MonStage from '@/pages/roles/etudiant/MonStage';
import MessagerieEtudiant from '@/pages/roles/etudiant/MessagerieEtudiant';
import DashboardEntreprise from '@/pages/roles/entreprise/DashboardEntreprise';
import OffresEntreprise from '@/pages/roles/entreprise/OffresEntreprise';
import CandidaturesEntreprise from '@/pages/roles/entreprise/CandidaturesEntreprise';
import MessagerieEntreprise from '@/pages/roles/entreprise/MessagerieEntreprise';
import EvaluationEntreprise from '@/pages/roles/entreprise/EvaluationEntreprise';
import DashboardEnseignant from '@/pages/roles/enseignant/DashboardEnseignant';
import ConventionsEnseignant from '@/pages/roles/enseignant/ConventionsEnseignant';
import EtudiantsEnseignant from '@/pages/roles/enseignant/EtudiantsEnseignant';
import MessagerieEnseignant from '@/pages/roles/enseignant/MessagerieEnseignant';
import EvaluationEnseignant from '@/pages/roles/enseignant/EvaluationEnseignant';
import SuiviIAEnseignant from '@/pages/roles/enseignant/SuiviIAEnseignant';
import ConventionsAdmin from '@/pages/roles/admin/ConventionsAdmin';
import SoutenancesAdmin from '@/pages/roles/admin/SoutenancesAdmin';
import UtilisateursAdmin from '@/pages/roles/admin/UtilisateursAdmin';
import DashboardAdmin from '@/pages/roles/admin/DashboardAdmin';
import OffresAdmin from '@/pages/roles/admin/OffresAdmin';
import CandidaturesAdmin from '@/pages/roles/admin/CandidaturesAdmin';
import EntreprisesAdmin from '@/pages/roles/admin/EntreprisesAdmin';
import EtudiantsAdmin from '@/pages/roles/admin/EtudiantsAdmin';
import ProfilPage from '@/pages/roles/ProfilPage';
import SettingsView from '@/views/SettingsView';
import { etudiantNav, entrepriseNav, enseignantNav, adminNav, roleBasePath, roleLabels } from '@/config/navigation';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/lib/api';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={roleBasePath[user.role]} replace />;

  return <>{children}</>;
}

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  if (user && user.role !== role) {
    return <Navigate to={roleBasePath[user.role]} replace />;
  }
  return <>{children}</>;
}

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={user ? roleBasePath[user.role] : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/app" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

      {/* Espace Étudiant */}
      <Route
        path="/app/etudiant"
        element={
          <ProtectedRoute>
            <RequireRole role="ETUDIANT">
              <RoleLayout navItems={etudiantNav} roleLabel={roleLabels.ETUDIANT} />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardEtudiant />} />
        <Route path="offres" element={<OffresEtudiant />} />
        <Route path="candidatures" element={<CandidaturesEtudiant />} />
        <Route path="stage" element={<MonStage />} />
        <Route path="messagerie" element={<MessagerieEtudiant />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* Espace Entreprise */}
      <Route
        path="/app/entreprise"
        element={
          <ProtectedRoute>
            <RequireRole role="ENTREPRISE">
              <RoleLayout navItems={entrepriseNav} roleLabel={roleLabels.ENTREPRISE} />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardEntreprise />} />
        <Route path="offres" element={<OffresEntreprise />} />
        <Route path="candidatures" element={<CandidaturesEntreprise />} />
        <Route path="evaluation" element={<EvaluationEntreprise />} />
        <Route path="messagerie" element={<MessagerieEntreprise />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* Espace Enseignant */}
      <Route
        path="/app/enseignant"
        element={
          <ProtectedRoute>
            <RequireRole role="ENSEIGNANT">
              <RoleLayout navItems={enseignantNav} roleLabel={roleLabels.ENSEIGNANT} />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardEnseignant />} />
        <Route path="etudiants" element={<EtudiantsEnseignant />} />
        <Route path="suivi-ia" element={<SuiviIAEnseignant />} />
        <Route path="conventions" element={<ConventionsEnseignant />} />
        <Route path="evaluation" element={<EvaluationEnseignant />} />
        <Route path="messagerie" element={<MessagerieEnseignant />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* Espace Administrateur */}
      <Route
        path="/app/admin"
        element={
          <ProtectedRoute>
            <RequireRole role="ADMINISTRATEUR">
              <RoleLayout navItems={adminNav} roleLabel={roleLabels.ADMINISTRATEUR} />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardAdmin />} />
        <Route path="offres" element={<OffresAdmin />} />
        <Route path="candidatures" element={<CandidaturesAdmin />} />
        <Route path="conventions" element={<ConventionsAdmin />} />
        <Route path="soutenances" element={<SoutenancesAdmin />} />
        <Route path="entreprises" element={<EntreprisesAdmin />} />
        <Route path="etudiants" element={<EtudiantsAdmin />} />
        <Route path="utilisateurs" element={<UtilisateursAdmin />} />
        <Route path="parametres" element={<SettingsView />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
