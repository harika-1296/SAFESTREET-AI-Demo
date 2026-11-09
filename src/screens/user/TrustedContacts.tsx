import { useState } from 'react';
import {
  Users, Plus, Phone, Mail, Trash2, Bell, BellOff, MapPin,
  CheckCircle2, Shield, Siren,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

export function TrustedContacts() {
  const { contacts, addContact, removeContact, updateContact, addNotification } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [demoNotify, setDemoNotify] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', notifyOnEmergency: true, notifyOnJourney: true });

  const handleAdd = () => {
    if (!form.name || !form.relationship || !form.phone) return;
    addContact({
      ...form,
      status: 'available',
      avatarColor: ['#B9A5DE', '#7658A6', '#A88EAD', '#9B7BC9'][Math.floor(Math.random() * 4)],
    });
    addNotification({ type: 'contact', title: 'Contact Added', message: `${form.name} has been added to your trusted contacts.` });
    setForm({ name: '', relationship: '', phone: '', email: '', notifyOnEmergency: true, notifyOnJourney: true });
    setAddOpen(false);
  };

  const handleDemoNotify = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setDemoNotify(contactId);
      addNotification({ type: 'contact', title: 'Emergency Notification Sent', message: `Simulated emergency notification sent to ${contact.name}.` });
      setTimeout(() => setDemoNotify(null), 3000);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Trusted Contacts</h2>
          <p className="text-sm text-muted mt-1">{contacts.length} contacts · Notified during emergencies</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add Contact
        </Button>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-100 flex items-start gap-3">
        <Shield size={18} className="text-lavender-700 shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          Trusted contacts receive simulated emergency notifications with your live location when you trigger SOS.
          They can also track your safe journeys. All notifications in this prototype are simulated.
        </p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title="No trusted contacts yet"
            message="Add people you trust to be notified during emergencies and share your journeys with."
            action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus size={16} /> Add your first contact</Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <Card key={c.id} hover>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: c.avatarColor }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-plum truncate">{c.name}</h3>
                    <Badge tone={c.status === 'available' ? 'success' : 'neutral'} dot>{c.status === 'available' ? 'Available' : 'Unavailable'}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{c.relationship}</p>
                </div>
                <button onClick={() => setRemoveId(c.id)} className="p-2 rounded-xl text-muted hover:text-emergency hover:bg-emergency-light transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-plum-muted">
                  <Phone size={14} className="text-muted" /> {c.phone}
                </div>
                {c.email && (
                  <div className="flex items-center gap-2 text-sm text-plum-muted">
                    <Mail size={14} className="text-muted" /> {c.email}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => updateContact(c.id, { notifyOnEmergency: !c.notifyOnEmergency })}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                    c.notifyOnEmergency ? 'bg-emergency-light text-emergency-dark' : 'bg-lavender-100/60 text-muted'
                  )}
                >
                  {c.notifyOnEmergency ? <Bell size={12} /> : <BellOff size={12} />}
                  Emergency
                </button>
                <button
                  onClick={() => updateContact(c.id, { notifyOnJourney: !c.notifyOnJourney })}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                    c.notifyOnJourney ? 'bg-lavender-100 text-lavender-700' : 'bg-lavender-100/60 text-muted'
                  )}
                >
                  {c.notifyOnJourney ? <Bell size={12} /> : <BellOff size={12} />}
                  Journey
                </button>
              </div>

              <button
                onClick={() => handleDemoNotify(c.id)}
                className={cn(
                  'w-full mt-3 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  demoNotify === c.id ? 'bg-success-light text-success-dark' : 'bg-lavender-50 text-lavender-700 hover:bg-lavender-100'
                )}
              >
                {demoNotify === c.id ? (
                  <><CheckCircle2 size={15} /> Notification Sent (Simulated)</>
                ) : (
                  <><Siren size={15} /> Send Test Emergency Notification</>
                )}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add contact modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Trusted Contact">
        <div className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Relationship</label>
            <input className="input-field" placeholder="e.g. Sister, Partner, Friend" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Phone Number</label>
            <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Email (Optional)</label>
            <input className="input-field" placeholder="name@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Notification Preferences</p>
            <ToggleRow label="Notify during emergencies" icon={Siren} checked={form.notifyOnEmergency} onChange={(v) => setForm({ ...form, notifyOnEmergency: v })} />
            <ToggleRow label="Notify during journeys" icon={MapPin} checked={form.notifyOnJourney} onChange={(v) => setForm({ ...form, notifyOnJourney: v })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleAdd} disabled={!form.name || !form.phone}>Add Contact</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={() => removeId && removeContact(removeId)}
        title="Remove Contact?"
        message="This contact will no longer receive emergency notifications or journey updates."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}

function ToggleRow({ label, icon: Icon, checked, onChange }: {
  label: string; icon: typeof Bell; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-3 rounded-2xl bg-lavender-50/50 hover:bg-lavender-50 transition-colors"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-plum">
        <Icon size={16} className="text-lavender-600" /> {label}
      </span>
      <span className={cn('w-10 h-6 rounded-full p-0.5 transition-colors', checked ? 'bg-lavender-400' : 'bg-lavender-200')}>
        <span className={cn('block w-5 h-5 rounded-full bg-white transition-transform', checked && 'translate-x-4')} />
      </span>
    </button>
  );
}
