import { Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import type { UserResponse } from '@/lib/api';

interface HeaderProps {
  title: string;
  subtitle: string;
  user: UserResponse | null;
  onSignOut?: () => void;
}

export default function Header({ title, subtitle, user, onSignOut }: HeaderProps) {
  const initials = user ? `${user.prenom[0] ?? ''}${user.nom[0] ?? ''}`.toUpperCase() : '?';
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

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
