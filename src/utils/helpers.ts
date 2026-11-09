import type {
  IncidentSeverity,
  IncidentStatus,
  CommunityCategory,
  CommunityStatus,
} from '@/types';

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export const severityConfig: Record<IncidentSeverity, { label: string; color: string; bg: string; text: string }> = {
  low: { label: 'Low', color: '#5BAE7E', bg: 'bg-success-light', text: 'text-success-dark' },
  medium: { label: 'Medium', color: '#E5A44D', bg: 'bg-warning-light', text: 'text-warning-dark' },
  high: { label: 'High', color: '#E5A44D', bg: 'bg-warning-light', text: 'text-warning-dark' },
  critical: { label: 'Critical', color: '#D94C5C', bg: 'bg-emergency-light', text: 'text-emergency-dark' },
};

export const incidentStatusConfig: Record<IncidentStatus, { label: string; tone: 'lavender' | 'warning' | 'success' | 'emergency' | 'neutral' }> = {
  new: { label: 'New', tone: 'emergency' },
  acknowledged: { label: 'Acknowledged', tone: 'warning' },
  assigned: { label: 'Assigned', tone: 'lavender' },
  responding: { label: 'Responding', tone: 'lavender' },
  resolved: { label: 'Resolved', tone: 'success' },
};

export const communityStatusConfig: Record<CommunityStatus, { label: string; tone: 'lavender' | 'warning' | 'success' | 'emergency' | 'neutral' }> = {
  pending: { label: 'Pending Review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'neutral' },
  flagged: { label: 'Flagged', tone: 'emergency' },
  duplicate: { label: 'Duplicate', tone: 'neutral' },
};

export const categoryConfig: Record<CommunityCategory, { label: string; icon: string; color: string }> = {
  pothole: { label: 'Pothole', icon: 'construction', color: '#E5A44D' },
  poor_lighting: { label: 'Poor Lighting', icon: 'lightbulb', color: '#7658A6' },
  harassment: { label: 'Harassment', icon: 'alert-octagon', color: '#D94C5C' },
  unsafe_area: { label: 'Unsafe Area', icon: 'map-pin', color: '#D94C5C' },
  accident: { label: 'Accident', icon: 'car', color: '#E5A44D' },
  suspicious_activity: { label: 'Suspicious Activity', icon: 'eye', color: '#B9A5DE' },
  infrastructure: { label: 'Infrastructure Hazard', icon: 'wrench', color: '#A88EAD' },
};

export const journeyModeConfig: Record<string, { label: string; icon: string }> = {
  walk: { label: 'Walking', icon: 'footprints' },
  bike: { label: 'Bicycle', icon: 'bike' },
  car: { label: 'Car', icon: 'car' },
  bus: { label: 'Bus', icon: 'bus' },
  auto_rickshaw: { label: 'Auto Rickshaw', icon: 'car' },
  train: { label: 'Train', icon: 'train-front' },
};

export function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
