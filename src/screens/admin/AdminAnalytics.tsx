import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity,
  Download, Filter,
} from 'lucide-react';
import { Card, SectionTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', incidents: 45, resolved: 40, reports: 32 },
  { month: 'Feb', incidents: 52, resolved: 48, reports: 38 },
  { month: 'Mar', incidents: 61, resolved: 55, reports: 44 },
  { month: 'Apr', incidents: 48, resolved: 45, reports: 36 },
  { month: 'May', incidents: 67, resolved: 60, reports: 51 },
  { month: 'Jun', incidents: 73, resolved: 65, reports: 58 },
  { month: 'Jul', incidents: 69, resolved: 63, reports: 55 },
  { month: 'Aug', incidents: 78, resolved: 70, reports: 62 },
  { month: 'Sep', incidents: 82, resolved: 74, reports: 67 },
  { month: 'Oct', incidents: 75, resolved: 71, reports: 60 },
  { month: 'Nov', incidents: 88, resolved: 79, reports: 71 },
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

const resolutionTrend = [
  { week: 'W1', avgResponse: 8.5, resolution: 85 },
  { week: 'W2', avgResponse: 7.2, resolution: 88 },
  { week: 'W3', avgResponse: 6.8, resolution: 90 },
  { week: 'W4', avgResponse: 6.1, resolution: 92 },
];

const tooltipStyle = { background: '#292431', border: 'none', borderRadius: '12px', fontSize: '12px', color: 'white' as const };

export function AdminAnalytics() {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Incident Analytics</h2>
          <p className="text-sm text-muted mt-1">Comprehensive safety intelligence & trends</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Filter size={14} /> Filter</Button>
          <Button size="sm" variant="ghost"><Download size={14} /> Export</Button>
        </div>
      </div>

      {/* Monthly trends */}
      <Card>
        <SectionTitle title="Monthly Incident Trends" subtitle="Incidents, resolutions & reports over 11 months" icon={<TrendingUp size={18} />} />
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EDFB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="incidents" stroke="#D94C5C" strokeWidth={2.5} dot={{ r: 3, fill: '#D94C5C' }} name="Incidents" />
              <Line type="monotone" dataKey="resolved" stroke="#5BAE7E" strokeWidth={2.5} dot={{ r: 3, fill: '#5BAE7E' }} name="Resolved" />
              <Line type="monotone" dataKey="reports" stroke="#7658A6" strokeWidth={2.5} dot={{ r: 3, fill: '#7658A6' }} name="Reports" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          <Legend color="#D94C5C" label="Incidents" />
          <Legend color="#5BAE7E" label="Resolved" />
          <Legend color="#7658A6" label="Reports" />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <Card>
          <SectionTitle title="Incidents by Category" subtitle="Distribution across all types" icon={<PieIcon size={18} />} />
          <div className="mt-4 h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props: { name?: string; value?: number }) => `${props.name}: ${props.value}`} labelLine={false} style={{ fontSize: '10px', fill: '#403B46' }}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Severity distribution */}
        <Card>
          <SectionTitle title="Incidents by Severity" subtitle="Risk level distribution" icon={<BarChart3 size={18} />} />
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDFB" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F2EDFB' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Resolution trends */}
      <Card>
        <SectionTitle title="Response & Resolution Trends" subtitle="Average response time and resolution rate (weekly)" icon={<Activity size={18} />} />
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={resolutionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7658A6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7658A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EDFB" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A8490' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="resolution" stroke="#7658A6" strokeWidth={2.5} fill="url(#respGrad)" name="Resolution %" />
              <Line type="monotone" dataKey="avgResponse" stroke="#E5A44D" strokeWidth={2.5} dot={{ r: 3 }} name="Avg Response (min)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          <Legend color="#7658A6" label="Resolution Rate %" />
          <Legend color="#E5A44D" label="Avg Response Time (min)" />
        </div>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Total Incidents (YTD)" value="728" sub="+12% YoY" tone="emergency" />
        <StatBox label="Avg Response Time" value="6.1 min" sub="-1.4 min" tone="success" />
        <StatBox label="Resolution Rate" value="92%" sub="+4%" tone="success" />
        <StatBox label="Community Reports" value="584" sub="+18%" tone="lavender" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-medium text-plum-muted">{label}</span>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-extrabold text-plum">{value}</p>
      <p className="text-xs font-semibold text-muted mt-1">{label}</p>
      <Badge tone="success" className="mt-2">{sub}</Badge>
    </Card>
  );
}
