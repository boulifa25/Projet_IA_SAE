import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import type { UserResponse } from '@/lib/api';
import { roleBasePath, roleLabels } from '@/config/navigation';
import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
  title: string;
  subtitle: string;
  user: UserResponse | null;
  onSignOut?: () => void;
}

export default function Header({ title, subtitle, user, onSignOut }: HeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = user ? `${user.prenom[0] ?? ''}${user.nom[0] ?? ''}`.toUpperCase() : '?';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoToProfile = () => {
    setMenuOpen(false);
    if (user) navigate(`${roleBasePath[user.role]}/profil`);
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="min-w-0">
        <h2 className="font-display font-bold text-slate-900 text-xl leading-tight truncate">{title}</h2>
        <p className="text-sm text-slate-400 truncate">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-64 focus-within:border-primary-300 focus-within:bg-white transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
          <kbd className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>

        <NotificationBell />

        {/* User chip */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && user && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="py-1.5">
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Mon profil
                </button>
                <p className="px-4 pt-1 pb-1.5 text-xs text-slate-300">{roleLabels[user.role]}</p>
              </div>
              {onSignOut && (
                <div className="border-t border-slate-100 py-1.5">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
