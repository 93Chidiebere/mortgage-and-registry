import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, Users, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string }> = {
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: Check, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  lead: { icon: Users, color: 'text-primary' },
  application: { icon: FileText, color: 'text-primary' },
};

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} unread</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((notif) => {
                  const config = typeConfig[notif.type];
                  const Icon = config.icon;
                  return (
                    <Card
                      key={notif.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        !notif.read && "border-primary/30 bg-primary/5"
                      )}
                      onClick={() => handleClick(notif)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={cn("mt-0.5 p-2 rounded-full bg-muted", config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={cn("text-sm font-medium", !notif.read && "font-semibold")}>
                              {notif.title}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                        </div>
                        {notif.link && <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
