import { useState, useRef } from "react";
import { 
  Users, Plus, Upload, Loader2, User, Trash2, Mail, Edit, 
  Phone, ShieldCheck, UserPlus, Camera, X, CheckCircle2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { labEmployeeApi } from "@/lib/api/labEmployee";
import { uploadApi } from "@/lib/api/uploadApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LabEmployeesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("LAB_EMPLOYEE");
  const [profilePic, setProfilePic] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Employees
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ["labEmployees"],
    queryFn: labEmployeeApi.getEmployees,
  });

  const employees = employeesResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: labEmployeeApi.createEmployee,
    onSuccess: () => {
      toast.success("Employee created! Onboarding email with credentials sent.");
      queryClient.invalidateQueries({ queryKey: ["labEmployees"] });
      resetForm();
      setIsSheetOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create employee");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => labEmployeeApi.updateEmployee(selectedEmployee._id, data),
    onSuccess: () => {
      toast.success("Employee updated successfully");
      queryClient.invalidateQueries({ queryKey: ["labEmployees"] });
      resetForm();
      setIsSheetOpen(false);
      setSelectedEmployee(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update employee");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: labEmployeeApi.deleteEmployee,
    onSuccess: () => {
      toast.success("Employee removed successfully");
      queryClient.invalidateQueries({ queryKey: ["labEmployees"] });
      setEmployeeToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove employee");
      setEmployeeToDelete(null);
    },
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("LAB_EMPLOYEE");
    setProfilePic("");
    setSelectedEmployee(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddDrawer = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const openEditDrawer = (emp: any) => {
    setSelectedEmployee(emp);
    setFirstName(emp.firstName || "");
    setLastName(emp.lastName || "");
    setEmail(emp.email || "");
    setPhone(emp.phone || "");
    setRole(emp.role || "LAB_EMPLOYEE");
    setProfilePic(emp.profilePic || "");
    setIsSheetOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadFile(file);
      if (res?.success && res?.data?.url) {
        setProfilePic(res.data.url);
        toast.success("Profile photo uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      toast.error("First Name, Email, and Phone Number are required");
      return;
    }
    
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      profilePic,
    };
    
    if (selectedEmployee) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-nunito">
              Team & Staff Management
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              {employees.length} Staff Member{employees.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your laboratory employees, assign roles, and control access permissions.
          </p>
        </div>

        <Button 
          onClick={openAddDrawer} 
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading employee directory...</p>
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1 font-nunito">No employees added yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            Add your laboratory technicians, pathologists, and administrators to grant them access to this portal.
          </p>
          <Button onClick={openAddDrawer} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs">
            <UserPlus className="h-4 w-4" />
            Add Your First Employee
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp: any) => (
            <div 
              key={emp._id} 
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
              onClick={() => openEditDrawer(emp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-11 w-11 border border-slate-200 shrink-0">
                    <AvatarImage src={emp.profilePic} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {emp.firstName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors truncate">
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium capitalize">
                        {emp.role === "LAB_ADMIN" ? "Lab Admin" : "Lab Technician"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={emp.isActive !== false 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold" 
                    : "bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold"
                  }
                >
                  {emp.isActive !== false ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0 pr-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-600">{emp.email}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-primary hover:bg-primary/10 h-7 w-7 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDrawer(emp);
                    }}
                    title="Edit profile"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:bg-destructive/10 hover:text-destructive h-7 w-7 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmployeeToDelete(emp._id);
                    }}
                    disabled={deleteMutation.isPending && deleteMutation.variables === emp._id}
                    title="Remove employee"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === emp._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        title="Revoke Staff Access"
        description="Are you sure you want to remove this employee? Their login access to this laboratory workspace will be permanently revoked."
        onConfirm={() => {
          if (employeeToDelete) {
            deleteMutation.mutate(employeeToDelete);
          }
        }}
        confirmText="Revoke Access"
        variant="destructive"
      />

      {/* Clean Employee Profile Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl overflow-hidden font-sans">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">
                {selectedEmployee ? <User className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 font-nunito tracking-tight">
                  {selectedEmployee ? "Edit Employee Profile" : "Add New Employee"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedEmployee 
                    ? "Update employee role, contact details, and workspace permissions." 
                    : "Create a staff profile. An automated onboarding email with login credentials will be sent."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Body — Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Profile Photo Row */}
            <div className="flex items-center gap-4 pb-2 border-b border-slate-100">
              <div className="relative group shrink-0">
                <Avatar className="h-16 w-16 border border-slate-200 shadow-2xs">
                  <AvatarImage src={profilePic} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : firstName ? (
                      firstName[0]?.toUpperCase()
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </AvatarFallback>
                </Avatar>

                {profilePic && (
                  <button
                    type="button"
                    onClick={() => setProfilePic("")}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-xs"
                    title="Remove photo"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-3.5 w-3.5 text-primary" />
                  {isUploading ? "Uploading..." : profilePic ? "Change Photo" : "Upload Profile Photo"}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-1">
                  PNG, JPG or WebP up to 5MB.
                </p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="firstName" 
                    placeholder="e.g. John" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
                    Last Name
                  </Label>
                  <Input 
                    id="lastName" 
                    placeholder="e.g. Doe" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Email Address (Login Username) <span className="text-rose-500">*</span></span>
                  {selectedEmployee && <span className="text-[10px] text-muted-foreground font-normal">Read-only</span>}
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={!!selectedEmployee}
                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-primary pr-8"
                  />
                  <Mail className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Credentials and login access will be sent to this email address.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="h-9 text-xs font-mono bg-white border-slate-200 focus-visible:ring-primary pr-8"
                  />
                  <Phone className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="role" className="text-xs font-bold text-slate-700">
                  Workspace Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="h-9 bg-white text-xs font-semibold border-slate-200">
                    <SelectValue placeholder="Select Staff Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAB_EMPLOYEE" className="text-xs">
                      <span className="font-bold text-slate-900">Lab Technician / Staff</span>
                      <span className="text-[11px] text-muted-foreground block">
                        Sample processing, testing entries, report uploads
                      </span>
                    </SelectItem>
                    <SelectItem value="LAB_ADMIN" className="text-xs">
                      <span className="font-bold text-slate-900">Laboratory Administrator</span>
                      <span className="text-[11px] text-muted-foreground block">
                        Full management access & schedule configurations
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Security info note */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5 mt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {role === "LAB_ADMIN" 
                    ? "Administrator privileges grant full access to schedule management, packages, tests, and staff profiles." 
                    : "Technicians can manage assigned sample testing, update lifecycle phases, and upload analytical reports."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={() => setIsSheetOpen(false)}
              className="text-xs border-slate-200 text-slate-600 bg-white hover:bg-slate-100 h-9"
            >
              Cancel
            </Button>

            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-xs px-5"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {selectedEmployee ? "Update Employee Profile" : "Save & Send Invitation"}
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
