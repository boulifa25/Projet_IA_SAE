import { NavLink } from 'react-router-dom';
import { GraduationCap, ChevronLeft, LogOut } from 'lucide-react';
import type { UserResponse } from '@/lib/api';
import type { NavItem } from '@/config/navigation';

const roleLabels: Record<UserResponse['role'], string> = {
  ETUDIANT: 'Étudiant',
  ENSEIGNANT: 'Enseignant',
  ENTREPRISE: 'Entreprise',
  ADMINISTRATEUR: 'Administrateur',
};

interface SidebarProps {
  user: UserResponse | null;
  navItems: NavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ user, navItems, collapsed, onToggleCollapse, onSignOut }: SidebarProps) {
  const initials = user ? `${user.prenom[0] ?? ''}${user.nom[0] ?? ''}`.toUpperCase() : '?';
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur';
  const roleLabel = user ? roleLabels[user.role] : '';

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shrink-0 shadow-glow">
            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-slate-900 text-lg leading-none">StageÉcole</h1>
              <p className="text-xs text-slate-400 mt-0.5">Gestion des stages</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-600" />
                  )}
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors" />
          </button>
        ) : (
          <button
            onClick={onSignOut}
            className="w-9 h-9 mx-auto flex rounded-full bg-gradient-to-br from-primary-500 to-accent-400 items-center justify-center text-white text-sm font-semibold"
            title="Déconnexion"
          >
            {initials}
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="h-10 flex items-center justify-center border-t border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </aside>
  );
}
