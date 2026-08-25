import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Clock, CalendarDays, CalendarX, Plus, Trash2, Loader2, 
  CheckCircle2, Sliders, ShieldCheck, 
  Calendar as CalendarIcon, Sun, Moon, Zap
} from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { labApi } from "@/lib/api/lab";
import { cn } from "@/lib/utils";

const fullDays = [
  { key: "Monday", short: "Mon" },
  { key: "Tuesday", short: "Tue" },
  { key: "Wednesday", short: "Wed" },
  { key: "Thursday", short: "Thu" },
  { key: "Friday", short: "Fri" },
  { key: "Saturday", short: "Sat" },
  { key: "Sunday", short: "Sun" },
];

const holidaySuggestions = [
  "National Holiday",
  "Lab Maintenance",
  "Deep Cleaning & Sanitization",
  "Equipment Calibration",
  "Annual Audit",
  "Public Holiday"
];

// Helper: Convert "HH:mm" (24hr) -> "hh:mm A" (12hr format)
function formatTo12Hour(time24: string): string {
  if (!time24) return "09:00 AM";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  const formattedH = h.toString().padStart(2, "0");
  const formattedM = m.toString().padStart(2, "0");
  return `${formattedH}:${formattedM} ${ampm}`;
}

// Helper: Convert 12hr parts -> "HH:mm" (24hr format)
function to24Hour(hour12: number, minute: number, period: "AM" | "PM"): string {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Helper: Parse "HH:mm" into 12hr parts
function parseTime24(time24: string) {
  const [hStr, mStr] = (time24 || "09:00").split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour12, minute, period };
}

// Custom 12-Hour Time Picker Component
function TimePicker12({
  value,
  onChange,
  label,
  icon: Icon
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  icon?: any;
}) {
  const { hour12, minute, period } = parseTime24(value);

  const handleHourChange = (newHourStr: string) => {
    const h = parseInt(newHourStr, 10);
    onChange(to24Hour(h, minute, period));
  };

  const handleMinuteChange = (newMinStr: string) => {
    const m = parseInt(newMinStr, 10);
    onChange(to24Hour(hour12, m, period));
  };

  const handlePeriodToggle = (newPeriod: "AM" | "PM") => {
    if (newPeriod !== period) {
      onChange(to24Hour(hour12, minute, newPeriod));
    }
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary" />} {label}
        </Label>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-900 font-mono text-xs font-bold px-2 py-0.5 shadow-2xs">
          {formatTo12Hour(value)}
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-2 items-center pt-1">
        {/* Hour Select */}
        <div className="col-span-5">
          <Select value={hour12.toString().padStart(2, "0")} onValueChange={handleHourChange}>
            <SelectTrigger className="h-10 bg-white font-mono text-xs font-bold border-slate-200">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hoursList.map(h => (
                <SelectItem key={h} value={h} className="font-mono text-xs">
                  {h} <span className="text-muted-foreground text-[10px]">hr</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 text-center font-bold text-slate-400">:</div>

        {/* Minute Select */}
        <div className="col-span-3">
          <Select value={minute.toString().padStart(2, "0")} onValueChange={handleMinuteChange}>
            <SelectTrigger className="h-10 bg-white font-mono text-xs font-bold border-slate-200">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutesList.map(m => (
                <SelectItem key={m} value={m} className="font-mono text-xs">
                  {m} <span className="text-muted-foreground text-[10px]">m</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AM / PM Switch */}
        <div className="col-span-3 flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
          <button
            type="button"
            onClick={() => handlePeriodToggle("AM")}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
              period === "AM" 
                ? "bg-white text-primary shadow-2xs" 
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodToggle("PM")}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
              period === "PM" 
                ? "bg-primary text-white shadow-2xs" 
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LabSchedulePage() {
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [dailyLimit, setDailyLimit] = useState(15);
  const [blockedDates, setBlockedDates] = useState<{ date: string; name: string }[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockName, setNewBlockName] = useState("");

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["myLabProfile"],
    queryFn: labApi.getMyLabProfile,
  });

  useEffect(() => {
    if (profileResponse?.data) {
      const profile = profileResponse.data;
      setDailyLimit(profile.dailyLimit || 15);
      if (profile.availability) {
        setStartTime(profile.availability.startTime || "09:00");
        setEndTime(profile.availability.endTime || "18:00");
        setWorkingDays(profile.availability.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
        setBlockedDates(profile.availability.blockedDates || []);
      } else {
        setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
      }
    }
  }, [profileResponse]);

  const { mutate: updateWorkingHours, isPending: isSavingHours } = useMutation({
    mutationFn: labApi.updateMyLabProfile,
    onSuccess: () => {
      toast.success("Operational working hours saved successfully");
      queryClient.invalidateQueries({ queryKey: ["myLabProfile"] });
    },
    onError: () => {
      toast.error("Failed to update working hours");
    },
  });

  const { mutate: updateLimits, isPending: isSavingLimits } = useMutation({
    mutationFn: labApi.updateMyLabProfile,
    onSuccess: () => {
      toast.success("Capacity and booking limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["myLabProfile"] });
    },
    onError: () => {
      toast.error("Failed to update booking limits");
    },
  });

  const handleSaveWorkingHours = () => {
    updateWorkingHours({
      availability: {
        ...(profileResponse?.data?.availability || {}),
        startTime,
        endTime,
        workingDays,
        blockedDates,
      },
    });
  };

  const handleSaveLimits = () => {
    updateLimits({
      dailyLimit,
    });
  };

  const handleAddBlockDate = () => {
    if (!newBlockDate || !newBlockName) {
      toast.error("Please enter both holiday name and date");
      return;
    }
    
    // Check if already blocked
    if (blockedDates.some(b => b.date === newBlockDate)) {
      toast.error("This date is already blocked on your schedule");
      return;
    }

    const newBlockedDates = [...blockedDates, { date: newBlockDate, name: newBlockName.trim() }];
    setBlockedDates(newBlockedDates);
    setNewBlockDate("");
    setNewBlockName("");
    
    updateWorkingHours({
      availability: {
        ...(profileResponse?.data?.availability || {}),
        startTime,
        endTime,
        workingDays,
        blockedDates: newBlockedDates,
      },
    });
  };

  const handleRemoveBlockDate = (dateToRemove: string) => {
    const newBlockedDates = blockedDates.filter(b => b.date !== dateToRemove);
    setBlockedDates(newBlockedDates);
    
    updateWorkingHours({
      availability: {
        ...(profileResponse?.data?.availability || {}),
        startTime,
        endTime,
        workingDays,
        blockedDates: newBlockedDates,
      },
    });
    toast.success("Blocked date removed");
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const applyPreset = (preset: "weekdays" | "sixdays" | "all" | "clear") => {
    if (preset === "weekdays") {
      setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    } else if (preset === "sixdays") {
      setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    } else if (preset === "all") {
      setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    } else {
      setWorkingDays([]);
    }
  };

  // Calculate shift duration
  const shiftDuration = useMemo(() => {
    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''} shift`;
    } catch {
      return "Custom shift";
    }
  }, [startTime, endTime]);

  const weeklyLimit = dailyLimit * workingDays.length;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parsed = new Date(dateStr);
      if (isValid(parsed)) {
        return format(parsed, "EEE, MMM dd, yyyy");
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading laboratory schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground font-nunito tracking-tight">
              Schedule & Capacity Management
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              12-Hour Operational Format
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure laboratory operating hours, sample intake quotas, and blackout dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Lab Slots Active
          </div>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Operating Shift</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {formatTo12Hour(startTime)} – {formatTo12Hour(endTime)}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{shiftDuration} daily</p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Active Workdays</span>
            <CalendarDays className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {workingDays.length} / 7 Days
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
              {workingDays.length === 0 ? "Closed all week" : workingDays.length === 7 ? "Open every day" : workingDays.map(d => d.slice(0, 3)).join(", ")}
            </p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Daily Intake Limit</span>
            <Sliders className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {dailyLimit} Bookings / day
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Maximum patient slots</p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Weekly Capacity</span>
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {weeklyLimit} Bookings / week
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Auto-calculated quota</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Operating Hours & Active Days (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                      Operational Shift Hours (12-Hour Format)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Set daily open and close timings with 12-hour AM/PM selection
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-xs font-semibold">
                  {shiftDuration}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimePicker12
                  label="Start Time (Opening)"
                  icon={Sun}
                  value={startTime}
                  onChange={setStartTime}
                />

                <TimePicker12
                  label="End Time (Closing)"
                  icon={Moon}
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>

              {/* Working Days Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Active Operational Days ({workingDays.length} Selected)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">Select days when your facility is open for bookings</p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyPreset("weekdays")}
                      className="h-7 px-2 text-[11px] font-medium bg-white hover:bg-slate-50 border-slate-200"
                    >
                      Mon–Fri
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyPreset("sixdays")}
                      className="h-7 px-2 text-[11px] font-medium bg-white hover:bg-slate-50 border-slate-200"
                    >
                      Mon–Sat
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyPreset("all")}
                      className="h-7 px-2 text-[11px] font-medium bg-white hover:bg-slate-50 border-slate-200"
                    >
                      All 7 Days
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {fullDays.map((d) => {
                    const isSelected = workingDays.includes(d.key);
                    return (
                      <div 
                        key={d.key} 
                        onClick={() => toggleDay(d.key)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? "border-primary/40 bg-primary/5 shadow-2xs" 
                            : "border-slate-200 bg-white hover:bg-slate-50/80 opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {d.short}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{d.key}</span>
                            <span className={`text-[10px] font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                              {isSelected ? `${formatTo12Hour(startTime)} – ${formatTo12Hour(endTime)}` : "Closed"}
                            </span>
                          </div>
                        </div>
                        <Switch 
                          checked={isSelected} 
                          onCheckedChange={() => toggleDay(d.key)} 
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button 
                  onClick={handleSaveWorkingHours} 
                  disabled={isSavingHours} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-xs gap-2"
                >
                  {isSavingHours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save Operational Working Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Capacity Limits & Blackout Holidays (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Booking Capacity Limits Card */}
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sliders className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                    Intake & Booking Quotas
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Throttle maximum concurrent booking intake
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Daily Maximum Intake Limit
                  </Label>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                    {dailyLimit} Orders / day
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 text-base font-bold bg-white border-slate-200 shrink-0"
                    onClick={() => setDailyLimit(prev => Math.max(1, prev - 5))}
                  >
                    -5
                  </Button>
                  <Input 
                    type="number" 
                    min="1" 
                    value={dailyLimit} 
                    onChange={(e) => setDailyLimit(Math.max(1, parseInt(e.target.value) || 1))} 
                    className="h-10 text-center font-bold text-base bg-white border-slate-200 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 text-base font-bold bg-white border-slate-200 shrink-0"
                    onClick={() => setDailyLimit(prev => prev + 5)}
                  >
                    +5
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The portal will automatically close booking availability for any date that reaches this threshold.
                </p>
              </div>

              {/* Weekly Capacity Visual Box */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Weekly Estimated Capacity</span>
                  <span className="font-bold text-slate-900 font-mono">{weeklyLimit} Bookings</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(15, (dailyLimit / 50) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Based on {workingDays.length} active working day{workingDays.length !== 1 ? 's' : ''} × {dailyLimit} slots/day.
                </p>
              </div>

              <Button 
                onClick={handleSaveLimits} 
                disabled={isSavingLimits} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 shadow-xs"
              >
                {isSavingLimits ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Save Booking Limits
              </Button>
            </CardContent>
          </Card>

          {/* Blockout Dates / Holidays Card */}
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <CalendarX className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                      Scheduled Blackout Dates
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Block booking intake on holidays or maintenance
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-xs font-semibold">
                  {blockedDates.length} Blocked
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Add Blackout Date Form */}
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Add Blackout Date
                </span>
                
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="e.g., Diwali / Equipment Maintenance" 
                    value={newBlockName} 
                    onChange={(e) => setNewBlockName(e.target.value)} 
                    className="h-9 text-xs bg-white border-slate-200"
                  />
                  
                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1">
                    {holidaySuggestions.slice(0, 4).map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewBlockName(s)}
                        className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Input 
                      type="date" 
                      className="flex-1 h-9 text-xs bg-white border-slate-200 font-mono" 
                      value={newBlockDate} 
                      onChange={(e) => setNewBlockDate(e.target.value)} 
                    />
                    <Button 
                      onClick={handleAddBlockDate} 
                      disabled={isSavingHours || !newBlockDate || !newBlockName} 
                      className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Blocked Dates List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Upcoming Blockout Dates ({blockedDates.length})
                </span>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {blockedDates.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <CalendarIcon className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-600">No blackout dates added</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Lab is available on all regular working days
                      </p>
                    </div>
                  ) : (
                    blockedDates.map((h) => (
                      <div 
                        key={h.date} 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                            <CalendarX className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{h.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">
                              {formatDateDisplay(h.date)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleRemoveBlockDate(h.date)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                          title="Remove blackout date"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
