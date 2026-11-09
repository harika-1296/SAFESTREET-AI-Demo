import { useState } from 'react';
import {
  Siren, MapPin, Users, FileText, Navigation, Shield, Bell,
  TrendingUp, AlertTriangle, Activity, ChevronRight,
  CircleDot, Footprints, Car, Bus, Bike, TrainFront,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/ui/MapView';
import { SOSFlow } from '@/screens/user/SOSFlow';
import { formatTimeAgo, severityConfig, categoryConfig } from '@/utils/helpers';
import type { MapMarker } from '@/types';
import { cn } from '@/utils/cn';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { userProfile, contacts, journeys, reports, notifications, incidents, connectivity } = useApp();
  const [sosOpen, setSosOpen] = useState(false);

  const activeJourney = journeys.find((j) => j.status === 'active');
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentReports = reports.filter((r) => r.status === 'approved').slice(0, 3);
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const mapMarkers: MapMarker[] = reports
    .filter((r) => r.status === 'approved')
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      lat: r.location.lat,
      lng: r.location.lng,
      category: r.category,
      severity: r.severity,
      label: r.location.label,
      status: r.status,
    }));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Greeting + status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">{greeting}, {userProfile.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success-dark">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              You're Safe
            </span>
            <span className="text-muted">·</span>
            <span className="text-sm text-muted">AI monitoring active</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-3 rounded-2xl bg-white shadow-soft hover:shadow-card transition-all"
        >
          <Bell size={20} className="text-plum" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emergency text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* SOS + Location */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* SOS Button card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center bg-lavender-soft border border-lavender-100">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Emergency SOS</p>
          <div className="relative mb-5">
            <span className="absolute inset-0 rounded-full bg-emergency/15 animate-ping-slow" />
            <button
              onClick={() => setSosOpen(true)}
              className="relative w-36 h-36 rounded-full bg-emergency text-white flex flex-col items-center justify-center shadow-glow-emergency hover:scale-105 active:scale-95 transition-transform"
            >
              <Siren size={44} />
              <span className="text-base font-extrabold mt-1.5">SOS</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">Press for help</span>
            </button>
          </div>
          <p className="text-xs text-muted max-w-[200px]">
            One-tap emergency with countdown, location sharing & contact notification
          </p>
          <button
            onClick={() => onNavigate('ai-detection')}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-lavender-700 hover:gap-2.5 transition-all"
          >
            <Shield size={13} /> AI-Assisted Detection
            <ChevronRight size={13} />
          </button>
        </Card>

        {/* Location card */}
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Your Location"
            subtitle="Bengaluru, India · Simulated"
            icon={<MapPin size={18} />}
            action={<Badge tone="success" dot>Live</Badge>}
          />
          <div className="mt-4">
            <MapView markers={mapMarkers} height="220px" />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-muted">Current area: MG Road, Central Bengaluru</span>
            <button onClick={() => onNavigate('community-map')} className="font-semibold text-lavender-700 hover:underline">
              View safety map →
            </button>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction icon={Navigation} label="Safe Journey" desc="Track your trip" onClick={() => onNavigate('journey')} color="#7658A6" />
        <QuickAction icon={Users} label="Trusted Contacts" desc={`${contacts.length} contacts`} onClick={() => onNavigate('contacts')} color="#B9A5DE" />
        <QuickAction icon={FileText} label="Report Incident" desc="Report a hazard" onClick={() => onNavigate('report')} color="#E5A44D" />
        <QuickAction icon={MapPin} label="Nearby Safety" desc="Safe places & alerts" onClick={() => onNavigate('community-map')} color="#5BAE7E" />
      </div>

      {/* Active journey */}
      {activeJourney && (
        <Card className="border-lavender-200 bg-lavender-50/40">
          <SectionTitle
            title="Active Journey"
            subtitle={`Started ${formatTimeAgo(activeJourney.startedAt)}`}
            icon={<Navigation size={18} />}
            action={<Badge tone="lavender" dot>Active</Badge>}
          />
          <div className="mt-4">
            <JourneyProgressCard journey={activeJourney} onNavigate={onNavigate} />
          </div>
        </Card>
      )}

      {/* Two columns: alerts + community */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent safety alerts */}
        <Card>
          <SectionTitle
            title="Safety Alerts"
            subtitle="Recent notifications"
            icon={<AlertTriangle size={18} />}
            action={<button onClick={() => onNavigate('notifications')} className="text-xs font-semibold text-lavender-700">View all</button>}
          />
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors cursor-pointer" onClick={() => onNavigate('notifications')}>
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  n.type === 'emergency' ? 'bg-emergency-light' : n.type === 'journey' ? 'bg-lavender-100' : n.type === 'community' ? 'bg-nude-100' : 'bg-lavender-100/60'
                )}>
                  {n.type === 'emergency' && <Siren size={16} className="text-emergency-dark" />}
                  {n.type === 'journey' && <Navigation size={16} className="text-lavender-700" />}
                  {n.type === 'community' && <FileText size={16} className="text-nude-700" />}
                  {n.type === 'responder' && <Shield size={16} className="text-lavender-700" />}
                  {n.type === 'contact' && <Users size={16} className="text-lavender-600" />}
                  {n.type === 'system' && <Activity size={16} className="text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-plum truncate">{n.title}</p>
                  <p className="text-xs text-muted truncate">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted shrink-0">{formatTimeAgo(n.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Community safety updates */}
        <Card>
          <SectionTitle
            title="Community Updates"
            subtitle="Nearby reported incidents"
            icon={<TrendingUp size={18} />}
            action={<button onClick={() => onNavigate('community-map')} className="text-xs font-semibold text-lavender-700">Map view</button>}
          />
          <div className="mt-4 space-y-3">
            {recentReports.length > 0 ? recentReports.map((r) => {
              const cat = categoryConfig[r.category];
              const sev = severityConfig[r.severity];
              return (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors cursor-pointer" onClick={() => onNavigate('community-map')}>
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: sev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-plum">{cat.label}</p>
                      <Badge tone={r.severity === 'critical' ? 'emergency' : r.severity === 'high' ? 'warning' : 'neutral'}>{sev.label}</Badge>
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">{r.location.label}</p>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{formatTimeAgo(r.createdAt)}</span>
                </div>
              );
            }) : (
              <EmptyState icon={<FileText size={24} />} title="No community reports" message="Be the first to report a safety issue in your area" />
            )}
          </div>
        </Card>
      </div>

      {/* Emergency assistance */}
      <Card className="bg-plum text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold">Emergency Assistance</h3>
              <p className="text-sm text-white/70 mt-0.5">24/7 simulated response coordination</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSosOpen(true)}>
            <Siren size={15} /> Activate SOS
          </Button>
        </div>
        {activeIncidents.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-white/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emergency animate-pulse-soft" />
            <span className="text-sm font-medium">{activeIncidents.length} active emergency {activeIncidents.length === 1 ? 'incident' : 'incidents'} being coordinated</span>
          </div>
        )}
      </Card>

      {/* Offline warning */}
      {connectivity !== 'online' && (
        <div className="p-4 rounded-2xl bg-warning-light border border-warning/20 flex items-center gap-3 animate-fade-in">
          <AlertTriangle size={18} className="text-warning-dark shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-dark">
              {connectivity === 'offline' ? 'You are offline' : 'Weak connection detected'}
            </p>
            <p className="text-xs text-warning-dark/80 mt-0.5">
              {connectivity === 'offline'
                ? 'Reports will be saved locally and synced when connection returns. SOS still works.'
                : 'Some features may be slower. Reports will sync when connection improves.'}
            </p>
          </div>
          <button onClick={() => onNavigate('offline')} className="text-xs font-semibold text-warning-dark hover:underline shrink-0">
            Learn more
          </button>
        </div>
      )}

      <SOSFlow open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick, color }: {
  icon: typeof Siren; label: string; desc: string; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} className="group bg-white rounded-3xl shadow-card hover:shadow-elevated p-4 text-left hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-sm font-bold text-plum">{label}</p>
      <p className="text-xs text-muted mt-0.5">{desc}</p>
    </button>
  );
}

function JourneyProgressCard({ journey, onNavigate }: { journey: NonNullable<ReturnType<typeof useApp>['journeys'][0]>; onNavigate: (v: string) => void }) {
  const modeIcons: Record<string, typeof Car> = {
    walk: Footprints, bike: Bike, car: Car, bus: Bus, auto_rickshaw: Car, train: TrainFront,
  };
  const ModeIcon = modeIcons[journey.mode] || Car;
  return (
    <div onClick={() => onNavigate('journey')} className="cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-lavender-200 flex items-center justify-center">
          <ModeIcon size={18} className="text-lavender-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-plum truncate">{journey.destination}</p>
          <p className="text-xs text-muted">from {journey.origin}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted">ETA</p>
          <p className="text-sm font-bold text-plum">{journey.etaMinutes} min</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-lavender-100 overflow-hidden">
        <div className="h-full bg-lavender-gradient rounded-full transition-all duration-500" style={{ width: `${journey.progress}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted">
        <span className="flex items-center gap-1"><CircleDot size={11} className="text-success" /> In progress</span>
        <span>{journey.progress}% complete</span>
      </div>
    </div>
  );
}
