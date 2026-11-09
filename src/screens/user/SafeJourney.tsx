import { useState, useEffect, useRef } from 'react';
import {
  Navigation, MapPin, Flag, Users, CheckCircle2,
  XCircle, AlertTriangle, Footprints, Car, Bus, Bike, TrainFront,
  Plus, Bell,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MapView } from '@/components/ui/MapView';
import { formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { JourneyMode, MapMarker } from '@/types';

const modes: { id: JourneyMode; label: string; icon: typeof Car }[] = [
  { id: 'walk', label: 'Walk', icon: Footprints },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'auto_rickshaw', label: 'Auto', icon: Car },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'train', label: 'Train', icon: TrainFront },
];

export function SafeJourney() {
  const { journeys, startJourney, completeJourney, cancelJourney, updateJourney, contacts, addNotification } = useApp();
  const [startOpen, setStartOpen] = useState(false);
  const [form, setForm] = useState({
    origin: 'Current Location',
    destination: '',
    mode: 'walk' as JourneyMode,
    etaMinutes: 20,
    shareWith: [] as string[],
  });
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeJourney = journeys.find((j) => j.status === 'active');
  const overdueJourney = journeys.find((j) => j.status === 'overdue');

  useEffect(() => {
    if (!activeJourney) {
      if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null; }
      return;
    }
    progressTimer.current = setInterval(() => {
      updateJourney(activeJourney.id, {
        progress: Math.min(activeJourney.progress + 2, 95),
      });
    }, 3000);
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [activeJourney?.id, activeJourney?.progress, updateJourney]);

  const handleStart = () => {
    if (!form.destination) return;
    const contactNames = contacts.filter((c) => form.shareWith.includes(c.id)).map((c) => c.name);
    startJourney({
      origin: form.origin,
      destination: form.destination,
      mode: form.mode,
      etaMinutes: form.etaMinutes,
      sharedWith: form.shareWith,
      contactNames,
    });
    setForm({ origin: 'Current Location', destination: '', mode: 'walk', etaMinutes: 20, shareWith: [] });
    setStartOpen(false);
  };

  const handleSimulateOverdue = () => {
    if (!activeJourney) return;
    updateJourney(activeJourney.id, { status: 'overdue', progress: 60 });
    addNotification({
      type: 'journey',
      title: 'Journey Overdue',
      message: `Your journey to ${activeJourney.destination} has exceeded the expected arrival time. Trusted contacts have been notified.`,
    });
  };

  const toggleShare = (id: string) => {
    setForm((f) => ({
      ...f,
      shareWith: f.shareWith.includes(id) ? f.shareWith.filter((x) => x !== id) : [...f.shareWith, id],
    }));
  };

  const markers: MapMarker[] = activeJourney
    ? [
        { id: 'start', lat: 12.9756, lng: 77.6069, category: 'poor_lighting', severity: 'low', label: activeJourney.origin },
        { id: 'end', lat: 12.9352, lng: 77.6245, category: 'unsafe_area', severity: 'high', label: activeJourney.destination },
      ]
    : [];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Safe Journey</h2>
          <p className="text-sm text-muted mt-1">Track your trip and share with trusted contacts</p>
        </div>
        {!activeJourney && (
          <Button size="sm" onClick={() => setStartOpen(true)}>
            <Plus size={16} /> Start Journey
          </Button>
        )}
      </div>

      {activeJourney && (
        <ActiveJourneyCard
          journey={activeJourney}
          markers={markers}
          onComplete={() => completeJourney(activeJourney.id)}
          onCancel={() => cancelJourney(activeJourney.id)}
          onSimulateOverdue={handleSimulateOverdue}
        />
      )}

      {overdueJourney && !activeJourney && (
        <Card className="border-2 border-warning/30 bg-warning-light/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-warning-dark" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-plum">Journey Overdue</h3>
              <p className="text-xs text-muted mt-0.5">Trip to {overdueJourney.destination} exceeded ETA. Contacts notified.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => completeJourney(overdueJourney.id)}>
              <CheckCircle2 size={15} /> Mark Safe
            </Button>
          </div>
        </Card>
      )}

      {/* Past journeys */}
      <Card>
        <SectionTitle title="Journey History" subtitle="Recent trips" icon={<Navigation size={18} />} />
        <div className="mt-4 space-y-3">
          {journeys.filter((j) => j.status !== 'active').length === 0 ? (
            <EmptyState icon={<Navigation size={24} />} title="No past journeys" message="Your completed journeys will appear here" />
          ) : (
            journeys.filter((j) => j.status !== 'active').map((j) => {
              const mode = modes.find((m) => m.id === j.mode);
              const ModeIcon = mode?.icon || Car;
              return (
                <div key={j.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
                  <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
                    <ModeIcon size={18} className="text-lavender-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-plum truncate">{j.destination}</p>
                    <p className="text-xs text-muted">from {j.origin} · {formatTimeAgo(j.startedAt)}</p>
                  </div>
                  <Badge tone={j.status === 'completed' ? 'success' : j.status === 'overdue' ? 'warning' : 'neutral'}>
                    {j.status === 'completed' ? 'Completed' : j.status === 'overdue' ? 'Overdue' : 'Cancelled'}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Info */}
      <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-100 flex items-start gap-3">
        <Bell size={18} className="text-lavender-700 shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          If your journey isn't completed within the expected time, SafeStreet AI alerts your trusted contacts
          with your last known location. You can simulate an overdue scenario to see this flow in action.
        </p>
      </div>

      {/* Start journey modal */}
      <Modal open={startOpen} onClose={() => setStartOpen(false)} title="Start Safe Journey">
        <div className="space-y-4">
          <div>
            <label className="label-text">Starting From</label>
            <input className="input-field" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Destination</label>
            <input className="input-field" placeholder="e.g. Koramangala 5th Block" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Transport Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {modes.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setForm({ ...form, mode: m.id })}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors',
                      form.mode === m.id ? 'bg-lavender-200 text-plum' : 'bg-lavender-50/50 text-muted hover:bg-lavender-100/60'
                    )}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label-text">Expected Arrival (minutes)</label>
            <input type="number" className="input-field" value={form.etaMinutes} onChange={(e) => setForm({ ...form, etaMinutes: parseInt(e.target.value) || 20 })} min={1} />
          </div>
          <div>
            <label className="label-text">Share With Trusted Contacts</label>
            <div className="space-y-2">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleShare(c.id)}
                  className={cn(
                    'flex items-center gap-3 w-full p-2.5 rounded-2xl transition-colors',
                    form.shareWith.includes(c.id) ? 'bg-lavender-100' : 'bg-lavender-50/40 hover:bg-lavender-50'
                  )}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.avatarColor }}>
                    {c.name.charAt(0)}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-plum">{c.name}</span>
                  {form.shareWith.includes(c.id) && <CheckCircle2 size={16} className="text-lavender-600" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setStartOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleStart} disabled={!form.destination}>Start Journey</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ActiveJourneyCard({ journey, markers, onComplete, onCancel, onSimulateOverdue }: {
  journey: NonNullable<ReturnType<typeof useApp>['journeys'][0]>;
  markers: MapMarker[];
  onComplete: () => void;
  onCancel: () => void;
  onSimulateOverdue: () => void;
}) {
  const mode = modes.find((m) => m.id === journey.mode);
  const ModeIcon = mode?.icon || Car;

  return (
    <>
      <Card className={cn('border-2', journey.status === 'overdue' ? 'border-warning/30 bg-warning-light/10' : 'border-lavender-200 bg-lavender-50/30')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lavender-gradient flex items-center justify-center">
              <ModeIcon size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-plum">{journey.destination}</h3>
              <p className="text-xs text-muted">from {journey.origin}</p>
            </div>
          </div>
          <Badge tone={journey.status === 'overdue' ? 'warning' : 'lavender'} dot>
            {journey.status === 'overdue' ? 'Overdue' : 'Active'}
          </Badge>
        </div>

        {/* Route map */}
        <MapView markers={markers} height="200px" />

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-plum">Journey Progress</span>
            <span className="text-muted">{journey.progress}% · ETA {journey.etaMinutes} min</span>
          </div>
          <div className="h-2.5 rounded-full bg-lavender-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000', journey.status === 'overdue' ? 'bg-warning' : 'bg-lavender-gradient')}
              style={{ width: `${journey.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} className="text-success" /> {journey.origin}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Flag size={12} className="text-emergency" /> {journey.destination}
            </div>
          </div>
        </div>

        {/* Sharing */}
        {journey.contactNames.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-white flex items-center gap-3">
            <Users size={16} className="text-lavender-600" />
            <span className="text-sm text-plum-muted">Shared with {journey.contactNames.join(', ')}</span>
            <Badge tone="success" className="ml-auto" dot>Tracking</Badge>
          </div>
        )}

        {journey.status === 'overdue' && (
          <div className="mt-3 p-3 rounded-2xl bg-warning-light flex items-center gap-3">
            <AlertTriangle size={18} className="text-warning-dark shrink-0" />
            <p className="text-xs text-warning-dark font-medium">Trusted contacts have been notified about the delay (simulated).</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="primary" onClick={onComplete}>
            <CheckCircle2 size={15} /> Mark as Arrived
          </Button>
          {journey.status !== 'overdue' && (
            <Button size="sm" variant="warning" onClick={onSimulateOverdue}>
              <AlertTriangle size={15} /> Simulate Overdue
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onCancel}>
            <XCircle size={15} /> Cancel
          </Button>
        </div>
      </Card>
    </>
  );
}
