import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Package, FlaskConical, BookOpen, CreditCard, FileText, FolderOpen, UserCircle,
  Users, Building2, ClipboardList, Grid3X3, ShoppingBag, TestTubes, BarChart3, FileCheck,
  Upload, DollarSign, CalendarDays, X, Flame, ChevronLeft, ChevronRight, MessageSquareQuote, CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarNavProps {
  portal: "user" | "admin" | "lab";
  open: boolean;
  onClose: () => void;
  user?: any;
}

const userNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Products & Tests", icon: Package, href: "/dashboard/products" },
  { label: "Laboratories", icon: FlaskConical, href: "/dashboard/laboratories" },
  { label: "My Bookings", icon: BookOpen, href: "/dashboard/bookings" },
  { label: "Payments", icon: CreditCard, href: "/dashboard/payments" },
  { label: "Reports", icon: FileText, href: "/dashboard/reports" },
  { label: "Documents", icon: FolderOpen, href: "/dashboard/documents" },
  { label: "Profile", icon: UserCircle, href: "/dashboard/profile" },
];

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Consultations", icon: FileText, href: "/admin/consultations" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Laboratories", icon: Building2, href: "/admin/laboratories" },
  { label: "Bookings", icon: ClipboardList, href: "/admin/bookings" },
  { label: "Categories", icon: Grid3X3, href: "/admin/categories" },
  { label: "Products", icon: ShoppingBag, href: "/admin/products" },
  { label: "Tests", icon: TestTubes, href: "/admin/tests" },
  { label: "Packages", icon: Package, href: "/admin/packages" },
  { label: "Payments", icon: DollarSign, href: "/admin/payments" },
  { label: "Reviews", icon: MessageSquareQuote, href: "/admin/reviews" },
  // { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Reports", icon: FileCheck, href: "/admin/reports" },
  { label: "Settings", icon: Flame, href: "/admin/settings" },
  { label: "Approvals", icon: CheckSquare, href: "/admin/approvals" },
];

const labNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/lab/dashboard" },
  { label: "Bookings", icon: ClipboardList, href: "/lab/bookings" },
  { label: "Tests", icon: TestTubes, href: "/lab/tests" },
  { label: "Packages", icon: Package, href: "/lab/packages" },
  { label: "Schedule", icon: CalendarDays, href: "/lab/schedule" },
  { label: "Profile", icon: UserCircle, href: "/lab/profile" },
];

const navMap = { user: userNav, admin: adminNav, lab: labNav };
const subtitleMap = { user: "FOOD TESTING", admin: "ADMIN PANEL", lab: "LAB PORTAL" };

export function SidebarNav({ portal, open, onClose, user }: SidebarNavProps) {
  const location = useLocation();
  const navItems = navMap[portal];
  const [collapsed, setCollapsed] = useState(false);

  const getInitials = () => {
    if (!user) return portal === "user" ? "RK" : portal === "admin" ? "A" : "CL";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-600 transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Floating collapse toggle — desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute -right-3 top-16 z-50 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>

        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3">
          {!collapsed && (
            <Link to="/" className="flex flex-col items-start">
              <img src="/logo.png" alt="Litmus Logo" className="h-8 object-contain" />
              <div className="leading-none mt-1">
                <span className="block text-[9px] tracking-wider text-slate-500 font-semibold">{subtitleMap[portal]}</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="mx-auto">
              <img src="/logo.png" alt="Litmus Logo" className="h-6 object-contain" />
            </Link>
          )}
          <Button variant="ghost" size="icon" className="text-slate-500 lg:hidden h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav links — contained scroll within sidebar only */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && item.href !== "/lab/dashboard" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  collapsed && "justify-center px-2",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="shrink-0 border-t border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-lg border-l-2 border-l-primary pl-2">
              <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-primary text-xs font-bold border border-slate-200">
                {getInitials()}
              </div>
              <div className="leading-none overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : (portal === "user" ? "Rajesh Kumar" : portal === "admin" ? "Admin" : "Chennai Lab")}
                </p>
                <p className="text-[10px] text-slate-500 capitalize truncate mt-0.5">
                  {user ? (user.role || "").toLowerCase() : (portal === "user" ? "Business User" : portal === "admin" ? "Administrator" : "Laboratory")}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
