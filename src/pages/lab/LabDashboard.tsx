import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardList, 
  FlaskConical, 
  CheckCircle2, 
  IndianRupee, 
  Upload, 
  ArrowUpRight, 
  AlertCircle, 
  Calendar, 
  RefreshCw,
  FileCheck2,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { labApi } from "@/lib/api/lab";
import { format } from "date-fns";

export default function LabDashboard() {
  const navigate = useNavigate();

  const { data: statsResponse, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["labStats"],
    queryFn: labApi.getDashboardStats,
    refetchInterval: 30000,
  });

  const stats = statsResponse?.data || {};

  const kpis = [
    { 
      label: "New Bookings", 
      value: stats.newBookings !== undefined ? stats.newBookings.toLocaleString() : "0", 
      sub: "Awaiting sample / testing", 
      badge: "Pending",
      icon: ClipboardList, 
    },
    { 
      label: "Tests In Progress", 
      value: stats.inProgressTests !== undefined ? stats.inProgressTests.toLocaleString() : "0", 
      sub: "Active sample processing", 
      badge: "Active",
      icon: FlaskConical, 
    },
    { 
      label: "Completed Tests", 
      value: stats.completedTests !== undefined ? stats.completedTests.toLocaleString() : "0", 
      sub: stats.completedToday !== undefined ? `${stats.completedToday} completed today` : "Orders fulfilled", 
      badge: "Fulfilled",
      icon: CheckCircle2, 
    },
    { 
      label: "Revenue This Month", 
      value: stats.revenueThisMonth !== undefined ? `₹${Number(stats.revenueThisMonth).toLocaleString('en-IN')}` : stats.totalRevenue !== undefined ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : "₹0", 
      sub: "Fulfilled / paid volume", 
      badge: "Live",
      icon: IndianRupee, 
    },
  ];

  const recentBookings = stats.recentBookings || [];
  const pendingUploads = stats.pendingUploads || [];
  const weeklyData = stats.weeklyLoad || [
    { day: "Mon", bookings: 0 },
    { day: "Tue", bookings: 0 },
    { day: "Wed", bookings: 0 },
    { day: "Thu", bookings: 0 },
    { day: "Fri", bookings: 0 },
    { day: "Sat", bookings: 0 },
    { day: "Sun", bookings: 0 }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Lab Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor incoming sample logistics, diagnostic test execution, certified report uploads, and revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="h-8 text-xs bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin text-primary' : 'text-slate-500'}`} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate("/lab/bookings")} 
            className="h-8 text-xs bg-primary hover:bg-primary/90 text-white shadow-2xs gap-1.5 font-semibold"
          >
            <span>All Bookings</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid - Clean, Unified Admin Architecture */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-slate-200/80 shadow-2xs p-4 sm:p-5 bg-white rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-8 w-8 rounded-lg bg-muted/60" />
                <Skeleton className="h-4 w-12 rounded-full bg-muted/50" />
              </div>
              <Skeleton className="h-7 w-24 mb-1.5 bg-muted/60" />
              <Skeleton className="h-3.5 w-32 bg-muted/40" />
              <Skeleton className="h-3 w-20 mt-2 bg-muted/30" />
            </Card>
          ))
        ) : (
          kpis.map((kpi) => (
            <Card 
              key={kpi.label} 
              className="bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:shadow-xs transition-shadow duration-150 relative"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <kpi.icon className="h-4.5 w-4.5 text-slate-700" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                    {kpi.badge}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                  <p className="text-xs font-semibold text-slate-600">{kpi.label}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main Grid: Weekly Load Activity & Recent Bookings / Pending Uploads */}
      <div className="grid gap-3 lg:grid-cols-12 items-start">
        {/* Left Column: Weekly Load Activity & Performance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Weekly Load Chart */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Weekly Load Activity</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Assigned diagnostic bookings received across the past 7 days.
                </CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                  Last 7 Days
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 min-h-[290px]">
              {isLoading ? (
                <Skeleton className="h-[260px] w-full rounded-lg" />
              ) : (
                <div className="h-[260px] min-h-[260px] w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12, fill: "#64748B" }} 
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: "#64748B" }} 
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`${val} Bookings`, "Volume"]}
                        contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} 
                        wrapperStyle={{ zIndex: 100 }}
                      />
                      <Bar 
                        dataKey="bookings" 
                        fill="hsl(var(--primary))" 
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>

          </Card>
        </div>

        {/* Right Column: Pending Uploads & Recent Assigned Bookings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending Uploads Card */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Pending Report Uploads</span>
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingUploads.length} Action Needed
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Active tests awaiting certified diagnostic report upload.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-2.5">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))
              ) : pendingUploads.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                  <FileCheck2 className="h-6 w-6 text-emerald-600" />
                  <span className="font-semibold text-slate-700">All reports are up to date!</span>
                  <p className="text-[11px] text-muted-foreground">No pending report uploads required at this moment.</p>
                </div>
              ) : (
                pendingUploads.map((p: any) => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between text-xs rounded-xl border border-slate-200/80 p-3 bg-slate-50/50 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.displayId || p.id}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-slate-800 truncate font-semibold">{p.user}</p>
                      {p.product && (
                        <p className="text-[11px] text-muted-foreground truncate">{p.product}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/lab/bookings/${p.id}/upload`)}
                      className="text-xs h-7 px-2.5 bg-primary hover:bg-primary/90 text-white font-medium shadow-2xs gap-1 shrink-0 ml-2"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload</span>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Assigned Bookings */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Recent Assigned Bookings</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Orders allocated to this laboratory.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/lab/bookings")} 
                className="text-xs text-primary hover:text-primary/80 h-8 px-2 font-medium"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))
              ) : recentBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-700">No bookings assigned yet</span>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    When the administrator assigns customer test bookings to your laboratory, they will appear here.
                  </p>
                </div>
              ) : (
                recentBookings.map((b: any) => (
                  <div 
                    key={b.id} 
                    onClick={() => navigate(`/lab/bookings/${b.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-3.5 hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-primary transition-colors">
                          {b.displayId || b.id}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {b.user} <span className="font-normal text-muted-foreground">· {b.product || b.tests}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {b.createdAt ? format(new Date(b.createdAt), "MMM d, yyyy • h:mm a") : "Recent"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                      {b.hasReport ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Report Ready</span>
                        </span>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/lab/bookings/${b.id}/upload`)} 
                          className="text-xs h-8 px-2.5 bg-white border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 gap-1.5 shadow-2xs"
                        >
                          <Upload className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Upload</span>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/lab/bookings/${b.id}`)} 
                        className="text-xs h-8 px-2 text-slate-600 hover:text-slate-900"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
