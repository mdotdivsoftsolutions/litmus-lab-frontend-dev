import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { labApi } from "@/lib/api/lab";

const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
      toast.success("Working hours updated successfully");
      queryClient.invalidateQueries({ queryKey: ["myLabProfile"] });
    },
    onError: () => {
      toast.error("Failed to update working hours");
    },
  });

  const { mutate: updateLimits, isPending: isSavingLimits } = useMutation({
    mutationFn: labApi.updateMyLabProfile,
    onSuccess: () => {
      toast.success("Limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["myLabProfile"] });
    },
    onError: () => {
      toast.error("Failed to update limits");
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
    if (!newBlockDate || !newBlockName) return;
    const newBlockedDates = [...blockedDates, { date: newBlockDate, name: newBlockName }];
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
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const weeklyLimit = dailyLimit * workingDays.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Schedule Management</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Working Hours */}
        <Card className="border border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Working Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-medium">Start Time</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">End Time</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Working Days</Label>
              <div className="space-y-2">
                {fullDays.map((d) => (
                  <div key={d} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-sm">{d}</span>
                    <Switch checked={workingDays.includes(d)} onCheckedChange={() => toggleDay(d)} />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveWorkingHours} disabled={isSavingHours} className="w-full bg-primary hover:bg-primary-deep">
              {isSavingHours ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Working Hours
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Booking Limits */}
          <Card className="border border-border shadow-sm">
            <CardHeader><CardTitle className="text-base">Booking Limits</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5"><Label className="text-sm font-medium">Daily Booking Limit</Label><Input type="number" min="1" value={dailyLimit} onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">Weekly Booking Limit (Auto-calculated)</Label><Input type="number" readOnly value={weeklyLimit} className="bg-slate-50 cursor-not-allowed" /></div>
              <Button onClick={handleSaveLimits} disabled={isSavingLimits} className="w-full bg-primary hover:bg-primary-deep" size="sm">
                {isSavingLimits ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Limits
              </Button>
            </CardContent>
          </Card>

          {/* Block Dates */}
          <Card className="border border-border shadow-sm">
            <CardHeader><CardTitle className="text-base">Block Dates / Holidays</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input type="text" placeholder="Holiday Name" value={newBlockName} onChange={(e) => setNewBlockName(e.target.value)} />
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} />
                  <Button onClick={handleAddBlockDate} disabled={isSavingHours || !newBlockDate || !newBlockName} variant="outline" size="sm">Add</Button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {blockedDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No blocked dates added yet.</p>
                ) : (
                  blockedDates.map(h => (
                    <div key={h.date} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 bg-muted/30">
                      <div><p className="text-sm font-medium">{h.name}</p><p className="text-xs text-muted-foreground">{h.date}</p></div>
                      <Button onClick={() => handleRemoveBlockDate(h.date)} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
