import { useState, useEffect, useRef } from 'react';
import {
  Siren, X, Phone, MapPin, AlertTriangle, CheckCircle2, XCircle,
  Shield, ShieldAlert, Users, Activity, Bell, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Card';
import { formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';

const COUNTDOWN_SECONDS = 5;

export function SOSFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    emergencyStatus, startSOSCountdown, cancelSOSCountdown,
    activateEmergency, cancelEmergency, activeIncidentId,
    incidents, contacts,
  } = useApp();

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeIncident = incidents.find((i) => i.id === activeIncidentId);

  useEffect(() => {
    if (emergencyStatus !== 'countdown') {
      setCountdown(COUNTDOWN_SECONDS);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          activateEmergency('manual_sos');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [emergencyStatus, activateEmergency]);

  if (!open) return null;

  const handleClose = () => {
    if (emergencyStatus === 'countdown') {
      cancelSOSCountdown();
    }
    onClose();
  };

  const contactsNotified = activeIncident?.contactsNotified || [];

  return (
    <>
      <Modal open={open} onClose={handleClose} hideClose className="sm:max-w-md">
        {emergencyStatus === 'countdown' && (
          <CountdownView
            countdown={countdown}
            onCancel={() => cancelSOSCountdown()}
          />
        )}

        {emergencyStatus === 'active' && activeIncident && (
          <ActiveEmergencyView
            incident={activeIncident}
            contacts={contacts.filter((c) => c.notifyOnEmergency)}
            contactsNotified={contactsNotified}
            onCancelFalseAlarm={() => setConfirmCancel(true)}
            onClose={onClose}
          />
        )}

        {(emergencyStatus === 'idle' || emergencyStatus === 'false_alarm' || emergencyStatus === 'resolved') && (
          <SOSIdleView
            onActivate={startSOSCountdown}
            onDismiss={onClose}
            isFalseAlarm={emergencyStatus === 'false_alarm'}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancelEmergency(true)}
        title="Cancel Emergency?"
        message="This will mark the incident as a false alarm and notify your contacts and responders that you are safe."
        confirmLabel="Yes, Cancel SOS"
        cancelLabel="Keep Active"
        danger
      />
    </>
  );
}

function SOSIdleView({ onActivate, onDismiss, isFalseAlarm }: { onActivate: () => void; onDismiss: () => void; isFalseAlarm: boolean }) {
  return (
    <div className="text-center py-4">
      {isFalseAlarm && (
        <div className="flex items-center justify-center gap-2 mb-4 text-success-dark">
          <CheckCircle2 size={20} />
          <span className="text-sm font-semibold">False alarm cancelled successfully</span>
        </div>
      )}

      <div className="relative w-32 h-32 mx-auto mb-6">
        <span className="absolute inset-0 rounded-full bg-emergency/20 animate-ping-slow" />
        <button
          onClick={onActivate}
          className="relative w-32 h-32 rounded-full bg-emergency text-white flex flex-col items-center justify-center shadow-glow-emergency hover:scale-105 active:scale-95 transition-transform"
        >
          <Siren size={40} />
          <span className="text-sm font-bold mt-1">SOS</span>
        </button>
      </div>

      <h3 className="text-xl font-bold text-plum">Emergency SOS</h3>
      <p className="text-sm text-muted mt-2 max-w-xs mx-auto">
        Press the SOS button to trigger an emergency alert. A {COUNTDOWN_SECONDS}-second countdown
        will let you cancel if it was accidental.
      </p>

      <div className="grid grid-cols-3 gap-2 mt-6 text-xs">
        <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-lavender-50">
          <Bell size={16} className="text-lavender-600" />
          <span className="text-plum-muted font-medium">Alerts Contacts</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-lavender-50">
          <MapPin size={16} className="text-lavender-600" />
          <span className="text-plum-muted font-medium">Shares Location</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-lavender-50">
          <Shield size={16} className="text-lavender-600" />
          <span className="text-plum-muted font-medium">Notifies Responders</span>
        </div>
      </div>

      <button onClick={onDismiss} className="mt-6 text-sm font-semibold text-muted hover:text-plum transition-colors">
        Dismiss
      </button>
    </div>
  );
}

function CountdownView({ countdown, onCancel }: { countdown: number; onCancel: () => void }) {
  const pct = (countdown / COUNTDOWN_SECONDS) * 100;
  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-emergency" />
        <span className="text-sm font-bold text-emergency uppercase tracking-wider">Emergency Countdown</span>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#F8DCE0" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#D94C5C" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-emergency">{countdown}</span>
          <span className="text-xs text-muted font-semibold mt-1">seconds</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-plum">Triggering SOS in {countdown}s</h3>
      <p className="text-sm text-muted mt-2 max-w-xs mx-auto">
        Your location will be shared and trusted contacts will be notified.
      </p>

      <Button variant="outline" fullWidth size="lg" onClick={onCancel} className="mt-6">
        <X size={18} /> Cancel SOS
      </Button>
    </div>
  );
}

function ActiveEmergencyView({
  incident, contacts, contactsNotified, onCancelFalseAlarm, onClose,
}: {
  incident: NonNullable<ReturnType<typeof useApp>['incidents'][0]>;
  contacts: ReturnType<typeof useApp>['contacts'];
  contactsNotified: string[];
  onCancelFalseAlarm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="py-2">
      {/* Emergency header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emergency text-white text-xs font-bold uppercase tracking-wider mb-3 animate-pulse-emergency">
          <ShieldAlert size={14} />
          Emergency Active
        </div>
        <h3 className="text-xl font-bold text-plum">Help is Being Coordinated</h3>
        <p className="text-xs text-muted mt-1">Incident {incident.refId}</p>
      </div>

      {/* Location */}
      <div className="rounded-2xl bg-emergency-light/50 border border-emergency-light p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emergency flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-emergency-dark uppercase tracking-wider">Your Location (Live)</div>
            <p className="text-sm font-medium text-plum mt-0.5">{incident.location.label}</p>
            <p className="text-xs text-muted mt-1">Simulated GPS coordinates shared with responders</p>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-2xl bg-lavender-50/60 border border-lavender-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-lavender-700" />
          <span className="text-sm font-bold text-plum">Live Incident Timeline</span>
        </div>
        <div className="space-y-3">
          {incident.timeline.slice(-4).map((event, i) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  i === incident.timeline.slice(-4).length - 1 ? 'bg-emergency' : 'bg-lavender-200'
                )}>
                  {event.type === 'created' && <Siren size={13} className="text-white" />}
                  {event.type === 'contact_notified' && <Bell size={13} className="text-white" />}
                  {event.type === 'acknowledged' && <Shield size={13} className="text-white" />}
                  {event.type === 'assigned' && <Users size={13} className="text-white" />}
                  {event.type === 'responding' && <Activity size={13} className="text-white" />}
                  {event.type === 'resolved' && <CheckCircle2 size={13} className="text-white" />}
                  {event.type === 'cancelled' && <XCircle size={13} className="text-white" />}
                </div>
                {i < incident.timeline.slice(-4).length - 1 && <div className="w-0.5 flex-1 bg-lavender-200 my-1" />}
              </div>
              <div className="flex-1 pb-1">
                <p className="text-sm font-medium text-plum">{event.label}</p>
                <p className="text-xs text-muted">{formatTimeAgo(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts notified */}
      <div className="rounded-2xl bg-white border border-lavender-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-lavender-700" />
          <span className="text-sm font-bold text-plum">Trusted Contacts Notified</span>
          <Badge tone="success" className="ml-auto">Simulated</Badge>
        </div>
        {contactsNotified.length > 0 ? (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-lavender-50/50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: c.avatarColor }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-plum">{c.name}</p>
                  <p className="text-xs text-muted">{c.relationship}</p>
                </div>
                <Badge tone="success" dot>Notified</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-2">No emergency contacts configured</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-plum text-white hover:bg-plum-light transition-colors">
          <div className="flex items-center gap-3">
            <Phone size={18} />
            <span className="text-sm font-semibold">Call Emergency Helpline (Simulated)</span>
          </div>
          <ChevronRight size={18} />
        </button>

        <Button variant="outline" fullWidth size="lg" onClick={onCancelFalseAlarm}>
          <XCircle size={18} /> Cancel — False Alarm
        </Button>

        <button onClick={onClose} className="w-full text-sm font-semibold text-muted hover:text-plum transition-colors pt-2">
          Close & Keep Running in Background
        </button>
      </div>
    </div>
  );
}
