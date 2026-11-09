import { useState, useEffect, useRef } from 'react';
import {
  Brain, Activity, Zap, AlertTriangle, CheckCircle2, XCircle,
  Mic, MoveRight, Shield, Siren, Clock, TrendingUp, Eye, Gauge,
  ArrowRight, Info, Sparkles,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, Badge, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { SOSFlow } from '@/screens/user/SOSFlow';

export function AIDetection() {
  const { aiDetection, triggerAIDetection, confirmAIEmergency, cancelAIDetection, activateEmergency } = useApp();
  const [countdown, setCountdown] = useState(15);
  const [sosOpen, setSosOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (aiDetection.status !== 'verifying') {
      setCountdown(15);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    setCountdown(15);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          activateEmergency('ai_detection');
          confirmAIEmergency();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [aiDetection.status, activateEmergency, confirmAIEmergency]);

  const handleConfirm = () => {
    confirmAIEmergency();
    activateEmergency('ai_detection');
    setSosOpen(true);
  };

  const handleCancel = () => {
    cancelAIDetection();
  };

  const flowSteps = [
    { label: 'Signal Detection', icon: Eye, active: true },
    { label: 'AI Risk Assessment', icon: Brain, active: true },
    { label: 'User Verification', icon: Shield, active: aiDetection.status === 'verifying' || aiDetection.status === 'confirmed' },
    { label: 'Emergency Escalation', icon: Siren, active: aiDetection.status === 'confirmed' || aiDetection.status === 'escalated' },
    { label: 'Contact Notification', icon: CheckCircle2, active: aiDetection.status === 'confirmed' || aiDetection.status === 'escalated' },
    { label: 'Responder Alert', icon: Activity, active: aiDetection.status === 'confirmed' || aiDetection.status === 'escalated' },
  ];

  const confidenceColor = aiDetection.confidence === 'high' ? '#D94C5C' : aiDetection.confidence === 'medium' ? '#E5A44D' : '#5BAE7E';

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-extrabold text-plum">AI Emergency Detection</h2>
        <p className="text-sm text-muted mt-1">Assistive detection of potential distress signals · Simulated</p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-warning-light border border-warning/20 flex items-start gap-3">
        <Info size={18} className="text-warning-dark shrink-0 mt-0.5" />
        <p className="text-xs text-warning-dark/90 leading-relaxed">
          AI detection is <strong>probabilistic</strong> and may produce false positives or miss emergencies.
          Manual SOS always works independently. This prototype uses simulated detection events —
          no actual microphone monitoring is performed.
        </p>
      </div>

      {/* Monitoring status */}
      <Card className="bg-lavender-soft border border-lavender-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-lavender-gradient flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white animate-pulse-soft" />
            </div>
            <div>
              <h3 className="text-base font-bold text-plum">AI Monitoring Active</h3>
              <p className="text-xs text-muted">Audio & motion pattern analysis · Simulated</p>
            </div>
          </div>
          <Badge tone="success" dot>Running</Badge>
        </div>
      </Card>

      {/* Detection flow */}
      <Card>
        <SectionTitle title="Detection Pipeline" subtitle="How AI-assisted emergency detection works" icon={<Zap size={18} />} />
        <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar pb-2">
          {flowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center shrink-0">
                <div className={cn(
                  'flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-colors min-w-[90px]',
                  step.active ? 'bg-lavender-100' : 'bg-lavender-50/40'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                    step.active ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-muted'
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className={cn('text-[10px] font-semibold text-center', step.active ? 'text-plum' : 'text-muted')}>{step.label}</span>
                </div>
                {i < flowSteps.length - 1 && <ArrowRight size={14} className="text-lavender-300 shrink-0" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detection panel */}
      {aiDetection.status === 'detecting' && (
        <Card className="text-center">
          <div className="py-6">
            <div className="w-16 h-16 rounded-3xl bg-lavender-100 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-lavender-500" />
            </div>
            <h3 className="text-lg font-bold text-plum">No Anomalies Detected</h3>
            <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
              AI monitoring is running in the background. Simulate a detection event to see the full flow.
            </p>
            <Button size="lg" className="mt-6" onClick={triggerAIDetection}>
              <Sparkles size={18} /> Simulate Detection Event
            </Button>
          </div>
        </Card>
      )}

      {(aiDetection.status === 'verifying' || aiDetection.status === 'confirmed' || aiDetection.status === 'escalated') && (
        <>
          {/* AI Analysis Panel */}
          <Card className={cn(
            'border-2',
            aiDetection.status === 'verifying' ? 'border-warning/30 bg-warning-light/20' : 'border-emergency/30 bg-emergency-light/20'
          )}>
            <div className="flex items-center gap-2 mb-4">
              {aiDetection.status === 'verifying' ? (
                <AlertTriangle size={20} className="text-warning-dark" />
              ) : (
                <Siren size={20} className="text-emergency-dark" />
              )}
              <h3 className="text-lg font-bold text-plum">
                {aiDetection.status === 'verifying' ? 'Potential Emergency Detected' : 'Emergency Confirmed'}
              </h3>
              <Badge tone={aiDetection.status === 'verifying' ? 'warning' : 'emergency'} dot className="ml-auto">
                {aiDetection.status === 'verifying' ? 'Verifying' : 'Escalated'}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Audio pattern */}
              <div className="p-3.5 rounded-2xl bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Mic size={16} className="text-lavender-600" />
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Audio Pattern</span>
                </div>
                <p className="text-sm font-semibold text-plum">{aiDetection.audioPattern}</p>
                <div className="flex items-end gap-0.5 mt-3 h-8">
                  {[40, 70, 30, 85, 55, 90, 45, 75, 60, 50].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-emergency/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Motion pattern */}
              <div className="p-3.5 rounded-2xl bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <MoveRight size={16} className="text-lavender-600" />
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Motion Pattern</span>
                </div>
                <p className="text-sm font-semibold text-plum">{aiDetection.motionPattern}</p>
                <svg viewBox="0 0 100 30" className="w-full h-8 mt-3">
                  <polyline
                    points="0,15 10,10 20,20 30,8 40,25 50,5 60,22 70,12 80,18 90,8 100,15"
                    fill="none" stroke="#D94C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Risk score */}
            <div className="mt-3 p-4 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge size={18} className="text-lavender-600" />
                  <span className="text-sm font-bold text-plum">AI Risk Assessment</span>
                </div>
                <span className="text-xs text-muted">Advisory only — not a confirmed emergency</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#F2EDFB" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="34" fill="none" stroke={confidenceColor} strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - aiDetection.riskScore / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-plum">{aiDetection.riskScore}</span>
                    <span className="text-[9px] text-muted">/100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted">Confidence</span>
                    <span className="text-sm font-bold capitalize" style={{ color: confidenceColor }}>{aiDetection.confidence}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted">Severity</span>
                    <span className="text-sm font-bold text-emergency-dark">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted">Status</span>
                    <span className="text-sm font-bold text-warning-dark">Unconfirmed</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-lavender-50 flex items-start gap-2">
                <Sparkles size={14} className="text-lavender-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-lavender-700 uppercase tracking-wider">Recommended Action</p>
                  <p className="text-sm text-plum mt-0.5">{aiDetection.recommendedAction}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Verification countdown */}
          {aiDetection.status === 'verifying' && (
            <Card className="border-2 border-warning/30 bg-warning-light/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock size={18} className="text-warning-dark" />
                  <span className="text-sm font-bold text-warning-dark uppercase tracking-wider">Verification Countdown</span>
                </div>
                <p className="text-3xl font-extrabold text-plum">{countdown}s</p>
                <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
                  Please confirm if this is a real emergency. If no response is given,
                  the system will escalate automatically.
                </p>
                <div className="flex gap-3 mt-6 max-w-sm mx-auto">
                  <Button variant="outline" fullWidth size="lg" onClick={handleCancel}>
                    <XCircle size={18} /> False Alarm
                  </Button>
                  <Button variant="emergency" fullWidth size="lg" onClick={handleConfirm}>
                    <CheckCircle2 size={18} /> Confirm Emergency
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {aiDetection.status === 'confirmed' && (
            <Card className="border-2 border-emergency/30 bg-emergency-light/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emergency-dark" />
                <div>
                  <h3 className="text-base font-bold text-plum">Emergency Confirmed & Escalated</h3>
                  <p className="text-xs text-muted mt-0.5">Trusted contacts and responders have been notified (simulated)</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {aiDetection.status === 'false_alarm' && (
        <Card className="border-2 border-success/30 bg-success-light/20 text-center">
          <div className="py-4">
            <div className="w-14 h-14 rounded-3xl bg-success-light flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} className="text-success-dark" />
            </div>
            <h3 className="text-lg font-bold text-plum">False Alarm Cancelled</h3>
            <p className="text-sm text-muted mt-2">No emergency was escalated. AI detection continues monitoring.</p>
            <Button size="md" className="mt-4" onClick={triggerAIDetection}>
              <Sparkles size={16} /> Simulate Another Detection
            </Button>
          </div>
        </Card>
      )}

      {/* Capabilities */}
      <Card>
        <SectionTitle title="AI Capabilities" subtitle="What the intelligence engine can detect" icon={<Brain size={18} />} />
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            { icon: Mic, title: 'Audio Distress Patterns', desc: 'Simulated detection of distress-like vocal signals' },
            { icon: MoveRight, title: 'Motion Anomalies', desc: 'Unusual movement patterns indicating potential danger' },
            { icon: Gauge, title: 'Risk Scoring', desc: 'Probabilistic scoring with confidence levels' },
            { icon: TrendingUp, title: 'Trend Analysis', desc: 'Community incident pattern identification' },
            { icon: Eye, title: 'Duplicate Detection', desc: 'Identifies repeated reports of the same incident' },
            { icon: Shield, title: 'Context-Aware Alerts', desc: 'Prioritises alerts based on location and history' },
          ].map((cap) => (
            <div key={cap.title} className="flex items-start gap-3 p-3.5 rounded-2xl bg-lavender-50/50">
              <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
                <cap.icon size={18} className="text-lavender-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-plum">{cap.title}</p>
                <p className="text-xs text-muted mt-0.5">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SOSFlow open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
