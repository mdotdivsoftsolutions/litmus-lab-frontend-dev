import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Package, FlaskConical, BookOpen, CreditCard, FileText, FolderOpen, UserCircle,
  Users, Building2, ClipboardList, Grid3X3, ShoppingBag, TestTubes, BarChart3, FileCheck,
  Upload, DollarSign, CalendarDays, X, Flame, ChevronLeft, ChevronRight, MessageSquareQuote, CheckSquare,
  ChevronUp, Settings, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { labApi } from "@/lib/api/lab";

interface SidebarNavProps {
  portal?: "user" | "admin" | "lab";
  open: boolean;
  onClose: () => void;
  user?: any;
  onLogoutClick?: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/lab/dashboard" },
  { label: "Bookings", icon: ClipboardList, href: "/lab/bookings" },
  { label: "Tests", icon: TestTubes, href: "/lab/tests" },
  { label: "Packages", icon: Package, href: "/lab/packages" },
  { label: "Employees", icon: Users, href: "/lab/employees" },
  { label: "Schedule", icon: CalendarDays, href: "/lab/schedule" },
  { label: "Profile", icon: UserCircle, href: "/lab/profile" },
];

export function SidebarNav({ portal, open, onClose, user, onLogoutClick }: SidebarNavProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Live Lab stats for badges
  const { data: statsResponse } = useQuery({
    queryKey: ["labStats"],
    queryFn: labApi.getDashboardStats,
    refetchInterval: 30000,
  });
  const stats = statsResponse?.data || {};

  const getItemBadge = (label: string): number | null => {
    if (!statsResponse?.data) return null;
    switch (label) {
      case "Bookings":
        return stats.totalBookings > 0 ? stats.totalBookings : null;
      case "Tests":
        return stats.totalTests > 0 ? stats.totalTests : null;
      case "Packages":
        return stats.totalPackages > 0 ? stats.totalPackages : null;
      case "Employees":
        return stats.totalEmployees > 0 ? stats.totalEmployees : null;
      default:
        return null;
    }
  };

  const labName = user?.labId?.labName || user?.labName || (user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "Laboratory Portal");
  
  const getInitials = () => {
    if (user?.labId?.labName) {
      const parts = user.labId.labName.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.labId.labName.slice(0, 2).toUpperCase();
    }
    if (user) {
      const init = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
      if (init) return init;
    }
    return "TL";
  };

  const roleName = user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "LABORATORY";
  const userEmail = user?.email || user?.contactEmail || "lab@litmus.com";

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-600 transition-all duration-200 shrink-0 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Floating collapse toggle — desktop only */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className="hidden lg:flex absolute -right-3 top-16 z-50 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-3.5">
          {!collapsed && (
            <Link to="/" className="flex flex-col items-start select-none outline-none focus:outline-none" aria-label="Litmus Laboratory Home">
              <img src="/logo.webp" alt="Litmus Logo" className="h-7 w-auto max-w-[130px] object-contain" />
              <div className="leading-none mt-1">
                <span className="block text-[9px] tracking-wider text-slate-500 font-bold uppercase truncate max-w-[170px]">
                  {user?.labId?.labName ? user.labId.labName : "LAB PORTAL"}
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="mx-auto select-none outline-none focus:outline-none" aria-label="Litmus Laboratory Home">
              <img src="/logo.webp" alt="Litmus Logo" className="h-5 w-auto object-contain" />
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Close sidebar navigation"
            className="text-slate-500 lg:hidden h-7 w-7" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav links — contained scroll within sidebar only */}
        <nav aria-label="Main sidebar navigation" className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && item.href !== "/lab/dashboard" && location.pathname.startsWith(item.href));
            const badgeCount = getItemBadge(item.label);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? `${item.label}${badgeCount !== null && badgeCount !== undefined ? ` (${badgeCount})` : ''}` : undefined}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all group select-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
                  collapsed && "justify-center px-2",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && badgeCount !== null && badgeCount !== undefined && (
                  <span className={cn(
                    "min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors shrink-0 ml-1.5 tabular-nums",
                    isActive
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile with Interactive Popover */}
        <div className={cn("shrink-0 border-t border-slate-200", collapsed ? "p-2 flex justify-center" : "p-2.5")}>
          <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <PopoverTrigger asChild>
              {collapsed ? (
                <button
                  type="button"
                  title={labName}
                  aria-label="User account details"
                  aria-expanded={isUserMenuOpen}
                  className="relative h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity outline-none focus:outline-none ring-0 border-0"
                >
                  {getInitials()}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="User account details"
                  aria-expanded={isUserMenuOpen}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all text-left group shadow-xs outline-none focus:outline-none ring-0",
                    isUserMenuOpen && "bg-slate-50 border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-xs">
                        {getInitials()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div className="leading-tight overflow-hidden min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {labName}
                      </p>
                      <p className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mt-0.5 truncate">
                        {roleName}
                      </p>
                    </div>
                  </div>
                  <ChevronUp className={cn("h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200", isUserMenuOpen ? "rotate-0 text-slate-700" : "rotate-180")} />
                </button>
              )}
            </PopoverTrigger>


            <PopoverContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "end" : "start"}
              sideOffset={10}
              className="w-56 p-2 rounded-xl shadow-xl border border-slate-200 bg-white z-50 outline-none focus:outline-none ring-0"
            >
              {/* User Header Details */}
              <div className="px-1.5 py-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">{labName}</p>
                  <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-200 shrink-0">
                    {roleName}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>

              <div className="my-1.5 border-t border-slate-100" />

              {/* Menu Links */}
              <div className="space-y-0.5">
                <Link
                  to="/lab/profile"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors outline-none focus:outline-none"
                >
                  <UserCircle className="h-3.5 w-3.5 text-slate-500" />
                  <span>Lab Profile</span>
                </Link>

                <Link
                  to="/lab/employees"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors outline-none focus:outline-none"
                >
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span>Staff & Employees</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left outline-none focus:outline-none ring-0 border-0"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      {/* Confirmation modal before sign out */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of the Laboratory Portal? You will need to log in again to access the lab dashboard."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => onLogoutClick?.()}
      />
    </>
  );
}
