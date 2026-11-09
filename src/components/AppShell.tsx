import { type ReactNode, useState } from 'react';
import {
  Home, Siren, Users, Map, Shield, FileText, Bell, User as UserIcon,
  Activity, Radio, BarChart3, Globe, Server, Settings, LogOut, Menu, X,
  RotateCcw, Wifi, WifiOff, AlertTriangle, ChevronDown, ShieldCheck,
  MapPin, Brain, Zap, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/cn';
import type { Role } from '@/types';

interface NavItemDef {
  id: string;
  label: string;
  icon: typeof Home;
}

interface AppShellProps {
  role: 'user' | 'responder' | 'admin';
  navItems: NavItemDef[];
  activeView: string;
  onNavigate: (view: string) => void;
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const connectivityConfig = {
  online: { label: 'Online', icon: Wifi, tone: 'text-success-dark', bg: 'bg-success-light' },
  weak: { label: 'Weak', icon: AlertTriangle, tone: 'text-warning-dark', bg: 'bg-warning-light' },
  offline: { label: 'Offline', icon: WifiOff, tone: 'text-emergency-dark', bg: 'bg-emergency-light' },
};

export function AppShell({ role, navItems, activeView, onNavigate, children, title, subtitle }: AppShellProps) {
  const { connectivity, setConnectivity, resetDemo, setRole, notifications } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const conn = connectivityConfig[connectivity];

  const roleLabels: Record<string, string> = {
    user: 'Citizen App',
    responder: 'Responder',
    admin: 'Administrator',
  };

  const roleIcons: Record<string, typeof Home> = {
    user: UserIcon,
    responder: Siren,
    admin: Shield,
  };

  const RoleIcon = roleIcons[role];

  const switchRole = (newRole: Role) => {
    setRole(newRole);
    setRoleMenuOpen(false);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5">
        <Logo size="md" />
      </div>

      <div className="px-3 mb-2">
        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          {roleLabels[role]}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scroll-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileNavOpen(false); }}
              className={cn('nav-item w-full text-left', active && 'nav-item-active')}
            >
              <Icon size={18} className={active ? 'text-lavender-700' : ''} />
              <span>{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-emergency text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-lavender-100 space-y-1">
        <div className="px-2 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Connectivity</div>
          <div className="flex gap-1">
            {(['online', 'weak', 'offline'] as const).map((c) => {
              const CIcon = connectivityConfig[c].icon;
              return (
                <button
                  key={c}
                  onClick={() => setConnectivity(c)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-semibold transition-all',
                    connectivity === c ? connectivityConfig[c].bg + ' ' + connectivityConfig[c].tone : 'text-muted hover:bg-lavender-100/50'
                  )}
                >
                  <CIcon size={14} />
                  {connectivityConfig[c].label}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={resetDemo} className="nav-item w-full text-left">
          <RotateCcw size={16} />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 bg-white border-r border-lavender-100 z-30">
        {sidebar}
      </aside>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-plum/30 backdrop-blur-sm" />
          <div className="absolute left-0 inset-y-0 w-72 bg-white shadow-elevated animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileNavOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-lavender-100">
              <X size={20} className="text-plum-muted" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-lavender-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-lavender-100 transition-colors"
              >
                <Menu size={20} className="text-plum" />
              </button>
              <div>
                <h1 className="text-base lg:text-lg font-bold text-plum leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted hidden sm:block">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Connectivity indicator */}
              <div className={cn('hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold', conn.bg, conn.tone)}>
                <conn.icon size={14} />
                <span>{conn.label}</span>
              </div>

              {/* Role switcher */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-lavender-100/60 hover:bg-lavender-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-lavender-gradient flex items-center justify-center">
                    <RoleIcon size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-plum hidden sm:block">{roleLabels[role]}</span>
                  <ChevronDown size={14} className="text-plum-muted" />
                </button>
                {roleMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setRoleMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-lavender-100 p-2 z-20 animate-scale-in">
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">Switch Role</div>
                      <button onClick={() => switchRole('user')} className="nav-item w-full text-left">
                        <UserIcon size={16} /> Citizen App
                      </button>
                      <button onClick={() => switchRole('responder')} className="nav-item w-full text-left">
                        <Siren size={16} /> Responder
                      </button>
                      <button onClick={() => switchRole('admin')} className="nav-item w-full text-left">
                        <Shield size={16} /> Administrator
                      </button>
                      <div className="h-px bg-lavender-100 my-1.5" />
                      <button onClick={() => switchRole('welcome')} className="nav-item w-full text-left">
                        <LogOut size={16} /> Exit to Welcome
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Export nav icons for reuse
export const navIcons = {
  Home, Siren, Users, Map, Shield, FileText, Bell, UserIcon,
  Activity, Radio, BarChart3, Globe, Server, Settings, ShieldCheck,
  MapPin, Brain, Zap, TrendingUp,
};
