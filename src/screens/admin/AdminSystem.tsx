import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle } from '@/components/ui/Card';
import { Activity, Server, Brain, Bell, MapPin, Cpu, Zap, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemService } from '@/types';

const serviceIcons: Record<string, typeof Server> = {
  'AI Detection Service': Brain,
  'Notification Service': Bell,
  'Location Service': MapPin,
  'Community Feed API': Server,
  'Responder Dispatch': Zap,
  'Map Tile Server': MapPin,
};

const recentEvents = [
  { time: '2 min ago', event: 'AI Detection Service processed 1,247 signals', type: 'info' },
  { time: '5 min ago', event: 'New incident SOS-2026-0042 created', type: 'warning' },
  { time: '12 min ago', event: 'Responder Arjun K. assigned to incident', type: 'info' },
  { time: '18 min ago', event: 'Community report RPT-2026-0156 approved', type: 'success' },
  { time: '25 min ago', event: 'Responder Dispatch latency degraded (890ms)', type: 'warning' },
  { time: '35 min ago', event: 'Location Service health check passed', type: 'success' },
  { time: '1 hr ago', event: 'Weekly analytics report generated', type: 'info' },
  { time: '2 hr ago', event: 'New user registration spike (+47 users)', type: 'info' },
];

export function AdminSystem() {
  const { services } = useApp();

  const operational = services.filter((s) => s.status === 'operational').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const offline = services.filter((s) => s.status === 'offline').length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">System Monitoring</h2>
        <p className="text-sm text-muted mt-1">Platform health & service status · Simulated</p>
      </div>

      {/* Overall status */}
      <Card className="bg-lavender-soft border border-lavender-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-success-light flex items-center justify-center">
              <CheckCircle2 size={28} className="text-success-dark" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-plum">All Core Systems Operational</h3>
              <p className="text-sm text-muted">{operational} operational · {degraded} degraded · {offline} offline</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge tone="success" dot>99.8% uptime</Badge>
            <Badge tone="warning">Simulated</Badge>
          </div>
        </div>
      </Card>

      {/* Service cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>

      {/* Platform activity */}
      <Card>
        <SectionTitle title="Platform Activity" subtitle="Real-time system events" icon={<Activity size={18} />} />
        <div className="mt-4 space-y-2">
          {recentEvents.map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                event.type === 'success' ? 'bg-success-light' : event.type === 'warning' ? 'bg-warning-light' : 'bg-lavender-100'
              )}>
                {event.type === 'success' && <CheckCircle2 size={15} className="text-success-dark" />}
                {event.type === 'warning' && <AlertTriangle size={15} className="text-warning-dark" />}
                {event.type === 'info' && <Activity size={15} className="text-lavender-700" />}
              </div>
              <p className="text-sm text-plum flex-1">{event.event}</p>
              <span className="text-xs text-muted shrink-0">{event.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Infrastructure diagram */}
      <Card className="bg-plum text-white border-0">
        <SectionTitle title="Infrastructure Architecture" subtitle="How SafeStreet AI services connect" icon={<Cpu size={18} />} />
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Client Layer', items: ['Mobile App', 'Responder Console', 'Admin Dashboard'], icon: Activity },
            { label: 'Service Layer', items: ['AI Engine', 'Notification Hub', 'Location Service'], icon: Server },
            { label: 'Data Layer', items: ['Incident Store', 'User Database', 'Analytics Warehouse'], icon: Cpu },
          ].map((layer) => (
            <div key={layer.label} className="p-4 rounded-2xl bg-white/10">
              <div className="flex items-center gap-2 mb-3">
                <layer.icon size={18} className="text-lavender-300" />
                <span className="text-sm font-bold">{layer.label}</span>
              </div>
              <div className="space-y-1.5">
                {layer.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-2xl bg-white/5 flex items-start gap-2">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-white/60 leading-relaxed">
            All services in this prototype are simulated. No real backend infrastructure is running.
            In production, these services would run on scalable cloud infrastructure with real monitoring,
            alerting, and redundancy.
          </p>
        </div>
      </Card>
    </div>
  );
}

function ServiceCard({ service }: { service: SystemService }) {
  const Icon = serviceIcons[service.name] || Server;
  const statusConfig = {
    operational: { tone: 'success' as const, icon: CheckCircle2, label: 'Operational', color: 'text-success-dark', bg: 'bg-success-light' },
    degraded: { tone: 'warning' as const, icon: AlertTriangle, label: 'Degraded', color: 'text-warning-dark', bg: 'bg-warning-light' },
    offline: { tone: 'emergency' as const, icon: XCircle, label: 'Offline', color: 'text-emergency-dark', bg: 'bg-emergency-light' },
  };
  const cfg = statusConfig[service.status];
  const StatusIcon = cfg.icon;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', cfg.bg)}>
            <Icon size={20} className={cfg.color} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum">{service.name}</h3>
            <p className="text-xs text-muted">{service.description}</p>
          </div>
        </div>
        {service.simulated && <Badge tone="neutral">Simulated</Badge>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon size={14} className={cfg.color} />
          <span className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <p className="text-muted">Latency</p>
            <p className="font-bold text-plum">{service.latency}</p>
          </div>
          <div className="text-right">
            <p className="text-muted">Uptime</p>
            <p className="font-bold text-plum">{service.uptime}</p>
          </div>
        </div>
      </div>
      {/* Latency bar */}
      <div className="mt-3 h-1.5 rounded-full bg-lavender-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', service.status === 'operational' ? 'bg-success' : service.status === 'degraded' ? 'bg-warning' : 'bg-emergency')}
          style={{ width: service.status === 'operational' ? '95%' : service.status === 'degraded' ? '60%' : '20%' }}
        />
      </div>
    </Card>
  );
}
