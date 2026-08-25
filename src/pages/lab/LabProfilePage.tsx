import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, MapPin, Phone, Mail, Award, ShieldCheck, 
  Upload, Loader2, CheckCircle2, FileText, Check, 
  Settings2, Sliders, ExternalLink, Globe, Sparkles, AlertCircle, Building
} from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { uploadApi } from "@/lib/api/uploadApi";
import { toast } from "sonner";

export default function LabProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  const [formData, setFormData] = useState<any>({
    labName: "",
    contactEmail: "",
    contactPhone: "",
    nablAccreditationNumber: "",
    nablCertificateUrl: "",
    dailyLimit: 15,
    isAutoBooking: false,
    requiresAdminApprovalForReport: false,
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
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
        location: { ...formData.location, ...(profileData.data.location || {}) }
      });
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => labApi.updateMyLabProfile(data),
    onSuccess: () => {
      toast.success("Laboratory profile updated successfully!");
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

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCert(true);
      const res = await uploadApi.uploadFile(file);
      if (res?.success && res?.data?.url) {
        setFormData((prev: any) => ({
          ...prev,
          nablCertificateUrl: res.data.url
        }));
        toast.success("NABL Certificate uploaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload certificate document");
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleSave = () => {
    if (!formData.labName?.trim()) {
      toast.error("Laboratory Name is required");
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading facility profile...</p>
        </div>
      </div>
    );
  }

  const facilityCity = formData.location?.city || "City";
  const facilityState = formData.location?.state || "State";
  const hasCert = !!formData.nablCertificateUrl;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground font-nunito tracking-tight">
              Laboratory Profile & Facility Settings
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              Verified Facility
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your laboratory's public profile, accreditation certificates, and automated booking rules.
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending} 
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Facility Status</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-base font-bold text-foreground truncate">
                {formData.labName || "Active Lab"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Live on Litmus Network</p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Accreditation</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground font-mono truncate">
              {formData.nablAccreditationNumber || "Pending NABL"}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {hasCert ? "Certificate Verified" : "Certificate Awaiting"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Auto Intake</span>
            <Settings2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {formData.isAutoBooking ? "Instant Auto-Accept" : "Manual Review"}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {formData.isAutoBooking ? "Orders confirmed instantly" : "Requires staff confirmation"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-border/80 shadow-2xs rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Location</span>
            <MapPin className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground truncate">
              {facilityCity}, {facilityState}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Operational Territory</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Facility Identification & Contacts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Information Card */}
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                    Facility Identification & Location
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Official laboratory registration name and physical operating address
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="labName" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Laboratory Official Name *
                </Label>
                <Input 
                  id="labName" 
                  name="labName" 
                  placeholder="e.g. Apex Diagnostics & Research Centre" 
                  value={formData.labName || ""} 
                  onChange={handleChange} 
                  className="h-10 text-xs font-semibold bg-white border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Street Address
                </Label>
                <div className="relative">
                  <Input 
                    id="address" 
                    name="location.address" 
                    placeholder="e.g. 142 Medical District, Sector 4" 
                    value={formData.location?.address || ""} 
                    onChange={handleChange} 
                    className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-primary pr-8" 
                  />
                  <MapPin className="h-4 w-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    City
                  </Label>
                  <Input 
                    id="city" 
                    name="location.city" 
                    placeholder="e.g. Mumbai" 
                    value={formData.location?.city || ""} 
                    onChange={handleChange} 
                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    State / Region
                  </Label>
                  <Input 
                    id="state" 
                    name="location.state" 
                    placeholder="e.g. Maharashtra" 
                    value={formData.location?.state || ""} 
                    onChange={handleChange} 
                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary" 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Public Contact & Patient Communication
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Support Contact Phone
                    </Label>
                    <div className="relative">
                      <Input 
                        id="contactPhone" 
                        name="contactPhone" 
                        placeholder="+91 98765 43210" 
                        value={formData.contactPhone || ""} 
                        onChange={handleChange} 
                        className="h-9 text-xs font-mono bg-white border-slate-200 focus-visible:ring-primary pr-8" 
                      />
                      <Phone className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Official Contact Email
                    </Label>
                    <div className="relative">
                      <Input 
                        id="contactEmail" 
                        name="contactEmail" 
                        placeholder="lab@domain.com" 
                        value={formData.contactEmail || ""} 
                        onChange={handleChange} 
                        className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary pr-8" 
                      />
                      <Mail className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Accreditation & Booking Policies (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* NABL Accreditation Card */}
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Award className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                      NABL Accreditation & Standards
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Diagnostic compliance certifications
                    </CardDescription>
                  </div>
                </div>
                {hasCert && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    Certified
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nablAccreditationNumber" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  NABL Registration / License Number
                </Label>
                <div className="relative">
                  <Input 
                    id="nablAccreditationNumber" 
                    name="nablAccreditationNumber" 
                    value={formData.nablAccreditationNumber || ""} 
                    onChange={handleChange} 
                    placeholder="e.g. TC-5678 / MC-1290" 
                    className="h-9 text-xs font-mono font-bold bg-white border-slate-200 focus-visible:ring-primary pr-8" 
                  />
                  <Award className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Certificate Upload / Preview Box */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official NABL Certificate Document
                </Label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleCertUpload} 
                  accept=".pdf,image/*" 
                  className="hidden" 
                />

                {hasCert ? (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">NABL Certificate Document</p>
                        <a 
                          href={formData.nablCertificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          View Document <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCert}
                    >
                      {isUploadingCert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Replace"}
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      {isUploadingCert ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800">Click to upload NABL Certificate</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PDF, JPG, or PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Operational Workflow & Booking Settings Card */}
          <Card className="border border-border/90 shadow-2xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Settings2 className="h-5 w-5 text-indigo-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 font-nunito">
                    Workflow & Automation Policies
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Order confirmation & report authorization rules
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-bold text-slate-900 cursor-pointer" onClick={() => handleSwitchChange('isAutoBooking', !formData.isAutoBooking)}>
                    Auto-Accept Bookings
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically confirm incoming test orders without manual queue review
                  </p>
                </div>
                <Switch 
                  checked={!!formData.isAutoBooking} 
                  onCheckedChange={(c) => handleSwitchChange('isAutoBooking', c)} 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-bold text-slate-900 cursor-pointer" onClick={() => handleSwitchChange('requiresAdminApprovalForReport', !formData.requiresAdminApprovalForReport)}>
                    Require Admin Report Sign-Off
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Diagnostic reports must be reviewed by Lab Admin before customer release
                  </p>
                </div>
                <Switch 
                  checked={!!formData.requiresAdminApprovalForReport} 
                  onCheckedChange={(c) => handleSwitchChange('requiresAdminApprovalForReport', c)} 
                />
              </div>

              {/* Bottom Quick Save Button */}
              <div className="pt-2">
                <Button 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-xs gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save Profile & Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
