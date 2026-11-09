import { useState } from 'react';
import { Globe, MapPin, AlertTriangle, TrendingUp, Flame, Eye } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle } from '@/components/ui/Card';
import { MapView } from '@/components/ui/MapView';
import { categoryConfig, severityConfig } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { MapMarker, CommunityReport } from '@/types';

const highRiskAreas = [
  { area: 'MG Road Metro Area', incidents: 14, trend: 'up', severity: 'critical', lat: 12.9756, lng: 77.6069 },
  { area: 'Indiranagar 100ft Road', incidents: 9, trend: 'up', severity: 'high', lat: 12.9719, lng: 77.6412 },
  { area: 'Koramangala 5th Block', incidents: 7, trend: 'down', severity: 'high', lat: 12.9352, lng: 77.6245 },
  { area: 'Marathahalli Bridge', incidents: 5, trend: 'up', severity: 'medium', lat: 12.9591, lng: 77.6974 },
  { area: 'Lalbagh West Gate', incidents: 4, trend: 'down', severity: 'medium', lat: 12.9507, lng: 77.5849 },
];

export function AdminGeoIntelligence() {
  const { reports } = useApp();
  const [selected, setSelected] = useState<CommunityReport | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const approvedReports = reports.filter((r) => r.status === 'approved' || r.status === 'flagged');
  const markers: MapMarker[] = approvedReports.map((r) => ({
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Geographic Safety Intelligence</h2>
          <p className="text-sm text-muted mt-1">Incident clusters, high-risk areas & density mapping</p>
        </div>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
            showHeatmap ? 'bg-emergency-light text-emergency-dark' : 'bg-lavender-100/60 text-muted'
          )}
        >
          <Flame size={14} /> Heatmap {showHeatmap ? 'On' : 'Off'}
        </button>
      </div>

      {/* Map */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-lavender-700" />
            <span className="text-sm font-bold text-plum">Bengaluru City — Incident Density</span>
          </div>
          <Badge tone="lavender" dot>Simulated Data</Badge>
        </div>
        <MapView
          markers={markers}
          height="450px"
          onMarkerClick={(m) => {
            const r = reports.find((rep) => rep.id === m.id);
            if (r) setSelected(r);
          }}
          showHeatmap={showHeatmap}
        />
      </Card>

      {/* High risk areas */}
      <Card>
        <SectionTitle title="High-Risk Locations" subtitle="Areas with repeated incidents" icon={<AlertTriangle size={18} />} />
        <div className="mt-4 space-y-2">
          {highRiskAreas.map((area) => {
            const sev = severityConfig[area.severity as keyof typeof severityConfig];
            return (
              <div key={area.area} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40 hover:bg-lavender-50 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${sev.color}20` }}>
                  <MapPin size={18} style={{ color: sev.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-plum">{area.area}</p>
                  <p className="text-xs text-muted">{area.incidents} incidents reported</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-xs font-bold flex items-center gap-1', area.trend === 'up' ? 'text-emergency-dark' : 'text-success-dark')}>
                    <TrendingUp size={12} className={area.trend === 'down' ? 'rotate-180' : ''} />
                    {area.trend === 'up' ? 'Rising' : 'Falling'}
                  </span>
                  <Badge tone={area.severity === 'critical' ? 'emergency' : area.severity === 'high' ? 'warning' : 'neutral'}>
                    {sev.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category breakdown by area */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(categoryConfig).slice(0, 6).map(([key, cat]) => {
          const count = approvedReports.filter((r) => r.category === key).length;
          return (
            <Card key={key} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-semibold text-plum">{cat.label}</span>
                </div>
                <span className="text-lg font-extrabold text-plum">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-lavender-100 mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(count * 20, 100)}%`, backgroundColor: cat.color }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Infrastructure hazards */}
      <Card className="bg-lavender-soft border border-lavender-100">
        <SectionTitle title="Infrastructure Hazards" subtitle="Repeated civic issues requiring attention" icon={<Eye size={18} />} />
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {reports.filter((r) => r.category === 'pothole' || r.category === 'infrastructure' || r.category === 'poor_lighting').slice(0, 4).map((r) => (
            <div key={r.id} className="p-3 rounded-2xl bg-white flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${categoryConfig[r.category].color}20` }}>
                <AlertTriangle size={14} style={{ color: categoryConfig[r.category].color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-plum">{categoryConfig[r.category].label}</p>
                <p className="text-xs text-muted truncate">{r.location.label}</p>
              </div>
              <Badge tone="warning">{severityConfig[r.severity].label}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected report detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-plum/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-t-4xl sm:rounded-4xl shadow-elevated w-full sm:max-w-md p-6 animate-slide-up sm:animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-plum">{categoryConfig[selected.category].label}</h3>
            <p className="text-xs text-muted mt-1">{selected.refId}</p>
            <p className="text-sm text-plum mt-3">{selected.description}</p>
            <p className="text-xs text-muted mt-2 flex items-center gap-1"><MapPin size={12} /> {selected.location.label}</p>
            <button onClick={() => setSelected(null)} className="mt-4 w-full py-2.5 rounded-2xl bg-lavender-100 text-plum font-semibold text-sm hover:bg-lavender-200 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
