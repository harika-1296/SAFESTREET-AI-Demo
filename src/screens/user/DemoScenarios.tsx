import { useState } from 'react';
import {
  Siren, Brain, FileText, Navigation, WifiOff, Play, CheckCircle2,
  Users, Shield, Sparkles,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SOSFlow } from '@/screens/user/SOSFlow';
import { ReportFormModal } from '@/screens/user/CommunityMap';
import { cn } from '@/utils/cn';

interface ScenarioStep {
  label: string;
  done: boolean;
}

export function DemoScenarios({ onNavigate }: { onNavigate: (view: string) => void }) {
  const {
    triggerAIDetection, setConnectivity,
    connectivity, startJourney, contacts,
  } = useApp();

  const [sosOpen, setSosOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, ScenarioStep[]>>({});

  const initSteps = (id: string, stepLabels: string[]): ScenarioStep[] => {
    return stepLabels.map((label) => ({ label, done: false }));
  };

  const scenarios = [
    {
      id: 'sos',
      title: 'Manual SOS Emergency',
      desc: 'Trigger SOS → Countdown → Emergency activated → Contacts notified → Responder accepts → Admin updates',
      icon: Siren,
      color: '#D94C5C',
      steps: ['Press SOS button', 'Countdown begins (5s)', 'Emergency activated', 'Trusted contacts notified', 'Incident sent to responders', 'Responder accepts incident'],
      action: () => {
        setSosOpen(true);
        setActiveScenario('sos');
        setSteps((s) => ({ ...s, sos: initSteps('sos', ['Press SOS button', 'Countdown begins (5s)', 'Emergency activated', 'Trusted contacts notified', 'Incident sent to responders', 'Responder accepts incident']) }));
      },
    },
    {
      id: 'ai',
      title: 'AI-Assisted Emergency Detection',
      desc: 'Simulated distress signal → AI risk assessment → User verification → Emergency escalation',
      icon: Brain,
      color: '#7658A6',
      steps: ['Simulate detection event', 'AI risk assessment displayed', 'Verification countdown', 'Confirm emergency', 'Emergency escalated'],
      action: () => {
        onNavigate('ai-detection');
        triggerAIDetection();
        setActiveScenario('ai');
      },
    },
    {
      id: 'report',
      title: 'Unsafe Street Reporting',
      desc: 'Submit report → Appears in community feed → Admin reviews → Admin approves → Visible on map',
      icon: FileText,
      color: '#E5A44D',
      steps: ['Submit a report', 'Report appears in feed', 'Admin reviews report', 'Admin approves report', 'Report visible on community map'],
      action: () => {
        setReportOpen(true);
        setActiveScenario('report');
      },
    },
    {
      id: 'journey',
      title: 'Safe Journey Monitoring',
      desc: 'Start journey → Track progress → Exceed ETA → Overdue alert → Contacts notified',
      icon: Navigation,
      color: '#5BAE7E',
      steps: ['Start a safe journey', 'Track journey progress', 'Simulate overdue scenario', 'Trusted contacts notified'],
      action: () => {
        onNavigate('journey');
        startJourney({
          origin: 'Current Location — MG Road',
          destination: 'Indiranagar 100ft Road',
          mode: 'auto_rickshaw',
          etaMinutes: 20,
          sharedWith: contacts.slice(0, 2).map((c) => c.id),
          contactNames: contacts.slice(0, 2).map((c) => c.name),
        });
        setActiveScenario('journey');
      },
    },
    {
      id: 'offline',
      title: 'Offline Reporting',
      desc: 'Go offline → Create report → Report stays pending → Go online → Report syncs',
      icon: WifiOff,
      color: '#A88EAD',
      steps: ['Switch to offline mode', 'Create a report (saved locally)', 'Report shows as pending', 'Switch back to online', 'Report synchronises'],
      action: () => {
        setConnectivity('offline');
        onNavigate('offline');
        setActiveScenario('offline');
      },
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">Demo Scenarios</h2>
        <p className="text-sm text-muted mt-1">Experience complete product workflows end-to-end</p>
      </div>

      {/* Intro banner */}
      <div className="p-4 rounded-2xl bg-lavender-gradient text-white flex items-start gap-3">
        <Sparkles size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold">For Hackathon Judges</p>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Each scenario launches a guided workflow that demonstrates how SafeStreet AI's three interfaces
            work together. Switch roles using the top-right menu to see how actions propagate across the platform.
          </p>
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-4">
        {scenarios.map((s, idx) => {
          const Icon = s.icon;
          const scenarioSteps = steps[s.id];
          const completedCount = scenarioSteps?.filter((st) => st.done).length || 0;
          const isRunning = activeScenario === s.id;

          return (
            <Card key={s.id} className={cn('transition-all', isRunning && 'ring-2 ring-lavender-300')}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}20` }}>
                  <Icon size={24} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-muted">Scenario {idx + 1}</span>
                    {isRunning && <Badge tone="lavender" dot>Running</Badge>}
                    {scenarioSteps && completedCount === scenarioSteps.length && <Badge tone="success" dot>Complete</Badge>}
                  </div>
                  <h3 className="text-base font-bold text-plum mt-1">{s.title}</h3>
                  <p className="text-xs text-muted mt-1">{s.desc}</p>

                  {/* Steps */}
                  {scenarioSteps && (
                    <div className="mt-3 space-y-1.5">
                      {scenarioSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={cn(
                            'w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            step.done ? 'bg-success text-white' : 'bg-lavender-100 text-muted'
                          )}>
                            {step.done ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                          </div>
                          <span className={cn(step.done ? 'text-plum line-through opacity-60' : 'text-plum-muted')}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={s.action} disabled={isRunning && s.id === 'sos'}>
                  <Play size={14} /> {isRunning ? 'In Progress' : 'Start Scenario'}
                </Button>
                {s.id === 'sos' && (
                  <Button size="sm" variant="outline" onClick={() => onNavigate('responder-switch')}>
                    <Shield size={14} /> View in Responder
                  </Button>
                )}
                {s.id === 'report' && (
                  <Button size="sm" variant="outline" onClick={() => onNavigate('admin-switch')}>
                    <Shield size={14} /> View in Admin
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick role switch */}
      <Card className="bg-plum text-white border-0">
        <h3 className="text-base font-bold">Explore All Three Interfaces</h3>
        <p className="text-sm text-white/70 mt-1">See how data flows between user, responder, and admin.</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button onClick={() => onNavigate('switch-user')} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-center">
            <Users size={20} className="mx-auto mb-1" />
            <span className="text-xs font-semibold">Citizen</span>
          </button>
          <button onClick={() => onNavigate('switch-responder')} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-center">
            <Siren size={20} className="mx-auto mb-1" />
            <span className="text-xs font-semibold">Responder</span>
          </button>
          <button onClick={() => onNavigate('switch-admin')} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-center">
            <Shield size={20} className="mx-auto mb-1" />
            <span className="text-xs font-semibold">Admin</span>
          </button>
        </div>
      </Card>

      <SOSFlow open={sosOpen} onClose={() => setSosOpen(false)} />
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
