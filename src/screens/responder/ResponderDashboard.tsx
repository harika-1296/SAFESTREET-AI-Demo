import { useState } from 'react';
import {
  Siren, Activity, Clock, MapPin, AlertTriangle, CheckCircle2,
  Users, Shield, TrendingUp, ChevronRight, Radio, Zap, Eye,
  ArrowRight, StickyNote,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MapView } from '@/components/ui/MapView';
import { formatTimeAgo, severityConfig, incidentStatusConfig, formatDateTime } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { EmergencyIncident, IncidentStatus, MapMarker } from '@/types';

const statusFlow: IncidentStatus[] = ['new', 'acknowledged', 'assigned', 'responding', 'resolved'];

export function ResponderDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { incidents, responders } = useApp();
  const [selected, setSelected] = useState<EmergencyIncident | null>(null);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');
  const availableResponders = responders.filter((r) => r.status === 'available').length;

  const markers: MapMarker[] = activeIncidents.map((i) => ({
    id: i.id,
    lat: i.location.lat,
    lng: i.location.lng,
    category: 'emergency',
    severity: i.severity,
    label: i.location.label,
    status: i.status,
  }));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Siren} label="Active Incidents" value={activeIncidents.length} tone="emergency" sub={`${criticalIncidents.length} critical`} />
        <StatCard icon={Clock} label="Pending Response" value={incidents.filter((i) => i.status === 'new' || i.status === 'acknowledged').length} tone="warning" sub="Needs action" />
        <StatCard icon={CheckCircle2} label="Resolved Today" value={resolvedIncidents.length} tone="success" sub="Past 24 hours" />
        <StatCard icon={Users} label="Available Units" value={availableResponders} tone="lavender" sub={`${responders.length} total`} />
      </div>

      {/* Critical alerts */}
      {criticalIncidents.length > 0 && (
        <Card className="border-2 border-emergency/30 bg-emergency-light/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-emergency-dark" />
            <h3 className="text-sm font-bold text-emergency-dark uppercase tracking-wider">Critical Alerts</h3>
            <Badge tone="emergency" dot className="ml-auto">{criticalIncidents.length} active</Badge>
          </div>
          <div className="space-y-2">
            {criticalIncidents.map((inc) => (
              <div key={inc.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white cursor-pointer hover:shadow-soft transition-all" onClick={() => setSelected(inc)}>
                <div className="w-10 h-10 rounded-xl bg-emergency flex items-center justify-center shrink-0 animate-pulse-emergency">
                  <Siren size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-plum">{inc.refId} · {inc.category}</p>
                  <p className="text-xs text-muted truncate">{inc.location.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge tone={incidentStatusConfig[inc.status].tone}>{incidentStatusConfig[inc.status].label}</Badge>
                  <p className="text-[10px] text-muted mt-1">{formatTimeAgo(inc.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Live map */}
      <Card>
        <SectionTitle
          title="Live Incident Map"
          subtitle="Real-time emergency locations"
          icon={<MapPin size={18} />}
          action={<Button size="sm" variant="ghost" onClick={() => onNavigate('map')}>Full map →</Button>}
        />
        <div className="mt-4">
          <MapView markers={markers} height="300px" onMarkerClick={(m) => {
            const inc = incidents.find((i) => i.id === m.id);
            if (inc) setSelected(inc);
          }} />
        </div>
      </Card>

      {/* Incident list */}
      <Card>
        <SectionTitle
          title="Live Incidents"
          subtitle={`${activeIncidents.length} active · ${resolvedIncidents.length} resolved`}
          icon={<Activity size={18} />}
        />
        <div className="mt-4 space-y-2">
          {activeIncidents.length > 0 ? (
            activeIncidents.map((inc) => (
              <IncidentRow key={inc.id} incident={inc} onClick={() => setSelected(inc)} />
            ))
          ) : (
            <EmptyState icon={<CheckCircle2 size={24} />} title="No active incidents" message="All emergencies have been resolved. Great work." />
          )}
        </div>
        {resolvedIncidents.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-5 mb-2">
              <CheckCircle2 size={16} className="text-success-dark" />
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Resolved</span>
            </div>
            <div className="space-y-2">
              {resolvedIncidents.slice(0, 3).map((inc) => (
                <IncidentRow key={inc.id} incident={inc} onClick={() => setSelected(inc)} resolved />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Response activity */}
      <Card>
        <SectionTitle title="Response Activity" subtitle="Recent responder actions" icon={<TrendingUp size={18} />} />
        <div className="mt-4 space-y-2">
          {responders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
              <div className="w-10 h-10 rounded-xl bg-lavender-gradient flex items-center justify-center shrink-0">
                <Shield size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-plum">{r.name}</p>
                <p className="text-xs text-muted">{r.role} · {r.zone}</p>
              </div>
              <Badge tone={r.status === 'available' ? 'success' : r.status === 'responding' ? 'lavender' : 'neutral'} dot>
                {r.status === 'available' ? 'Available' : r.status === 'responding' ? 'Responding' : 'Offline'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Incident detail modal */}
      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, sub }: {
  icon: typeof Siren; label: string; value: number; tone: 'emergency' | 'warning' | 'success' | 'lavender'; sub: string;
}) {
  const tones = {
    emergency: 'bg-emergency-light text-emergency-dark',
    warning: 'bg-warning-light text-warning-dark',
    success: 'bg-success-light text-success-dark',
    lavender: 'bg-lavender-100 text-lavender-700',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', tones[tone])}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold text-plum leading-none">{value}</p>
          <p className="text-xs font-semibold text-muted mt-1">{label}</p>
          <p className="text-[10px] text-muted">{sub}</p>
        </div>
      </div>
    </Card>
  );
}

function IncidentRow({ incident, onClick }: { incident: EmergencyIncident; onClick: () => void }) {
  const sev = severityConfig[incident.severity];
  const status = incidentStatusConfig[incident.status];
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors cursor-pointer">
      <div className={cn('w-1.5 h-12 rounded-full shrink-0')} style={{ backgroundColor: sev.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-plum">{incident.refId}</span>
          <Badge tone={status.tone}>{status.label}</Badge>
          {incident.source === 'ai_detection' && <Badge tone="lavender">AI</Badge>}
        </div>
        <p className="text-xs text-muted mt-0.5 truncate">{incident.category} · {incident.location.label}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>{sev.label}</span>
        <p className="text-[10px] text-muted mt-1">{formatTimeAgo(incident.createdAt)}</p>
      </div>
      <ChevronRight size={16} className="text-muted shrink-0" />
    </div>
  );
}

export function IncidentDetailModal({ incident, onClose }: { incident: EmergencyIncident | null; onClose: () => void }) {
  const { updateIncidentStatus, addIncidentNote, responders } = useApp();
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  if (!incident) return null;

  const sev = severityConfig[incident.severity];
  const status = incidentStatusConfig[incident.status];
  const currentIdx = statusFlow.indexOf(incident.status);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;
  const availableResponders = responders.filter((r) => r.status === 'available');

  const handleAdvance = () => {
    if (!nextStatus) return;
    const responder = incident.status === 'acknowledged' ? availableResponders[0]?.name : incident.responderName;
    updateIncidentStatus(incident.id, nextStatus, responder);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addIncidentNote(incident.id, note);
    setNote('');
    setShowNote(false);
  };

  return (
    <Modal open={!!incident} onClose={onClose} title={`Incident ${incident.refId}`} className="sm:max-w-2xl">
      <div className="space-y-4">
        {/* Status header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge tone={status.tone} dot>{status.label}</Badge>
            <span className={cn('text-xs font-bold px-2 py-1 rounded-full', sev.bg, sev.text)}>{sev.label} Severity</span>
            {incident.source === 'ai_detection' && <Badge tone="lavender">AI-Detected</Badge>}
          </div>
          <span className="text-xs text-muted">{formatDateTime(incident.createdAt)}</span>
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-lavender-50/50">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-plum">{incident.description}</p>
        </div>

        {/* Location */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-lavender-50/40">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Location</p>
            <p className="text-sm text-plum flex items-center gap-1.5"><MapPin size={14} className="text-lavender-500" /> {incident.location.label}</p>
          </div>
          <div className="p-3 rounded-2xl bg-lavender-50/40">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">User</p>
            <p className="text-sm text-plum">{incident.userName}</p>
            <p className="text-xs text-muted">{incident.userPhone}</p>
          </div>
        </div>

        {/* AI Risk Assessment */}
        {incident.aiRiskScore && (
          <div className="p-4 rounded-2xl bg-warning-light/20 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-warning-dark" />
              <span className="text-sm font-bold text-plum">AI Risk Assessment</span>
              <Badge tone="warning">Advisory Only</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-plum">{incident.aiRiskScore}<span className="text-sm text-muted">/100</span></p>
                <p className="text-[10px] text-muted">Risk Score</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-plum capitalize">{incident.aiConfidence}</p>
                <p className="text-[10px] text-muted">Confidence</p>
              </div>
              <p className="text-xs text-muted flex-1">This is a probabilistic assessment, not a confirmed fact. Use alongside other information.</p>
            </div>
          </div>
        )}

        {/* Map */}
        <MapView markers={[{ id: incident.id, lat: incident.location.lat, lng: incident.location.lng, category: 'emergency', severity: incident.severity, label: incident.location.label }]} height="180px" />

        {/* Contacts notified */}
        {incident.contactsNotified.length > 0 && (
          <div className="p-3 rounded-2xl bg-lavender-50/40">
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Trusted Contacts Notified (Simulated)</p>
            <div className="flex flex-wrap gap-2">
              {incident.contactsNotified.map((c, i) => (
                <Badge key={i} tone="success" dot>{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-4 rounded-2xl bg-lavender-50/40">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Incident Timeline</p>
          <div className="space-y-3">
            {incident.timeline.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    i === incident.timeline.length - 1 ? 'bg-lavender-400' : 'bg-lavender-200'
                  )}>
                    {event.type === 'created' && <Siren size={13} className="text-white" />}
                    {event.type === 'acknowledged' && <Eye size={13} className="text-white" />}
                    {event.type === 'assigned' && <Users size={13} className="text-white" />}
                    {event.type === 'responding' && <Activity size={13} className="text-white" />}
                    {event.type === 'resolved' && <CheckCircle2 size={13} className="text-white" />}
                    {event.type === 'note' && <StickyNote size={13} className="text-white" />}
                    {event.type === 'contact_notified' && <Radio size={13} className="text-white" />}
                    {event.type === 'ai_detected' && <Zap size={13} className="text-white" />}
                    {event.type === 'cancelled' && <AlertTriangle size={13} className="text-white" />}
                  </div>
                  {i < incident.timeline.length - 1 && <div className="w-0.5 flex-1 bg-lavender-200 my-1" />}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-plum">{event.label}</p>
                  <p className="text-xs text-muted">{formatTimeAgo(event.timestamp)}{event.actor && ` · ${event.actor}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management actions */}
        {incident.status !== 'resolved' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-lavender-100/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                {statusFlow.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      i <= currentIdx ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-muted'
                    )}>
                      {incidentStatusConfig[s].label}
                    </span>
                    {i < statusFlow.length - 1 && <ArrowRight size={10} className="text-lavender-300" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {nextStatus && (
                <Button size="sm" onClick={handleAdvance}>
                  {incident.status === 'new' && 'Acknowledge'}
                  {incident.status === 'acknowledged' && 'Assign Responder'}
                  {incident.status === 'assigned' && 'Start Responding'}
                  {incident.status === 'responding' && 'Mark Resolved'}
                  <ArrowRight size={14} />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowNote(!showNote)}>
                <StickyNote size={14} /> Add Note
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateIncidentStatus(incident.id, 'resolved')}>
                <CheckCircle2 size={14} /> Resolve
              </Button>
            </div>

            {showNote && (
              <div className="flex gap-2 animate-fade-in">
                <input
                  className="input-field flex-1"
                  placeholder="Add a note about this incident..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button size="sm" onClick={handleAddNote}>Add</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
