export type Role = 'welcome' | 'user' | 'responder' | 'admin';

export type Connectivity = 'online' | 'weak' | 'offline';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'new'
  | 'acknowledged'
  | 'assigned'
  | 'responding'
  | 'resolved';

export type IncidentSource = 'manual_sos' | 'ai_detection' | 'community_report' | 'journey_alert';

export type CommunityCategory =
  | 'pothole'
  | 'poor_lighting'
  | 'harassment'
  | 'unsafe_area'
  | 'accident'
  | 'suspicious_activity'
  | 'infrastructure';

export type CommunityStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'duplicate';

export type JourneyStatus = 'active' | 'completed' | 'overdue' | 'cancelled';

export type JourneyMode = 'walk' | 'bike' | 'car' | 'bus' | 'auto_rickshaw' | 'train';

export type TransportMode = 'walk' | 'bike' | 'car' | 'bus' | 'auto_rickshaw' | 'train';

export type EmergencyStatus = 'idle' | 'countdown' | 'active' | 'resolved' | 'false_alarm';

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyOnEmergency: boolean;
  notifyOnJourney: boolean;
  status: 'available' | 'unavailable';
  avatarColor: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  label: string;
  type: 'created' | 'acknowledged' | 'assigned' | 'responding' | 'resolved' | 'note' | 'contact_notified' | 'ai_detected' | 'user_confirmed' | 'cancelled';
  actor?: string;
}

export interface EmergencyIncident {
  id: string;
  refId: string;
  source: IncidentSource;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: { label: string; lat: number; lng: number };
  userName: string;
  userPhone: string;
  description: string;
  createdAt: string;
  responderName?: string;
  aiRiskScore?: number;
  aiConfidence?: 'low' | 'medium' | 'high';
  timeline: IncidentEvent[];
  contactsNotified: string[];
}

export interface CommunityReport {
  id: string;
  refId: string;
  category: CommunityCategory;
  description: string;
  location: { label: string; lat: number; lng: number };
  severity: IncidentSeverity;
  status: CommunityStatus;
  reportedBy: string;
  anonymous: boolean;
  createdAt: string;
  imageUrl?: string;
  moderationNote?: string;
}

export interface Journey {
  id: string;
  origin: string;
  destination: string;
  mode: JourneyMode;
  status: JourneyStatus;
  startedAt: string;
  etaMinutes: number;
  progress: number;
  sharedWith: string[];
  contactNames: string[];
}

export interface AppNotification {
  id: string;
  type: 'emergency' | 'journey' | 'community' | 'responder' | 'contact' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ResponderUnit {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'responding' | 'offline';
  assignedIncidents: number;
  zone: string;
  rating: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'responder' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  lastActive: string;
  location: string;
}

export interface AIDetectionEvent {
  id: string;
  audioPattern: string;
  motionPattern: string;
  riskScore: number;
  confidence: 'low' | 'medium' | 'high';
  timestamp: string;
  status: 'detecting' | 'verifying' | 'confirmed' | 'false_alarm' | 'escalated';
  recommendedAction: string;
}

export interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  latency: string;
  uptime: string;
  description: string;
  simulated: boolean;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  category: CommunityCategory | 'emergency';
  severity: IncidentSeverity;
  label: string;
  status?: CommunityStatus | IncidentStatus;
}
