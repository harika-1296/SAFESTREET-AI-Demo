import { useState } from 'react';
import { ReportFormModal } from '@/screens/user/CommunityMap';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, MapPin, Clock, CheckCircle2, Hourglass } from 'lucide-react';
import { categoryConfig, severityConfig, formatTimeAgo, communityStatusConfig } from '@/utils/helpers';
import type { CommunityCategory } from '@/types';

export function ReportIncident() {
  const { reports, addReport, connectivity, setConnectivity } = useApp();
  const [reportOpen, setReportOpen] = useState(false);

  const myReports = reports.filter((r) => r.reportedBy === 'Demo User' || r.reportedBy === 'Anonymous');
  const allReports = reports.slice(0, 8);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Report an Incident</h2>
          <p className="text-sm text-muted mt-1">Help make your community safer</p>
        </div>
        <Button size="sm" onClick={() => setReportOpen(true)}>
          <Plus size={16} /> New Report
        </Button>
      </div>

      {/* Quick categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['poor_lighting', 'pothole', 'harassment', 'suspicious_activity'] as CommunityCategory[]).map((c) => {
          const cat = categoryConfig[c];
          return (
            <button
              key={c}
              onClick={() => setReportOpen(true)}
              className="bg-white rounded-3xl shadow-card hover:shadow-elevated p-4 text-center hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110" style={{ backgroundColor: `${cat.color}20` }}>
                <FileText size={18} style={{ color: cat.color }} />
              </div>
              <p className="text-xs font-bold text-plum">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* My reports */}
      <Card>
        <SectionTitle title="My Reports" subtitle="Reports you've submitted" icon={<FileText size={18} />} />
        <div className="mt-4 space-y-3">
          {myReports.length > 0 ? (
            myReports.map((r) => {
              const cat = categoryConfig[r.category];
              const status = communityStatusConfig[r.status];
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                    <FileText size={16} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-plum">{cat.label}</p>
                    <p className="text-xs text-muted truncate">{r.location.label}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <span className="text-[10px] text-muted">{formatTimeAgo(r.createdAt)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={<FileText size={24} />}
              title="No reports yet"
              message="Submit your first community safety report to help others stay informed."
              action={<Button size="sm" onClick={() => setReportOpen(true)}><Plus size={16} /> Report Now</Button>}
            />
          )}
        </div>
      </Card>

      {/* Recent community reports */}
      <Card>
        <SectionTitle title="Recent Community Reports" subtitle="Latest incidents reported by the community" icon={<Clock size={18} />} />
        <div className="mt-4 space-y-3">
          {allReports.map((r) => {
            const cat = categoryConfig[r.category];
            const sev = severityConfig[r.severity];
            const status = communityStatusConfig[r.status];
            return (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/40">
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: sev.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-plum">{cat.label}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{r.description}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted mt-1">
                    <MapPin size={10} /> {r.location.label} · {formatTimeAgo(r.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Status guide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Hourglass, label: 'Pending', desc: 'Awaiting review', tone: 'warning' as const },
          { icon: CheckCircle2, label: 'Approved', desc: 'Visible on map', tone: 'success' as const },
          { icon: FileText, label: 'Rejected', desc: 'Not published', tone: 'neutral' as const },
          { icon: FileText, label: 'Flagged', desc: 'Needs attention', tone: 'emergency' as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-3 text-center">
            <s.icon size={20} className="mx-auto mb-1.5 text-lavender-500" />
            <p className="text-xs font-bold text-plum">{s.label}</p>
            <p className="text-[10px] text-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      <ReportFormModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(data) => addReport(data)}
        connectivity={connectivity}
        onGoOnline={() => setConnectivity('online')}
      />
    </div>
  );
}
