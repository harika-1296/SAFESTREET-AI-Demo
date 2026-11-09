import { useState } from 'react';
import { MapPin, Filter, List } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { MapView } from '@/components/ui/MapView';
import { IncidentDetailModal } from '@/screens/responder/ResponderDashboard';
import { severityConfig, incidentStatusConfig, formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { EmergencyIncident, IncidentSeverity, MapMarker } from '@/types';

const allSeverities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

export function ResponderMap() {
  const { incidents } = useApp();
  const [selected, setSelected] = useState<EmergencyIncident | null>(null);
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [showList, setShowList] = useState(false);

  const filtered = incidents.filter((i) => {
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    return true;
  });

  const markers: MapMarker[] = filtered.map((i) => ({
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Response Map</h2>
          <p className="text-sm text-muted mt-1">{filtered.length} incidents plotted · Click markers for details</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-lavender-100/60 rounded-2xl">
          <button onClick={() => setShowList(false)} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold', !showList ? 'bg-white text-plum shadow-soft' : 'text-muted')}>
            <MapPin size={14} className="inline mr-1" /> Map
          </button>
          <button onClick={() => setShowList(true)} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold', showList ? 'bg-white text-plum shadow-soft' : 'text-muted')}>
            <List size={14} className="inline mr-1" /> List
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Filter size={14} /> Severity:
        </div>
        <button
          onClick={() => setSeverityFilter('all')}
          className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold', severityFilter === 'all' ? 'bg-lavender-200 text-plum' : 'bg-white text-muted hover:bg-lavender-100/60')}
        >
          All
        </button>
        {allSeverities.map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold capitalize', severityFilter === s ? severityConfig[s].bg + ' ' + severityConfig[s].text : 'bg-white text-muted hover:bg-lavender-100/60')}
          >
            {severityConfig[s].label}
          </button>
        ))}
      </div>

      {showList ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.length > 0 ? (
            filtered.map((inc) => {
              const sev = severityConfig[inc.severity];
              const status = incidentStatusConfig[inc.status];
              return (
                <Card key={inc.id} hover onClick={() => setSelected(inc)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-1.5 h-12 rounded-full shrink-0')} style={{ backgroundColor: sev.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-plum">{inc.refId}</span>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted mt-1 truncate">{inc.category}</p>
                      <p className="text-xs text-muted truncate flex items-center gap-1 mt-1"><MapPin size={11} /> {inc.location.label}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>{sev.label}</span>
                        <span className="text-[10px] text-muted">{formatTimeAgo(inc.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="sm:col-span-2">
              <EmptyState icon={<MapPin size={24} />} title="No incidents" message="No incidents match the current filter." />
            </Card>
          )}
        </div>
      ) : (
        <MapView
          markers={markers}
          height="600px"
          onMarkerClick={(m) => {
            const inc = incidents.find((i) => i.id === m.id);
            if (inc) setSelected(inc);
          }}
          showHeatmap
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {allSeverities.map((s) => {
          const sev = severityConfig[s];
          return (
            <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-soft">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sev.color }} />
              <span className="text-xs font-medium text-plum-muted">{sev.label}</span>
            </div>
          );
        })}
      </div>

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
