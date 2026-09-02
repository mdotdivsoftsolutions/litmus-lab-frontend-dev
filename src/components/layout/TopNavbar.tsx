import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  ChevronRight, 
  Menu, 
  ClipboardList, 
  CheckCheck, 
  FlaskConical,
  Truck,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { notificationApi, InAppNotificationItem } from "@/lib/api/notification";

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getLabNotificationIcon(type: string) {
  switch (type) {
    case "BOOKING_ASSIGNED":
    case "NEW_BOOKING":
      return <ClipboardList className="h-4 w-4 text-emerald-600" />;
    case "LAB_UPDATE":
    case "REPORT_UPLOADED":
      return <FlaskConical className="h-4 w-4 text-purple-600" />;
    case "SUPPORT_REQUEST":
      return <MessageSquare className="h-4 w-4 text-amber-600" />;
    default:
      return <Bell className="h-4 w-4 text-primary" />;
  }
}

interface TopNavbarProps {
  onMenuClick: () => void;
  user?: any;
  onLogoutClick?: () => void;
  portal?: string;
}

export function TopNavbar({ onMenuClick, user: _user, onLogoutClick: _onLogoutClick, portal: _portal }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathParts = location.pathname.split("/").filter(Boolean);

  // 1. Live unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["labNotificationsUnreadCount"],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  // 2. Live notifications list
  const { data: notificationData } = useQuery({
    queryKey: ["labRecentNotifications"],
    queryFn: () => notificationApi.getNotifications({ limit: 8 }),
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const notifications = notificationData?.notifications || [];

  // 3. Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labNotificationsUnreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["labRecentNotifications"] });
    },
  });

  // 4. Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labNotificationsUnreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["labRecentNotifications"] });
    },
  });

  const handleNotificationClick = (n: InAppNotificationItem) => {
    if (!n.isRead) {
      markAsReadMutation.mutate(n._id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        aria-label="Open navigation sidebar"
        className="lg:hidden text-slate-600 hover:bg-slate-100" 
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
        {pathParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            <span className={i === pathParts.length - 1 ? "font-medium text-foreground capitalize" : "capitalize"}>
              {part.replace(/-/g, " ")}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="relative hover:bg-slate-100"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={8}
            className="w-[380px] sm:w-[420px] p-0 shadow-2xl border border-slate-200/90 bg-white rounded-2xl outline-none focus:outline-none overflow-hidden z-50 animate-in fade-in-0 zoom-in-95"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm text-slate-900">Laboratory Alerts</span>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    All caught up
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-[11px] text-primary hover:text-primary-deep font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-bold text-xs text-slate-800">No new laboratory alerts</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    New diagnostic bookings and sample dispatch notices assigned to your lab will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n._id} 
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex items-start gap-3.5 p-3.5 cursor-pointer transition-colors outline-none focus:outline-none rounded-none border-b border-slate-50 last:border-0",
                      n.isRead ? "bg-white hover:bg-slate-50/80 opacity-80" : "bg-primary/[0.04] hover:bg-primary/[0.08]"
                    )}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs shrink-0">
                      {getLabNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-xs truncate", n.isRead ? "font-semibold text-slate-700" : "font-bold text-slate-950")}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

  );
}

