import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, Save } from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { toast } from "sonner";

export default function LabProfilePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({
    labName: "",
    contactEmail: "",
    contactPhone: "",
    nablAccreditationNumber: "",
    dailyLimit: 0,
    isAutoBooking: false,
    location: {
      address: "",
      city: "",
      state: "",
      lat: "",
      lng: ""
    }
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["labProfile"],
    queryFn: labApi.getMyLabProfile,
  });

  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        ...formData,
        ...profileData.data,
        location: { ...formData.location, ...profileData.data.location }
      });
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => labApi.updateMyLabProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["labProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your laboratory's public profile and settings.</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-litmus-emerald hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="labName">Lab Name</Label>
                <Input id="labName" name="labName" value={formData.labName || ""} onChange={handleChange} className="bg-background/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" name="location.address" value={formData.location?.address || ""} onChange={handleChange} className="bg-background/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="location.city" value={formData.location?.city || ""} onChange={handleChange} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="location.state" value={formData.location?.state || ""} onChange={handleChange} className="bg-background/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" name="contactEmail" value={formData.contactEmail || ""} onChange={handleChange} className="bg-background/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base">Accreditation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="nablAccreditationNumber">NABL Registration Number</Label>
                <Input id="nablAccreditationNumber" name="nablAccreditationNumber" value={formData.nablAccreditationNumber || ""} onChange={handleChange} placeholder="e.g. TC-5678" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Upload NABL Certificate</Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Click to upload certificate</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base">Booking Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                <div>
                  <Label className="text-sm font-medium">Auto-Booking</Label>
                  <p className="text-xs text-muted-foreground">Automatically accept new bookings from customers</p>
                </div>
                {formData.isAutoBooking ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Enabled</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                <div>
                  <Label className="text-sm font-medium">Require Admin Approval</Label>
                  <p className="text-xs text-muted-foreground">Test reports must be approved by admin before sharing</p>
                </div>
                {formData.requiresAdminApprovalForReport ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Required</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Not Required</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Booking Limit</Label>
                <Input id="dailyLimit" name="dailyLimit" type="number" min="0" value={formData.dailyLimit || 0} onChange={handleChange} className="bg-background/50" />
                <p className="text-xs text-muted-foreground">Set to 0 for unlimited daily bookings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
