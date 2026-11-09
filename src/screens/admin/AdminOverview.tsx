import {
  Users, Navigation, Siren, FileText, CheckCircle2, Shield,
  TrendingUp, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle } from '@/components/ui/Card';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar,
} from 'recharts';
import { cn } from '@/utils/cn';

const weeklyData = [
  { day: 'Mon', incidents: 12, resolved: 10 },
  { day: 'Tue', incidents: 15, resolved: 13 },
  { day: 'Wed', incidents: 8, resolved: 7 },
  { day: 'Thu', incidents: 18, resolved: 14 },
  { day: 'Fri', incidents: 22, resolved: 18 },
  { day: 'Sat', incidents: 14, resolved: 12 },
  { day: 'Sun', incidents: 9, resolved: 8 },
];

const categoryData = [
  { name: 'Harassment', value: 28, color: '#D94C5C' },
  { name: 'Poor Lighting', value: 22, color: '#7658A6' },
  { name: 'Suspicious', value: 18, color: '#B9A5DE' },
  { name: 'Potholes', value: 15, color: '#E5A44D' },
  { name: 'Infrastructure', value: 10, color: '#A88EAD' },
  { name: 'Other', value: 7, color: '#D8C1A9' },
];

const severityData = [
  { name: 'Critical', value: 8, color: '#D94C5C' },
  { name: 'High', value: 19, color: '#E5A44D' },
  { name: 'Medium', value: 34, color: '#B9A5DE' },
  { name: 'Low', value: 39, color: '#5BAE7E' },
];

const statusData = [
  { name: 'Resolved', value: 72, fill: '#5BAE7E' },
  { name: 'Responding', value: 12, fill: '#B9A5DE' },
  { name: 'Assigned', value: 8, fill: '#7658A6' },
  { name: 'Acknowledged', value: 5, fill: '#E5A44D' },
  { name: 'New', value: 3, fill: '#D94C5C' },
];

export function AdminOverview({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { incidents, reports, journeys, adminUsers, responders } = useApp();

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;
  const activeJourneys = journeys.filter((j) => j.status === 'active').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const availableResponders = responders.filter((r) => r.status === 'available').length;

  const kpis = [
    { label: 'Registered Users', value: '12,847', change: '+8.2%', up: true, icon: Users, tone: 'lavender' as const },
    { label: 'Active Journeys', value: activeJourneys, change: '+3', up: true, icon: Navigation, tone: 'success' as const },
    { label: 'Active Emergencies', value: activeIncidents, change: '-2', up: false, icon: Siren, tone: 'emergency' as const },
    { label: 'Community Reports', value: reports.length, change: `+${pendingReports}`, up: true, icon: FileText, tone: 'warning' as const },
    { label: 'Resolved Incidents', value: resolvedIncidents, change: '+5', up: true, icon: CheckCircle2, tone: 'success' as const },
    { label: 'Responders Available', value: `${availableResponders}/${responders.length}`, change: '78%', up: true, icon: Shield, tone: 'lavender' as const },
  ];

  const toneMap = {
    lavender: 'bg-lavender-100 text-lavender-700',
    success: 'bg-success-light text-success-dark',
    emergency: 'bg-emergency-light text-emergency-dark',
    warning: 'bg-warning-light text-warning-dark',
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">Command Overview</h2>
        <p className="text-sm text-muted mt-1">Platform-wide safety intelligence · Real-time</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', toneMap[kpi.tone])}>
                  <Icon size={20} />
                </div>
                <span className={cn('flex items-center gap-0.5 text-xs font-bold', kpi.up ? 'text-success-dark' : 'text-emergency-dark')}>
                  {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-plum mt-3">{kpi.value}</p>
              <p className="text-xs font-semibold text-muted mt-0.5">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weekly trends */}
        <Card>
          <SectionTitle title="Weekly Incident Trends" subtitle="Incidents received vs resolved" icon={<TrendingUp size={18} />} />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D94C5C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D94C5C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5BAE7E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#5BAE7E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#292431', border: 'none', borderRadius: '12px', fontSize: '12px', color: 'white' }}
                  labelStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#D94C5C" strokeWidth={2} fill="url(#incGrad)" name="Incidents" />
                <Area type="monotone" dataKey="resolved" stroke="#5BAE7E" strokeWidth={2} fill="url(#resGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Incidents by category */}
        <Card>
          <SectionTitle title="Incidents by Category" subtitle="Distribution across types" icon={<Activity size={18} />} />
          <div className="mt-4 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#292431', border: 'none', borderRadius: '12px', fontSize: '12px', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-plum-muted">{c.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Severity distribution */}
        <Card>
          <SectionTitle title="By Severity" icon={<Siren size={18} />} />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8A8490' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#403B46' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  contentStyle={{ background: '#292431', border: 'none', borderRadius: '12px', fontSize: '12px', color: 'white' }}
                  cursor={{ fill: '#F2EDFB' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status distribution */}
        <Card>
          <SectionTitle title="Response Status" icon={<Shield size={18} />} />
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="100%" data={statusData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={6} />
                <Tooltip
                  contentStyle={{ background: '#292431', border: 'none', borderRadius: '12px', fontSize: '12px', color: 'white' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                <span className="text-plum-muted">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Resolution rate */}
        <Card className="flex flex-col">
          <SectionTitle title="Resolution Rate" subtitle="Last 30 days" icon={<CheckCircle2 size={18} />} />
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F2EDFB" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#5BAE7E" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * 0.12}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-plum">88%</span>
                <span className="text-[10px] text-muted">resolved</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs">
              <span className="text-success-dark font-semibold flex items-center gap-1"><ArrowUpRight size={12} /> +4.2%</span>
              <span className="text-muted">vs last month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3">
        <QuickLink icon={FileText} label="Moderate Reports" desc={`${pendingReports} pending`} onClick={() => onNavigate('moderation')} />
        <QuickLink icon={Users} label="Manage Users" desc={`${adminUsers.length} accounts`} onClick={() => onNavigate('users')} />
        <QuickLink icon={Activity} label="System Health" desc="All services" onClick={() => onNavigate('system')} />
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, desc, onClick }: { icon: typeof Users; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-3xl shadow-card hover:shadow-elevated p-4 text-left hover:-translate-y-0.5 transition-all flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-lavender-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-plum">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <ArrowUpRight size={18} className="text-muted" />
    </button>
  );
}
