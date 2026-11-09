import { useState, useEffect } from 'react';
import {
  Shield, ShieldCheck, Siren, Users, MapPin, Brain, ArrowRight,
  Eye, AlertTriangle, Sparkles, User as UserIcon, ChevronLeft,
  Zap, Activity,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { Role } from '@/types';

const onboardingSlides = [
  {
    icon: Eye,
    title: 'Stay Aware',
    description: 'Real-time community safety intelligence keeps you informed about risks around you — before you encounter them.',
    accent: '#B9A5DE',
  },
  {
    icon: Siren,
    title: 'Get Help When It Matters',
    description: 'One-tap SOS, AI-assisted emergency detection, and live location sharing connect you to help in seconds.',
    accent: '#7658A6',
  },
  {
    icon: Users,
    title: 'Keep Your Community Safer',
    description: 'Report hazards, share incidents, and build a trusted safety network that protects everyone around you.',
    accent: '#D94C5C',
  },
];

const roles = [
  {
    id: 'user' as Role,
    title: 'Citizen',
    subtitle: 'Personal Safety App',
    description: 'SOS, safe journeys, trusted contacts, community reporting',
    icon: UserIcon,
    gradient: 'from-lavender-400 to-lavender-700',
    features: ['One-tap SOS', 'Safe Journey', 'Trusted Contacts', 'Community Map'],
  },
  {
    id: 'responder' as Role,
    title: 'Responder',
    subtitle: 'Emergency Response',
    description: 'Live incidents, dispatch coordination, field response',
    icon: Siren,
    gradient: 'from-emergency to-emergency-dark',
    features: ['Live Incidents', 'Incident Management', 'Response Map', 'Status Tracking'],
  },
  {
    id: 'admin' as Role,
    title: 'Administrator',
    subtitle: 'Command Dashboard',
    description: 'Analytics, report moderation, system monitoring',
    icon: Shield,
    gradient: 'from-plum to-plum-light',
    features: ['Safety Analytics', 'Report Moderation', 'User Management', 'System Health'],
  },
];

const capabilities = [
  { icon: Brain, label: 'AI Detection' },
  { icon: MapPin, label: 'Live Tracking' },
  { icon: Users, label: 'Trusted Network' },
  { icon: Activity, label: 'Real-time Alerts' },
];

export function WelcomeScreen() {
  const { setRole } = useApp();
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'onboarding' | 'roles'>('intro');

  useEffect(() => {
    if (phase !== 'onboarding') return;
    const timer = setInterval(() => {
      setSlide((s) => (s < 2 ? s + 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [phase, slide]);

  const currentSlide = onboardingSlides[slide];

  return (
    <div className="min-h-screen bg-ivory relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-lavender-200/40 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-nude-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-lavender-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-10 py-5">
          <Logo size="md" />
          {phase !== 'intro' && (
            <button
              onClick={() => setPhase(phase === 'roles' ? 'onboarding' : 'intro')}
              className="flex items-center gap-1 text-sm font-semibold text-muted hover:text-plum transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-10 py-8">
          <div className="w-full max-w-5xl">
            {phase === 'intro' && <IntroPhase onContinue={() => setPhase('onboarding')} onDemo={() => setRole('user')} />}
            {phase === 'onboarding' && (
              <OnboardingPhase
                slide={slide}
                currentSlide={currentSlide}
                onSlideChange={setSlide}
                onContinue={() => setPhase('roles')}
              />
            )}
            {phase === 'roles' && <RolePhase onSelect={setRole} />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-5 text-xs text-muted">
          SafeStreet AI — Prototype Demo · All emergency responses are simulated for demonstration
        </div>
      </div>
    </div>
  );
}

function IntroPhase({ onContinue, onDemo }: { onContinue: () => void; onDemo: () => void }) {
  return (
    <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender-100 text-lavender-700 text-xs font-semibold mb-6">
        <Sparkles size={13} />
        AI-Powered Urban & Personal Safety Platform
      </div>

      <div className="flex justify-center mb-6">
        <Logo size="xl" showText={false} />
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-plum tracking-tight text-balance">
        SafeStreet<span className="text-lavender-500"> AI</span>
      </h1>
      <p className="text-lg sm:text-xl text-plum-muted mt-3 font-medium">
        Safety. Intelligence. Togetherness.
      </p>
      <p className="text-sm sm:text-base text-muted mt-4 max-w-xl mx-auto text-balance">
        Connected technology. Human protection. An intelligent, community-driven safety platform
        that detects risks, connects people, and supports faster, better-informed responses.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {capabilities.map((cap) => (
          <div key={cap.label} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-soft">
            <cap.icon size={18} className="text-lavender-600" />
            <span className="text-sm font-semibold text-plum">{cap.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Button size="lg" onClick={onContinue}>
          Get Started
          <ArrowRight size={18} />
        </Button>
        <Button size="lg" variant="outline" onClick={onDemo}>
          Explore Demo
          <Zap size={18} />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-success-dark" />
          No real emergencies dispatched
        </div>
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-lavender-500" />
          Privacy-first design
        </div>
      </div>
    </div>
  );
}

function OnboardingPhase({
  slide,
  currentSlide,
  onSlideChange,
  onContinue,
}: {
  slide: number;
  currentSlide: typeof onboardingSlides[0];
  onSlideChange: (s: number) => void;
  onContinue: () => void;
}) {
  const Icon = currentSlide.icon;
  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      <div className="relative mx-auto w-32 h-32 mb-8">
        <div
          className="absolute inset-0 rounded-4xl blur-2xl opacity-30 transition-all duration-500"
          style={{ backgroundColor: currentSlide.accent }}
        />
        <div
          className="relative w-32 h-32 rounded-4xl flex items-center justify-center shadow-elevated transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${currentSlide.accent}40, ${currentSlide.accent})` }}
        >
          <Icon size={56} className="text-white" strokeWidth={1.5} />
        </div>
      </div>

      <h2 key={slide} className="text-3xl sm:text-4xl font-extrabold text-plum animate-fade-in-up">
        {currentSlide.title}
      </h2>
      <p key={`desc-${slide}`} className="text-base text-muted mt-4 max-w-lg mx-auto animate-fade-in-up">
        {currentSlide.description}
      </p>

      <div className="flex items-center justify-center gap-2 mt-8">
        {onboardingSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSlideChange(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === slide ? 'w-8 bg-lavender-400' : 'w-2 bg-lavender-200 hover:bg-lavender-300'
            )}
          />
        ))}
      </div>

      <div className="mt-10">
        <Button size="lg" onClick={onContinue}>
          {slide < 2 ? 'Next' : 'Choose Your Role'}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function RolePhase({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-plum">Choose Your Experience</h2>
        <p className="text-muted mt-3 max-w-lg mx-auto">
          Explore SafeStreet AI from three perspectives. Switch roles anytime during the demo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="group relative text-left bg-white rounded-4xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={cn('absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br transition-opacity group-hover:opacity-40', r.gradient)} />

              <div className={cn('relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-soft', r.gradient)}>
                <Icon size={26} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-plum">{r.title}</h3>
              <p className="text-xs font-semibold text-lavender-600 mt-0.5 uppercase tracking-wider">{r.subtitle}</p>
              <p className="text-sm text-muted mt-3">{r.description}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {r.features.map((f) => (
                  <span key={f} className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-lavender-100/60 text-plum-muted">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 mt-5 text-sm font-semibold text-lavender-700 group-hover:gap-2.5 transition-all">
                Enter Demo
                <ArrowRight size={16} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-lavender-50/60 border border-lavender-100 flex items-start gap-3 max-w-2xl mx-auto">
        <AlertTriangle size={18} className="text-warning-dark shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          This is a prototype demonstration. All SOS triggers, notifications, responder actions, and AI detections
          are <strong className="text-plum">simulated</strong>. No real emergency services are contacted.
          Demo accounts require no authentication.
        </p>
      </div>
    </div>
  );
}
