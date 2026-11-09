import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  FileText, CheckCircle2, XCircle, Flag, Copy, Search,
  MapPin, Clock, User as UserIcon,
} from 'lucide-react';
import { categoryConfig, severityConfig, communityStatusConfig, formatTimeAgo, formatDateTime } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { CommunityReport, CommunityStatus } from '@/types';

const statusFilters: { id: CommunityStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'duplicate', label: 'Duplicate' },
];

export function AdminModeration() {
  const { reports, updateReportStatus, addNotification } = useApp();
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CommunityReport | null>(null);

  const filtered = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) && !r.location.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const handleAction = (id: string, status: CommunityStatus, note?: string) => {
    updateReportStatus(id, status, note);
    addNotification({
      type: 'community',
      title: `Report ${status}`,
      message: `Report ${reports.find((r) => r.id === id)?.refId} has been ${status}.`,
    });
    setSelected((prev) => prev ? { ...prev, status, moderationNote: note } : null);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Report Moderation</h2>
          <p className="text-sm text-muted mt-1">{pendingCount} pending review · {reports.length} total reports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statusFilters.slice(1).map((f) => {
          const count = reports.filter((r) => r.status === f.id).length;
          const tone = communityStatusConfig[f.id as CommunityStatus].tone;
          return (
            <Card key={f.id} className="p-3 text-center">
              <p className="text-xl font-extrabold text-plum">{count}</p>
              <Badge tone={tone} className="mt-1">{f.label}</Badge>
            </Card>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-10" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors',
              statusFilter === f.id ? 'bg-lavender-200 text-plum' : 'bg-white text-muted hover:bg-lavender-100/60 shadow-soft'
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">
              {f.id === 'all' ? reports.length : reports.filter((r) => r.status === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Report list */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((r) => {
            const cat = categoryConfig[r.category];
            const sev = severityConfig[r.severity];
            const status = communityStatusConfig[r.status];
            return (
              <Card key={r.id} hover onClick={() => setSelected(r)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                    <FileText size={20} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted">{r.refId}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="text-sm font-bold text-plum mt-1">{cat.label}</p>
                    <p className="text-xs text-muted line-clamp-2 mt-1">{r.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                      <MapPin size={11} /> <span className="truncate">{r.location.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>{sev.label}</span>
                      <span className="text-[10px] text-muted">{formatTimeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleAction(r.id, 'approved'); }}>
                      <CheckCircle2 size={14} /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); handleAction(r.id, 'rejected'); }}>
                      <XCircle size={14} /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="sm:col-span-2">
            <EmptyState icon={<FileText size={24} />} title="No reports found" message="No reports match the current filter." />
          </Card>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Report Review" className="sm:max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-muted">{selected.refId}</span>
              <Badge tone={communityStatusConfig[selected.status].tone}>{communityStatusConfig[selected.status].label}</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-lavender-50/50">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm font-bold text-plum">{categoryConfig[selected.category].label}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-plum">{selected.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-lavender-50/40">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-plum flex items-center gap-1.5"><MapPin size={14} className="text-lavender-500" /> {selected.location.label}</p>
              </div>
              <div className="p-3 rounded-2xl bg-lavender-50/40">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Severity</p>
                <span className={cn('text-xs font-bold px-2 py-1 rounded-full inline-block', severityConfig[selected.severity].bg, severityConfig[selected.severity].text)}>
                  {severityConfig[selected.severity].label}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-lavender-50/40">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Reported By</p>
                <p className="text-sm text-plum flex items-center gap-1.5"><UserIcon size={14} /> {selected.anonymous ? 'Anonymous' : selected.reportedBy}</p>
              </div>
              <div className="p-3 rounded-2xl bg-lavender-50/40">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-sm text-plum flex items-center gap-1.5"><Clock size={14} /> {formatDateTime(selected.createdAt)}</p>
              </div>
            </div>

            {selected.moderationNote && (
              <div className="p-3 rounded-2xl bg-lavender-100/40">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Moderation Note</p>
                <p className="text-sm text-plum">{selected.moderationNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button size="sm" variant="primary" onClick={() => handleAction(selected.id, 'approved')}>
                <CheckCircle2 size={15} /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(selected.id, 'rejected')}>
                <XCircle size={15} /> Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(selected.id, 'flagged', 'Flagged for suspicious content')}>
                <Flag size={15} /> Flag
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(selected.id, 'duplicate', 'Marked as duplicate of another report')}>
                <Copy size={15} /> Duplicate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
