import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import {
  User, Phone, Mail, Heart, Shield, Bell, Lock, Eye, Accessibility,
  LogOut, ChevronRight, MapPin, Droplet, Clock, Users as UsersIcon,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function Profile({ onExit }: { onExit: () => void }) {
  const { userProfile, contacts, setRole } = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [permModal, setPermModal] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emergencyAlerts: true,
    journeyAlerts: true,
    communityAlerts: false,
    shareLocation: true,
    anonymousByDefault: false,
    largeText: false,
    reduceMotion: false,
    highContrast: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Profile header */}
      <Card className="bg-lavender-soft border border-lavender-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-lavender-gradient flex items-center justify-center text-white text-2xl font-extrabold shadow-soft">
            {userProfile.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-plum">{userProfile.name}</h2>
            <p className="text-sm text-muted">{userProfile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge tone="success" dot>Active</Badge>
              <Badge tone="lavender">Demo Account</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card>
        <SectionTitle title="Personal Information" icon={<User size={18} />} />
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <InfoRow icon={Phone} label="Phone" value={userProfile.phone} />
          <InfoRow icon={Mail} label="Email" value={userProfile.email} />
          <InfoRow icon={Clock} label="Age" value={userProfile.age} />
          <InfoRow icon={Droplet} label="Blood Group" value={userProfile.bloodGroup} />
        </div>
      </Card>

      {/* Emergency details */}
      <Card>
        <SectionTitle title="Emergency Details" icon={<Heart size={18} />} />
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-2xl bg-emergency-light/30">
            <p className="text-xs font-bold text-emergency-dark uppercase tracking-wider mb-1">Emergency Note</p>
            <p className="text-sm text-plum">{userProfile.emergencyNote}</p>
          </div>
          <InfoRow icon={Heart} label="Medical Conditions" value={userProfile.medicalConditions} />
          <div className="p-3 rounded-2xl bg-lavender-50/50">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon size={16} className="text-lavender-600" />
              <span className="text-sm font-semibold text-plum">Trusted Contacts ({contacts.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {contacts.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-xs font-medium text-plum-muted">
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.avatarColor }}>
                    {c.name.charAt(0)}
                  </span>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card>
        <SectionTitle title="Permissions" icon={<Shield size={18} />} />
        <div className="mt-4 space-y-2">
          <PermRow icon={MapPin} label="Location Access" status="Granted" onClick={() => setPermModal('location')} />
          <PermRow icon={Bell} label="Notifications" status="Granted" onClick={() => setPermModal('notifications')} />
          <PermRow icon={Eye} label="Microphone (AI Detection)" status="Granted" onClick={() => setPermModal('microphone')} />
          <PermRow icon={Shield} label="Background Monitoring" status="Granted" onClick={() => setPermModal('background')} />
        </div>
      </Card>

      {/* Notification settings */}
      <Card>
        <SectionTitle title="Notification Settings" icon={<Bell size={18} />} />
        <div className="mt-4 space-y-2">
          <SettingToggle icon={Bell} label="Push Notifications" checked={settings.pushNotifications} onChange={() => toggle('pushNotifications')} />
          <SettingToggle icon={Shield} label="Emergency Alerts" checked={settings.emergencyAlerts} onChange={() => toggle('emergencyAlerts')} />
          <SettingToggle icon={MapPin} label="Journey Alerts" checked={settings.journeyAlerts} onChange={() => toggle('journeyAlerts')} />
          <SettingToggle icon={CheckCircle2} label="Community Alerts" checked={settings.communityAlerts} onChange={() => toggle('communityAlerts')} />
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <SectionTitle title="Privacy Settings" icon={<Lock size={18} />} />
        <div className="mt-4 space-y-2">
          <SettingToggle icon={MapPin} label="Share Live Location" checked={settings.shareLocation} onChange={() => toggle('shareLocation')} />
          <SettingToggle icon={Eye} label="Anonymous Reporting by Default" checked={settings.anonymousByDefault} onChange={() => toggle('anonymousByDefault')} />
        </div>
      </Card>

      {/* Accessibility */}
      <Card>
        <SectionTitle title="Accessibility" icon={<Accessibility size={18} />} />
        <div className="mt-4 space-y-2">
          <SettingToggle icon={Eye} label="Large Text" checked={settings.largeText} onChange={() => toggle('largeText')} />
          <SettingToggle icon={Accessibility} label="Reduce Motion" checked={settings.reduceMotion} onChange={() => toggle('reduceMotion')} />
          <SettingToggle icon={Eye} label="High Contrast" checked={settings.highContrast} onChange={() => toggle('highContrast')} />
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={() => setLogoutOpen(true)} className="w-full flex items-center justify-between p-4 rounded-3xl bg-white shadow-card hover:shadow-elevated transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emergency-light flex items-center justify-center">
              <LogOut size={18} className="text-emergency-dark" />
            </div>
            <div>
              <p className="text-sm font-bold text-plum">Logout</p>
              <p className="text-xs text-muted">Return to welcome screen</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-muted">SafeStreet AI · Prototype v1.0</p>
        <p className="text-xs text-muted mt-1">All data is stored locally in your browser</p>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => { setRole('welcome'); onExit(); }}
        title="Logout?"
        message="You'll return to the welcome screen. Your demo data will be preserved."
        confirmLabel="Logout"
      />

      <Modal open={!!permModal} onClose={() => setPermModal(null)} title="Permission Details">
        {permModal && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-lavender-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-success-dark" />
                <span className="text-sm font-bold text-success-dark">Permission Granted</span>
              </div>
              <p className="text-sm text-plum">
                {permModal === 'location' && 'Location access allows SafeStreet AI to share your position with trusted contacts during emergencies and track your safe journeys.'}
                {permModal === 'notifications' && 'Notifications keep you informed about emergencies, journey updates, and community safety alerts.'}
                {permModal === 'microphone' && 'Microphone access enables AI-assisted emergency detection. Audio is processed locally and only during active monitoring sessions. No always-on recording.'}
                {permModal === 'background' && 'Background monitoring allows the app to detect potential emergencies even when not actively open. This is simulated in the prototype.'}
              </p>
            </div>
            <Button fullWidth variant="outline" onClick={() => setPermModal(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
      <Icon size={16} className="text-lavender-600 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-plum truncate">{value}</p>
      </div>
    </div>
  );
}

function PermRow({ icon: Icon, label, status, onClick }: { icon: typeof User; label: string; status: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors text-left">
      <Icon size={16} className="text-lavender-600 shrink-0" />
      <span className="flex-1 text-sm font-medium text-plum">{label}</span>
      <Badge tone="success" dot>{status}</Badge>
      <ChevronRight size={16} className="text-muted" />
    </button>
  );
}

function SettingToggle({ icon: Icon, label, checked, onChange }: { icon: typeof User; label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex items-center justify-between w-full p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors">
      <span className="flex items-center gap-2.5 text-sm font-medium text-plum">
        <Icon size={16} className="text-lavender-600" /> {label}
      </span>
      <span className={cn('w-10 h-6 rounded-full p-0.5 transition-colors', checked ? 'bg-lavender-400' : 'bg-lavender-200')}>
        <span className={cn('block w-5 h-5 rounded-full bg-white transition-transform', checked && 'translate-x-4')} />
      </span>
    </button>
  );
}
