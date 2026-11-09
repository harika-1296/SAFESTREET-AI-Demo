import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui/Card';
import { Users, Shield, Search, User as UserIcon, Siren, Star, Activity, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function AdminUsers() {
  const { adminUsers, responders } = useApp();
  const [tab, setTab] = useState<'users' | 'responders'>('users');
  const [search, setSearch] = useState('');

  const filteredUsers = adminUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredResponders = responders.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">User & Responder Management</h2>
        <p className="text-sm text-muted mt-1">Manage accounts, roles & activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat icon={Users} label="Total Users" value={adminUsers.filter((u) => u.role === 'user').length} tone="lavender" />
        <MiniStat icon={Siren} label="Responders" value={responders.length} tone="emergency" />
        <MiniStat icon={Shield} label="Admins" value={adminUsers.filter((u) => u.role === 'admin').length} tone="dark" />
        <MiniStat icon={Activity} label="Active Now" value={adminUsers.filter((u) => u.status === 'active').length} tone="success" />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-lavender-100/60 rounded-2xl w-fit">
          <button onClick={() => setTab('users')} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold', tab === 'users' ? 'bg-white text-plum shadow-soft' : 'text-muted')}>
            <Users size={15} /> Users
          </button>
          <button onClick={() => setTab('responders')} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold', tab === 'responders' ? 'bg-white text-plum shadow-soft' : 'text-muted')}>
            <Siren size={15} /> Responders
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-10 py-2.5" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* User list */}
      {tab === 'users' && (
        <Card>
          <SectionTitle title="User Accounts" subtitle={`${filteredUsers.length} accounts`} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-lavender-100">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Role</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Location</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 hidden lg:table-cell">Last Active</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-lavender-50/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold',
                          u.role === 'admin' ? 'bg-plum' : u.role === 'responder' ? 'bg-emergency' : 'bg-lavender-gradient'
                        )}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-plum truncate">{u.name}</p>
                          <p className="text-xs text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <Badge tone={u.role === 'admin' ? 'dark' : u.role === 'responder' ? 'emergency' : 'lavender'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell text-plum-muted text-xs">{u.location}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'neutral'} dot>{u.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell text-muted text-xs">{u.lastActive}</td>
                    <td className="py-3"><ChevronRight size={16} className="text-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <EmptyState icon={<UserIcon size={24} />} title="No users found" message="Try adjusting your search" />}
          </div>
        </Card>
      )}

      {/* Responder list */}
      {tab === 'responders' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredResponders.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emergency flex items-center justify-center shrink-0">
                  <Siren size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-plum">{r.name}</h3>
                  <p className="text-xs text-muted">{r.role} · {r.zone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone={r.status === 'available' ? 'success' : r.status === 'responding' ? 'lavender' : 'neutral'} dot>
                      {r.status === 'available' ? 'Available' : r.status === 'responding' ? 'Responding' : 'Offline'}
                    </Badge>
                    {r.assignedIncidents > 0 && <Badge tone="warning">{r.assignedIncidents} active</Badge>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-plum">
                    <Star size={12} className="text-warning fill-warning" />
                    {r.rating}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: 'lavender' | 'emergency' | 'dark' | 'success' }) {
  const tones = {
    lavender: 'bg-lavender-100 text-lavender-700',
    emergency: 'bg-emergency-light text-emergency-dark',
    dark: 'bg-plum text-white',
    success: 'bg-success-light text-success-dark',
  };
  return (
    <Card className="p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', tones[tone])}>
        <Icon size={18} />
      </div>
      <p className="text-xl font-extrabold text-plum">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
