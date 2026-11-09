import { useApp } from '@/store/AppContext';
import { Card, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Bell, Siren, Navigation, FileText, Shield, Users as UsersIcon,
  Activity, CheckCheck, BellOff,
} from 'lucide-react';
import { formatTimeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { AppNotification } from '@/types';

const typeConfig: Record<AppNotification['type'], { icon: typeof Bell; bg: string; color: string }> = {
  emergency: { icon: Siren, bg: 'bg-emergency-light', color: 'text-emergency-dark' },
  journey: { icon: Navigation, bg: 'bg-lavender-100', color: 'text-lavender-700' },
  community: { icon: FileText, bg: 'bg-nude-100', color: 'text-nude-700' },
  responder: { icon: Shield, bg: 'bg-lavender-100', color: 'text-lavender-700' },
  contact: { icon: UsersIcon, bg: 'bg-lavender-100/60', color: 'text-lavender-600' },
  system: { icon: Activity, bg: 'bg-lavender-100/40', color: 'text-muted' },
};

const filterTabs: { id: 'all' | AppNotification['type']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'journey', label: 'Journey' },
  { id: 'community', label: 'Community' },
  { id: 'responder', label: 'Responder' },
  { id: 'contact', label: 'Contacts' },
];

export function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-plum">Notifications</h2>
          <p className="text-sm text-muted mt-1">
            {notifications.filter((n) => !n.read).length} unread · {notifications.length} total
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const count = tab.id === 'all' ? notifications.length : notifications.filter((n) => n.type === tab.id).length;
          return (
            <button
              key={tab.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white shadow-soft text-sm font-semibold text-plum-muted hover:text-plum whitespace-nowrap transition-colors"
            >
              {tab.label}
              <span className="text-[10px] bg-lavender-100 text-lavender-700 px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            return (
              <Card
                key={n.id}
                className={cn('transition-colors', !n.read && 'border-l-4 border-l-lavender-400')}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon size={20} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-plum">{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-lavender-400 shrink-0" />}
                    </div>
                    <p className="text-sm text-plum-muted mt-0.5">{n.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted">{formatTimeAgo(n.timestamp)}</span>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{n.type}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState
              icon={<BellOff size={24} />}
              title="No notifications"
              message="You're all caught up. Notifications about emergencies, journeys, and community updates will appear here."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
