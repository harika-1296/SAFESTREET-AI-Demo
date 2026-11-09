import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/store/AppContext';
import { AppShell } from '@/components/AppShell';
import { WelcomeScreen } from '@/screens/WelcomeScreen';

// User screens
import { Dashboard } from '@/screens/user/Dashboard';
import { SOSFlow } from '@/screens/user/SOSFlow';
import { TrustedContacts } from '@/screens/user/TrustedContacts';
import { AIDetection } from '@/screens/user/AIDetection';
import { SafeJourney } from '@/screens/user/SafeJourney';
import { CommunityMap } from '@/screens/user/CommunityMap';
import { ReportIncident } from '@/screens/user/ReportIncident';
import { Notifications } from '@/screens/user/Notifications';
import { Profile } from '@/screens/user/Profile';
import { OfflineConcept } from '@/screens/user/OfflineConcept';
import { DemoScenarios } from '@/screens/user/DemoScenarios';

// Responder screens
import { ResponderDashboard } from '@/screens/responder/ResponderDashboard';
import { ResponderMap } from '@/screens/responder/ResponderMap';

// Admin screens
import { AdminOverview } from '@/screens/admin/AdminOverview';
import { AdminAnalytics } from '@/screens/admin/AdminAnalytics';
import { AdminGeoIntelligence } from '@/screens/admin/AdminGeoIntelligence';
import { AdminUsers } from '@/screens/admin/AdminUsers';
import { AdminModeration } from '@/screens/admin/AdminModeration';
import { AdminSystem } from '@/screens/admin/AdminSystem';

import {
  Home, Siren, Users, Map as MapIcon, FileText, Bell,
  User as UserIcon, Navigation, Brain, Activity, Globe, Server,
  Zap, BarChart3, WifiOff,
} from 'lucide-react';

const userNav = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'sos', label: 'Emergency SOS', icon: Siren },
  { id: 'ai-detection', label: 'AI Detection', icon: Brain },
  { id: 'journey', label: 'Safe Journey', icon: Navigation },
  { id: 'contacts', label: 'Trusted Contacts', icon: Users },
  { id: 'community-map', label: 'Community Map', icon: MapIcon },
  { id: 'report', label: 'Report Incident', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'offline', label: 'Offline Mode', icon: WifiOff },
  { id: 'demo', label: 'Demo Scenarios', icon: Zap },
  { id: 'profile', label: 'Profile & Settings', icon: UserIcon },
];

const responderNav = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'map', label: 'Response Map', icon: MapIcon },
  { id: 'activity', label: 'Response Activity', icon: Activity },
];

const adminNav = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'geo', label: 'Geo Intelligence', icon: Globe },
  { id: 'moderation', label: 'Report Moderation', icon: FileText },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'system', label: 'System Monitoring', icon: Server },
];

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  // User
  dashboard: { title: 'Dashboard', subtitle: 'Your personal safety hub' },
  sos: { title: 'Emergency SOS', subtitle: 'One-tap emergency assistance' },
  'ai-detection': { title: 'AI Detection', subtitle: 'Assistive emergency monitoring' },
  journey: { title: 'Safe Journey', subtitle: 'Track & share your trips' },
  contacts: { title: 'Trusted Contacts', subtitle: 'Your emergency network' },
  'community-map': { title: 'Community Map', subtitle: 'Safety incidents near you' },
  report: { title: 'Report Incident', subtitle: 'Help make your community safer' },
  notifications: { title: 'Notifications', subtitle: 'Stay informed about safety' },
  offline: { title: 'Offline Mode', subtitle: 'Low-connectivity support' },
  demo: { title: 'Demo Scenarios', subtitle: 'Guided product walkthroughs' },
  profile: { title: 'Profile & Settings', subtitle: 'Manage your account' },
  // Responder
  map: { title: 'Response Map', subtitle: 'Live incident locations' },
  activity: { title: 'Response Activity', subtitle: 'Responder team status' },
  // Admin
  overview: { title: 'Command Overview', subtitle: 'Platform safety intelligence' },
  analytics: { title: 'Incident Analytics', subtitle: 'Trends & insights' },
  geo: { title: 'Geo Intelligence', subtitle: 'Geographic safety analysis' },
  moderation: { title: 'Report Moderation', subtitle: 'Review community reports' },
  users: { title: 'User Management', subtitle: 'Manage accounts & roles' },
  system: { title: 'System Monitoring', subtitle: 'Platform health & services' },
};

function AppContent() {
  const { role, setRole } = useApp();
  const [view, setView] = useState('dashboard');

  // Reset view when role changes
  useEffect(() => {
    if (role === 'user') setView('dashboard');
    if (role === 'responder') setView('dashboard');
    if (role === 'admin') setView('overview');
  }, [role]);

  // Handle demo scenario role-switch navigation
  const handleNavigate = (target: string) => {
    if (target === 'switch-user') { setRole('user'); setView('dashboard'); return; }
    if (target === 'switch-responder') { setRole('responder'); setView('dashboard'); return; }
    if (target === 'switch-admin') { setRole('admin'); setView('overview'); return; }
    if (target === 'responder-switch') { setRole('responder'); setView('dashboard'); return; }
    if (target === 'admin-switch') { setRole('admin'); setView('moderation'); return; }
    setView(target);
  };

  if (role === 'welcome') {
    return <WelcomeScreen />;
  }

  if (role === 'user') {
    const meta = viewTitles[view] || viewTitles.dashboard;
    return (
      <AppShell role="user" navItems={userNav} activeView={view} onNavigate={handleNavigate} title={meta.title} subtitle={meta.subtitle}>
        {view === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {view === 'sos' && <SOSStandalone />}
        {view === 'ai-detection' && <AIDetection />}
        {view === 'journey' && <SafeJourney />}
        {view === 'contacts' && <TrustedContacts />}
        {view === 'community-map' && <CommunityMap onNavigate={handleNavigate} />}
        {view === 'report' && <ReportIncident />}
        {view === 'notifications' && <Notifications />}
        {view === 'offline' && <OfflineConcept />}
        {view === 'demo' && <DemoScenarios onNavigate={handleNavigate} />}
        {view === 'profile' && <Profile onExit={() => setRole('welcome')} />}
      </AppShell>
    );
  }

  if (role === 'responder') {
    const meta = viewTitles[view] || viewTitles.dashboard;
    return (
      <AppShell role="responder" navItems={responderNav} activeView={view} onNavigate={handleNavigate} title={meta.title} subtitle={meta.subtitle}>
        {view === 'dashboard' && <ResponderDashboard onNavigate={handleNavigate} />}
        {view === 'map' && <ResponderMap />}
        {view === 'activity' && <ResponderDashboard onNavigate={handleNavigate} />}
      </AppShell>
    );
  }

  if (role === 'admin') {
    const meta = viewTitles[view] || viewTitles.overview;
    return (
      <AppShell role="admin" navItems={adminNav} activeView={view} onNavigate={handleNavigate} title={meta.title} subtitle={meta.subtitle}>
        {view === 'overview' && <AdminOverview onNavigate={handleNavigate} />}
        {view === 'analytics' && <AdminAnalytics />}
        {view === 'geo' && <AdminGeoIntelligence />}
        {view === 'moderation' && <AdminModeration />}
        {view === 'users' && <AdminUsers />}
        {view === 'system' && <AdminSystem />}
      </AppShell>
    );
  }

  return <WelcomeScreen />;
}

function SOSStandalone() {
  const [open, setOpen] = useState(true);
  return <SOSFlow open={open} onClose={() => setOpen(false)} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
