import { useState, useMemo } from 'react';
import {
  MapPin, Search, Filter, Plus, List, Map as MapIcon, Construction,
  Lightbulb, AlertOctagon, Eye, Car, Wrench, X,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/ui/MapView';
import { Modal } from '@/components/ui/Modal';
import { categoryConfig, severityConfig, formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { CommunityCategory, IncidentSeverity, MapMarker, CommunityReport } from '@/types';

const categoryIcons: Record<CommunityCategory, typeof MapPin> = {
  pothole: Construction,
  poor_lighting: Lightbulb,
  harassment: AlertOctagon,
  unsafe_area: MapPin,
  accident: Car,
  suspicious_activity: Eye,
  infrastructure: Wrench,
};

const allCategories = Object.keys(categoryConfig) as CommunityCategory[];
const allSeverities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

interface CommunityMapProps {
  onNavigate?: (view: string) => void;
}

export function CommunityMap({ onNavigate }: CommunityMapProps) {
  const { reports, addReport, connectivity, setConnectivity } = useApp();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [selected, setSelected] = useState<CommunityReport | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const approvedReports = reports.filter((r) => r.status === 'approved' || r.status === 'flagged');

  const filtered = useMemo(() => {
    return approvedReports.filter((r) => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      if (search && !r.location.label.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [approvedReports, categoryFilter, severityFilter, search]);

  const markers: MapMarker[] = filtered.map((r) => ({
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
          <h2 className="text-2xl font-extrabold text-plum">Community Safety Map</h2>
          <p className="text-sm text-muted mt-1">{approvedReports.length} reported incidents near you</p>
        </div>
        <Button size="sm" onClick={() => setReportOpen(true)}>
          <Plus size={16} /> Report
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input-field pl-11"
          placeholder="Search location or incident type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Filter size={14} /> Filters:
        </div>
        <select
          className="text-xs font-semibold bg-white border border-lavender-100 rounded-xl px-3 py-2 text-plum focus:outline-none focus:ring-2 focus:ring-lavender-300"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CommunityCategory | 'all')}
        >
          <option value="all">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{categoryConfig[c].label}</option>
          ))}
        </select>
        <select
          className="text-xs font-semibold bg-white border border-lavender-100 rounded-xl px-3 py-2 text-plum focus:outline-none focus:ring-2 focus:ring-lavender-300"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | 'all')}
        >
          <option value="all">All Severities</option>
          {allSeverities.map((s) => (
            <option key={s} value={s}>{severityConfig[s].label}</option>
          ))}
        </select>
        {(categoryFilter !== 'all' || severityFilter !== 'all' || search) && (
          <button
            onClick={() => { setCategoryFilter('all'); setSeverityFilter('all'); setSearch(''); }}
            className="text-xs font-semibold text-emergency hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 bg-lavender-100/60 rounded-2xl w-fit">
        <button
          onClick={() => setView('map')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all', view === 'map' ? 'bg-white text-plum shadow-soft' : 'text-muted')}
        >
          <MapIcon size={15} /> Map
        </button>
        <button
          onClick={() => setView('list')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all', view === 'list' ? 'bg-white text-plum shadow-soft' : 'text-muted')}
        >
          <List size={15} /> List
        </button>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <div className="space-y-3">
          <MapView
            markers={markers}
            height="500px"
            onMarkerClick={(m) => {
              const r = reports.find((rep) => rep.id === m.id);
              if (r) setSelected(r);
            }}
            showHeatmap
          />
          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => {
              const cat = categoryConfig[c];
              const Icon = categoryIcons[c];
              return (
                <div key={c} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white shadow-soft">
                  <Icon size={13} style={{ color: cat.color }} />
                  <span className="text-xs font-medium text-plum-muted">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((r) => {
              const cat = categoryConfig[r.category];
              const sev = severityConfig[r.severity];
              const Icon = categoryIcons[r.category];
              return (
                <Card key={r.id} hover onClick={() => setSelected(r)}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-plum">{cat.label}</h3>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>{sev.label}</span>
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted mt-2">
                        <MapPin size={11} /> {r.location.label}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted">{formatTimeAgo(r.createdAt)}</span>
                        {r.anonymous && <span className="text-[10px] font-semibold text-muted">Anonymous</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="sm:col-span-2">
              <EmptyState icon={<MapPin size={24} />} title="No incidents found" message="Try adjusting your filters or be the first to report an incident in this area." />
            </Card>
          )}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Incident Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${categoryConfig[selected.category].color}20` }}>
                {(() => {
                  const Icon = categoryIcons[selected.category];
                  return <Icon size={22} style={{ color: categoryConfig[selected.category].color }} />;
                })()}
              </div>
              <div>
                <h3 className="text-base font-bold text-plum">{categoryConfig[selected.category].label}</h3>
                <p className="text-xs text-muted">{selected.refId}</p>
              </div>
              <Badge tone={severityConfig[selected.severity].label === 'Critical' ? 'emergency' : severityConfig[selected.severity].label === 'High' ? 'warning' : 'neutral'} className="ml-auto">
                {severityConfig[selected.severity].label}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-plum">{selected.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-plum flex items-center gap-1.5"><MapPin size={14} className="text-lavender-500" /> {selected.location.label}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-lavender-100">
              <span>Reported by {selected.anonymous ? 'Anonymous' : selected.reportedBy}</span>
              <span>{formatTimeAgo(selected.createdAt)}</span>
            </div>
            {onNavigate && (
              <Button variant="outline" fullWidth onClick={() => { setSelected(null); onNavigate('report'); }}>
                <Plus size={16} /> Report Similar Incident
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Report modal — uses ReportForm inline */}
      <ReportFormModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(data) => { addReport(data); setReportOpen(false); }}
        connectivity={connectivity}
        onGoOnline={() => setConnectivity('online')}
      />
    </div>
  );
}

export function ReportFormModal({ open, onClose, onSubmit, connectivity }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CommunityReport, 'id' | 'refId' | 'createdAt' | 'status'>) => void;
  connectivity: string;
}) {
  const [form, setForm] = useState({
    category: 'poor_lighting' as CommunityCategory,
    description: '',
    location: '',
    severity: 'medium' as IncidentSeverity,
    anonymous: false,
  });
  const [submitted, setSubmitted] = useState<{ refId: string } | null>(null);

  const handleSubmit = () => {
    if (!form.description || !form.location) return;
    onSubmit({
      category: form.category,
      description: form.description,
      location: { label: form.location, lat: 12.97 + Math.random() * 0.02, lng: 77.6 + Math.random() * 0.02 },
      severity: form.severity,
      reportedBy: form.anonymous ? 'Anonymous' : 'Demo User',
      anonymous: form.anonymous,
    });
    const refId = `RPT-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    setSubmitted({ refId });
  };

  const handleClose = () => {
    setForm({ category: 'poor_lighting', description: '', location: '', severity: 'medium', anonymous: false });
    setSubmitted(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={submitted ? undefined : 'Report an Incident'}>
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-3xl bg-success-light flex items-center justify-center mx-auto mb-4">
            <Plus size={28} className="text-success-dark rotate-45" />
          </div>
          <h3 className="text-lg font-bold text-plum">Report Submitted</h3>
          <p className="text-sm text-muted mt-2">Your incident reference ID:</p>
          <p className="text-xl font-extrabold text-lavender-700 mt-1">{submitted.refId}</p>
          <p className="text-xs text-muted mt-3 max-w-xs mx-auto">
            {connectivity === 'offline'
              ? 'Your report has been saved locally and will sync when connection is restored.'
              : 'Your report is pending review by administrators. You\'ll be notified when it\'s approved.'}
          </p>
          <Button fullWidth className="mt-6" onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label-text">Incident Category</label>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((c) => {
                const cat = categoryConfig[c];
                const Icon = categoryIcons[c];
                return (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, category: c })}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-2xl text-xs font-semibold transition-colors text-left',
                      form.category === c ? 'bg-lavender-200 text-plum' : 'bg-lavender-50/50 text-muted hover:bg-lavender-100/60'
                    )}
                  >
                    <Icon size={16} style={{ color: cat.color }} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Describe what happened..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Location</label>
            <input className="input-field" placeholder="e.g. MG Road, near Metro Station" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Severity</label>
            <div className="flex gap-2">
              {allSeverities.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, severity: s })}
                  className={cn(
                    'flex-1 py-2.5 rounded-2xl text-xs font-bold transition-colors capitalize',
                    form.severity === s ? severityConfig[s].bg + ' ' + severityConfig[s].text : 'bg-lavender-50/50 text-muted hover:bg-lavender-100/60'
                  )}
                >
                  {severityConfig[s].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">Photo (Optional)</label>
            <div className="border-2 border-dashed border-lavender-200 rounded-2xl p-6 text-center">
              <Plus size={24} className="text-lavender-300 mx-auto mb-2 rotate-45" />
              <p className="text-xs text-muted">Tap to upload a photo (simulated)</p>
            </div>
          </div>
          <button
            onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
            className={cn(
              'flex items-center justify-between w-full p-3 rounded-2xl transition-colors',
              form.anonymous ? 'bg-lavender-100' : 'bg-lavender-50/50 hover:bg-lavender-50'
            )}
          >
            <span className="text-sm font-medium text-plum">Report Anonymously</span>
            <span className={cn('w-10 h-6 rounded-full p-0.5 transition-colors', form.anonymous ? 'bg-lavender-400' : 'bg-lavender-200')}>
              <span className={cn('block w-5 h-5 rounded-full bg-white transition-transform', form.anonymous && 'translate-x-4')} />
            </span>
          </button>
          {connectivity === 'offline' && (
            <div className="p-3 rounded-2xl bg-warning-light flex items-center gap-2">
              <X size={16} className="text-warning-dark" />
              <p className="text-xs text-warning-dark font-medium">You're offline. Report will be saved and synced when reconnected.</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={handleClose}>Cancel</Button>
            <Button fullWidth onClick={handleSubmit} disabled={!form.description || !form.location}>Submit Report</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
