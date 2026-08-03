import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Menu, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { notifications } from "@/lib/placeholder-data";

interface TopNavbarProps {
  onMenuClick: () => void;
  user?: any;
  onLogoutClick?: () => void;
  portal?: string;
}

export function TopNavbar({ onMenuClick, user, onLogoutClick, portal }: TopNavbarProps) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
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
            <Button variant="ghost" size="icon" className="relative hover:bg-transparent">
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 px-3 py-2">
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <span className="font-medium text-sm">{n.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
              <Avatar className="h-8 w-8 ring-2 ring-flame-orange ring-offset-1 ring-offset-card">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link to={portal ? `/${portal}/profile` : "/dashboard/profile"}><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
