import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';
import { useAuth } from '@/context/AuthContext';
import type { NavItem } from '@/config/navigation';

interface RoleLayoutProps {
  navItems: NavItem[];
  roleLabel: string;
}

export default function RoleLayout({ navItems, roleLabel }: RoleLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        navItems={navItems}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={activeItem?.label ?? roleLabel}
          subtitle={activeItem?.subtitle ?? ''}
          user={user}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
