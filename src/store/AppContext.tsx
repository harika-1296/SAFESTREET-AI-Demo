import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type {
  TrustedContact,
  EmergencyIncident,
  CommunityReport,
  Journey,
  AppNotification,
  ResponderUnit,
  AdminUser,
  SystemService,
  AIDetectionEvent,
  EmergencyStatus,
  Connectivity,
  Role,
  IncidentEvent,
} from '@/types';
import {
  seedContacts,
  seedIncidents,
  seedReports,
  seedJourneys,
  seedNotifications,
  seedResponders,
  seedAdminUsers,
  seedServices,
  seedAIDetection,
  makeTimelineEvent,
  makeRefId,
} from '@/data/seedData';

const STORAGE_KEY = 'safestreet-ai-state-v1';
const ACTIVE_INCIDENT_KEY = 'safestreet-active-emergency';

interface AppState {
  contacts: TrustedContact[];
  incidents: EmergencyIncident[];
  reports: CommunityReport[];
  journeys: Journey[];
  notifications: AppNotification[];
  responders: ResponderUnit[];
  adminUsers: AdminUser[];
  services: SystemService[];
  aiDetection: AIDetectionEvent;
  emergencyStatus: EmergencyStatus;
  activeIncidentId: string | null;
  connectivity: Connectivity;
  role: Role;
  userProfile: {
    name: string;
    phone: string;
    email: string;
    age: string;
    bloodGroup: string;
    emergencyNote: string;
    medicalConditions: string;
  };
}

interface AppContextValue extends AppState {
  setRole: (role: Role) => void;
  setConnectivity: (c: Connectivity) => void;
  addContact: (c: Omit<TrustedContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, patch: Partial<TrustedContact>) => void;
  startSOSCountdown: () => void;
  activateEmergency: (source: 'manual_sos' | 'ai_detection') => string;
  cancelEmergency: (asFalseAlarm: boolean) => void;
  cancelSOSCountdown: () => void;
  updateIncidentStatus: (id: string, status: EmergencyIncident['status'], responderName?: string) => void;
  addIncidentNote: (id: string, note: string) => void;
  addIncident: (incident: EmergencyIncident) => void;
  addReport: (r: Omit<CommunityReport, 'id' | 'refId' | 'createdAt' | 'status'>) => CommunityReport;
  updateReportStatus: (id: string, status: CommunityReport['status'], note?: string) => void;
  startJourney: (j: Omit<Journey, 'id' | 'startedAt' | 'status' | 'progress'>) => void;
  updateJourney: (id: string, patch: Partial<Journey>) => void;
  completeJourney: (id: string) => void;
  cancelJourney: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  triggerAIDetection: () => void;
  confirmAIEmergency: () => void;
  cancelAIDetection: () => void;
  resetDemo: () => void;
}

const defaultProfile = {
  name: 'Demo User',
  phone: '+91 90000 12345',
  email: 'demo@safestreet.ai',
  age: '28',
  bloodGroup: 'O+',
  emergencyNote: 'No known allergies. Contact sister Priya in emergencies.',
  medicalConditions: 'None',
};

const initialState: AppState = {
  contacts: seedContacts,
  incidents: seedIncidents,
  reports: seedReports,
  journeys: seedJourneys,
  notifications: seedNotifications,
  responders: seedResponders,
  adminUsers: seedAdminUsers,
  services: seedServices,
  aiDetection: seedAIDetection,
  emergencyStatus: 'idle',
  activeIncidentId: null,
  connectivity: 'online',
  role: 'welcome',
  userProfile: defaultProfile,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    const activeIncidentId = localStorage.getItem(ACTIVE_INCIDENT_KEY);
    return {
      ...initialState,
      ...parsed,
      emergencyStatus: activeIncidentId ? 'active' : 'idle',
      activeIncidentId: activeIncidentId || null,
    };
  } catch {
    return initialState;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      const { role, ...persistData } = state;
      void role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistData));
      if (state.activeIncidentId) {
        localStorage.setItem(ACTIVE_INCIDENT_KEY, state.activeIncidentId);
      } else {
        localStorage.removeItem(ACTIVE_INCIDENT_KEY);
      }
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const setRole = useCallback((role: Role) => {
    setState((s) => ({ ...s, role }));
  }, []);

  const setConnectivity = useCallback((c: Connectivity) => {
    setState((s) => ({ ...s, connectivity: c }));
  }, []);

  const addContact = useCallback((c: Omit<TrustedContact, 'id'>) => {
    setState((s) => ({
      ...s,
      contacts: [...s.contacts, { ...c, id: `c-${Date.now()}` }],
    }));
  }, []);

  const removeContact = useCallback((id: string) => {
    setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
  }, []);

  const updateContact = useCallback((id: string, patch: Partial<TrustedContact>) => {
    setState((s) => ({
      ...s,
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setState((s) => ({
      ...s,
      notifications: [
        { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const activateEmergency = useCallback((source: 'manual_sos' | 'ai_detection'): string => {
    const refId = makeRefId(source === 'manual_sos' ? 'SOS' : 'AI');
    const contactNames = state.contacts.filter((c) => c.notifyOnEmergency).map((c) => c.name);
    const incident: EmergencyIncident = {
      id: `inc-${Date.now()}`,
      refId,
      source,
      category: source === 'manual_sos' ? 'Personal Safety Emergency' : 'AI-Detected Distress Pattern',
      severity: source === 'manual_sos' ? 'critical' : 'high',
      status: 'new',
      location: { label: 'Current Location — MG Road, Bengaluru (Simulated)', lat: 12.9756, lng: 77.6069 },
      userName: state.userProfile.name,
      userPhone: state.userProfile.phone,
      description: source === 'manual_sos'
        ? 'User triggered manual SOS. Real-time location sharing active.'
        : 'AI detected distress-like audio and motion patterns. User confirmed emergency.',
      createdAt: new Date().toISOString(),
      aiRiskScore: source === 'ai_detection' ? 87 : undefined,
      aiConfidence: source === 'ai_detection' ? 'high' : undefined,
      contactsNotified: contactNames,
      timeline: [
        makeTimelineEvent(source === 'manual_sos' ? 'SOS triggered by user' : 'AI-detected emergency confirmed by user', 'created', state.userProfile.name),
        makeTimelineEvent(`Trusted contacts notified: ${contactNames.join(', ') || 'none'} (simulated)`, 'contact_notified'),
        makeTimelineEvent('Incident sent to response center', 'acknowledged'),
      ],
    };
    setState((s) => ({
      ...s,
      incidents: [incident, ...s.incidents],
      activeIncidentId: incident.id,
      emergencyStatus: 'active',
      notifications: [
        { id: `n-${Date.now()}`, type: 'emergency', title: 'SOS Active', message: 'Your emergency alert is active. Stay safe — help is being coordinated.', timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
    return incident.id;
  }, [state.contacts, state.userProfile]);

  const startSOSCountdown = useCallback(() => {
    setState((s) => ({ ...s, emergencyStatus: 'countdown' }));
  }, []);

  const cancelSOSCountdown = useCallback(() => {
    setState((s) => ({ ...s, emergencyStatus: 'idle' }));
  }, []);

  const cancelEmergency = useCallback((asFalseAlarm: boolean) => {
    setState((s) => {
      if (!s.activeIncidentId) return s;
      const incidents = s.incidents.map((inc) =>
        inc.id === s.activeIncidentId
          ? {
              ...inc,
              status: asFalseAlarm ? 'resolved' as const : inc.status,
              timeline: [...inc.timeline, makeTimelineEvent(asFalseAlarm ? 'Cancelled — false alarm. Incident resolved.' : 'Emergency cancelled by user.', 'cancelled', s.userProfile.name)],
            }
          : inc
      );
      return {
        ...s,
        incidents,
        emergencyStatus: asFalseAlarm ? 'false_alarm' : 'idle',
        activeIncidentId: null,
        notifications: [
          { id: `n-${Date.now()}`, type: 'emergency', title: 'Emergency Cancelled', message: asFalseAlarm ? 'SOS cancelled — false alarm confirmed.' : 'Emergency alert has been cancelled.', timestamp: new Date().toISOString(), read: false },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const updateIncidentStatus = useCallback((id: string, status: EmergencyIncident['status'], responderName?: string) => {
    setState((s) => {
      const incidents = s.incidents.map((inc) => {
        if (inc.id !== id) return inc;
        const eventMap: Record<string, string> = {
          acknowledged: 'Incident acknowledged',
          assigned: `Assigned to ${responderName || 'a responder'}`,
          responding: `Responder ${responderName || inc.responderName || ''} is en route`.trim(),
          resolved: 'Incident marked as resolved',
          new: 'Incident reopened',
        };
        const typeMap: IncidentEvent['type'] = status === 'acknowledged' ? 'acknowledged' : status === 'assigned' ? 'assigned' : status === 'responding' ? 'responding' : status === 'resolved' ? 'resolved' : 'created';
        return {
          ...inc,
          status,
          responderName: responderName || inc.responderName,
          timeline: [...inc.timeline, makeTimelineEvent(eventMap[status] || `Status: ${status}`, typeMap, responderName)],
        };
      });
      return { ...s, incidents };
    });
  }, []);

  const addIncidentNote = useCallback((id: string, note: string) => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((inc) =>
        inc.id === id ? { ...inc, timeline: [...inc.timeline, makeTimelineEvent(`Note: ${note}`, 'note')] } : inc
      ),
    }));
  }, []);

  const addIncident = useCallback((incident: EmergencyIncident) => {
    setState((s) => ({ ...s, incidents: [incident, ...s.incidents] }));
  }, []);

  const addReport = useCallback((r: Omit<CommunityReport, 'id' | 'refId' | 'createdAt' | 'status'>): CommunityReport => {
    const report: CommunityReport = {
      ...r,
      id: `r-${Date.now()}`,
      refId: makeRefId('RPT'),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setState((s) => ({
      ...s,
      reports: [report, ...s.reports],
      notifications: [
        { id: `n-${Date.now()}`, type: 'community', title: 'Report Submitted', message: `Your report ${report.refId} has been submitted and is pending review.`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
    return report;
  }, []);

  const updateReportStatus = useCallback((id: string, status: CommunityReport['status'], note?: string) => {
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === id ? { ...r, status, moderationNote: note || r.moderationNote } : r
      ),
    }));
  }, []);

  const startJourney = useCallback((j: Omit<Journey, 'id' | 'startedAt' | 'status' | 'progress'>) => {
    const journey: Journey = {
      ...j,
      id: `j-${Date.now()}`,
      startedAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
    };
    setState((s) => ({
      ...s,
      journeys: [journey, ...s.journeys],
      notifications: [
        { id: `n-${Date.now()}`, type: 'journey', title: 'Journey Started', message: `Safe Journey to ${j.destination} has started. Trusted contacts notified.`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const updateJourney = useCallback((id: string, patch: Partial<Journey>) => {
    setState((s) => ({
      ...s,
      journeys: s.journeys.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }));
  }, []);

  const completeJourney = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      journeys: s.journeys.map((j) => (j.id === id ? { ...j, status: 'completed', progress: 100 } : j)),
      notifications: [
        { id: `n-${Date.now()}`, type: 'journey', title: 'Journey Completed', message: 'You arrived safely. Trusted contacts have been notified.', timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const cancelJourney = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      journeys: s.journeys.map((j) => (j.id === id ? { ...j, status: 'cancelled' } : j)),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const triggerAIDetection = useCallback(() => {
    setState((s) => ({
      ...s,
      aiDetection: {
        ...s.aiDetection,
        status: 'verifying',
        timestamp: new Date().toISOString(),
        audioPattern: 'Distress-like signal detected',
        motionPattern: 'Unusual sharp movement pattern',
        riskScore: 87,
        confidence: 'high',
        recommendedAction: 'Request user verification immediately',
      },
    }));
  }, []);

  const confirmAIEmergency = useCallback(() => {
    setState((s) => ({ ...s, aiDetection: { ...s.aiDetection, status: 'confirmed' } }));
  }, []);

  const cancelAIDetection = useCallback(() => {
    setState((s) => ({ ...s, aiDetection: { ...s.aiDetection, status: 'false_alarm' } }));
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_INCIDENT_KEY);
    setState({ ...initialState, role: 'welcome' });
  }, []);

  const value: AppContextValue = {
    ...state,
    setRole,
    setConnectivity,
    addContact,
    removeContact,
    updateContact,
    startSOSCountdown,
    activateEmergency,
    cancelEmergency,
    cancelSOSCountdown,
    updateIncidentStatus,
    addIncidentNote,
    addIncident,
    addReport,
    updateReportStatus,
    startJourney,
    updateJourney,
    completeJourney,
    cancelJourney,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    triggerAIDetection,
    confirmAIEmergency,
    cancelAIDetection,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
