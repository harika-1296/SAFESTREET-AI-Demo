import { useState } from 'react';
import {
  Wifi, WifiOff, AlertTriangle, CloudOff, RefreshCw, CheckCircle2,
  Clock, FileText, Radio, Server, Smartphone, Info, Zap, ArrowRight,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReportFormModal } from '@/screens/user/CommunityMap';
import { cn } from '@/utils/cn';
import type { Connectivity } from '@/types';

const connConfig: Record<Connectivity, { label: string; icon: typeof Wifi; tone: string; bg: string }> = {
  online: { label: 'Online', icon: Wifi, tone: 'text-success-dark', bg: 'bg-success-light' },
  weak: { label: 'Weak Connection', icon: AlertTriangle, tone: 'text-warning-dark', bg: 'bg-warning-light' },
  offline: { label: 'Offline', icon: WifiOff, tone: 'text-emergency-dark', bg: 'bg-emergency-light' },
};

export function OfflineConcept() {
  const { connectivity, setConnectivity, reports } = useApp();
  const [reportOpen, setReportOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const conn = connConfig[connectivity];
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setConnectivity('online');
      setTimeout(() => setSynced(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">Offline & Low-Connectivity</h2>
        <p className="text-sm text-muted mt-1">SafeStreet AI works even with poor or no internet</p>
      </div>

      {/* Connectivity status */}
      <Card className={cn('border-2', connectivity === 'offline' ? 'border-emergency/30' : connectivity === 'weak' ? 'border-warning/30' : 'border-success/30')}>
        <div className="flex items-center gap-4">
          <div className={cn('w-14 h-14 rounded-3xl flex items-center justify-center', conn.bg)}>
            <conn.icon size={26} className={conn.tone} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-plum">{conn.label}</h3>
            <p className="text-sm text-muted mt-0.5">
              {connectivity === 'online' && 'All features are fully operational.'}
              {connectivity === 'weak' && 'Core features work. Some data may sync slower.'}
              {connectivity === 'offline' && 'Reports are saved locally. SOS still works offline.'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {(['online', 'weak', 'offline'] as Connectivity[]).map((c) => {
            const cfg = connConfig[c];
            const Icon = cfg.icon;
            return (
              <button
                key={c}
                onClick={() => { setConnectivity(c); setSynced(false); }}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-semibold transition-all',
                  connectivity === c ? cfg.bg + ' ' + cfg.tone : 'bg-lavender-50/50 text-muted hover:bg-lavender-100/60'
                )}
              >
                <Icon size={16} />
                {cfg.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Offline report demo */}
      <Card>
        <SectionTitle
          title="Offline Incident Reporting"
          subtitle="Create reports without internet — they sync when you reconnect"
          icon={<CloudOff size={18} />}
        />
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/50">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0 text-xs font-bold text-lavender-700">1</div>
            <p className="text-sm text-plum-muted">Switch to offline mode using the buttons above</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/50">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0 text-xs font-bold text-lavender-700">2</div>
            <p className="text-sm text-plum-muted">Create a report — it will be saved locally as pending</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-lavender-50/50">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0 text-xs font-bold text-lavender-700">3</div>
            <p className="text-sm text-plum-muted">Switch back to online and sync to upload the report</p>
          </div>
        </div>
        <Button
          fullWidth
          className="mt-4"
          variant={connectivity === 'offline' ? 'warning' : 'primary'}
          onClick={() => setReportOpen(true)}
        >
          <FileText size={16} /> Create {connectivity === 'offline' ? 'Offline' : ''} Report
        </Button>
      </Card>

      {/* Pending sync */}
      <Card>
        <SectionTitle
          title="Pending Synchronisation"
          subtitle={`${pendingReports.length} report(s) waiting to sync`}
          icon={<Clock size={18} />}
          action={
            connectivity !== 'online' ? (
              <Button size="sm" onClick={handleSync} disabled={syncing}>
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Retry Sync'}
              </Button>
            ) : synced ? (
              <Badge tone="success" dot>Synced</Badge>
            ) : (
              <Badge tone="success" dot>Online</Badge>
            )
          }
        />
        <div className="mt-4 space-y-3">
          {pendingReports.length > 0 ? (
            pendingReports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50/40">
                <div className="w-9 h-9 rounded-xl bg-warning-light flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-warning-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-plum">{r.refId}</p>
                  <p className="text-xs text-muted truncate">{r.location.label}</p>
                </div>
                {synced ? (
                  <Badge tone="success" dot>Synced</Badge>
                ) : connectivity === 'offline' ? (
                  <Badge tone="warning" dot>Pending</Badge>
                ) : (
                  <Badge tone="lavender" dot>Queued</Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={28} className="text-success-dark mx-auto mb-2" />
              <p className="text-sm font-semibold text-plum">All reports synced</p>
              <p className="text-xs text-muted mt-1">No pending items in the queue</p>
            </div>
          )}
        </div>
      </Card>

      {/* Local emergency info */}
      <Card>
        <SectionTitle title="Local Emergency Information" subtitle="Available offline on your device" icon={<Smartphone size={18} />} />
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Police Helpline', number: '100', icon: 'shield' },
            { label: 'Women Helpline', number: '1091', icon: 'heart' },
            { label: 'Ambulance', number: '108', icon: 'heart' },
            { label: 'Emergency (Universal)', number: '112', icon: 'phone' },
          ].map((info) => (
            <div key={info.label} className="flex items-center gap-3 p-3 rounded-2xl bg-emergency-light/30">
              <div className="w-10 h-10 rounded-xl bg-emergency flex items-center justify-center shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">{info.label}</p>
                <p className="text-lg font-extrabold text-plum">{info.number}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">These numbers are stored locally and available even without internet.</p>
      </Card>

      {/* LoRaWAN concept */}
      <Card className="bg-lavender-soft border border-lavender-100">
        <SectionTitle title="Future-Ready Infrastructure" subtitle="Conceptual low-bandwidth communication" icon={<Radio size={18} />} />
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={18} className="text-lavender-600" />
              <span className="text-sm font-bold text-plum">LoRaWAN Gateway Compatibility</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              SafeStreet AI's architecture is designed to be compatible with LoRaWAN gateways and other
              low-power wide-area network infrastructure. This could support selected low-bandwidth sensor
              deployments in areas with poor cellular coverage.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-warning-light/30 flex items-start gap-3">
            <Info size={16} className="text-warning-dark shrink-0 mt-0.5" />
            <p className="text-xs text-warning-dark/90 leading-relaxed">
              <strong>Important:</strong> An ordinary smartphone cannot communicate directly over LoRaWAN
              without compatible hardware or infrastructure. This panel describes a future-ready architecture
              concept, not a current smartphone capability.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            {[
              { icon: Radio, label: 'LoRaWAN Gateways', desc: 'Low-bandwidth sensor relays' },
              { icon: Server, label: 'Edge Nodes', desc: 'Local processing & caching' },
              { icon: Smartphone, label: 'Mobile App', desc: 'Standard cellular + WiFi' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-2xl bg-white text-center">
                <item.icon size={20} className="text-lavender-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-plum">{item.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted pt-2">
            <span>How data flows</span>
            <Smartphone size={14} className="text-lavender-500" />
            <ArrowRight size={12} />
            <Radio size={14} className="text-lavender-500" />
            <ArrowRight size={12} />
            <Server size={14} className="text-lavender-500" />
            <ArrowRight size={12} />
            <CloudOff size={14} className="text-lavender-500" />
            <span>SafeStreet Cloud</span>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-100 flex items-start gap-3">
        <Info size={18} className="text-lavender-700 shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          This is a <strong>simulated</strong> offline experience for demonstration purposes.
          The app stores data in your browser's local storage. In a real deployment,
          data would sync to SafeStreet AI servers when connectivity is restored.
          SOS emergency triggers are always available regardless of connectivity.
        </p>
      </div>

      <ReportFormModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => setReportOpen(false)}
        connectivity={connectivity}
        onGoOnline={() => setConnectivity('online')}
      />
    </div>
  );
}
