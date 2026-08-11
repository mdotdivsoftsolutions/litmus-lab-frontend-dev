import { useState, useRef } from "react";
import { Users, Plus, Upload, Loader2, User, Trash2, Mail, Edit } from "lucide-react";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

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
      toast.success("Employee created! Onboarding email has been sent.");
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
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!firstName || !email || !phone) {
      toast.error("First Name, Email, and Phone are required");
      return;
    }
    
    const payload = {
      firstName,
      lastName,
      email,
      phone,
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employees</h1>
          <p className="text-slate-500 mt-1">Manage your laboratory staff and their access.</p>
        </div>
        <Button onClick={openAddDrawer} className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No employees yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Add your staff members to give them access to the laboratory portal.
          </p>
          <Button variant="outline" onClick={openAddDrawer} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Employee
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp: any) => (
            <div 
              key={emp._id} 
              className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => openEditDrawer(emp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={emp.profilePic} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {emp.firstName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{emp.firstName} {emp.lastName}</h4>
                    <p className="text-xs text-slate-500 capitalize">{emp.role.replace(/_/g, " ").toLowerCase()}</p>
                  </div>
                </div>
                <Badge variant={emp.isActive ? "default" : "secondary"}>
                  {emp.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span className="truncate max-w-[150px]">{emp.email}</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-primary h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDrawer(emp);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmployeeToDelete(emp._id);
                    }}
                    disabled={deleteMutation.isPending && deleteMutation.variables === emp._id}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === emp._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog 
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        title="Remove Employee"
        description="Are you sure you want to remove this employee? Their access to the lab portal will be revoked."
        onConfirm={() => {
          if (employeeToDelete) {
            deleteMutation.mutate(employeeToDelete);
          }
        }}
        confirmText="Remove"
        variant="destructive"
      />

      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedEmployee ? "Edit Employee Details" : "Add New Employee"}</SheetTitle>
            <SheetDescription>
              {selectedEmployee 
                ? "Update the details and permissions for this lab employee." 
                : "Create a new employee profile to grant them access to this laboratory portal. An email with a generated password will be sent to them."
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-5 py-6">
            <div className="flex flex-col items-center gap-3 mb-2">
              <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                <AvatarImage src={profilePic} />
                <AvatarFallback className="bg-slate-100">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <User className="h-8 w-8 text-slate-400" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-3 w-3" />
                  {isUploading ? "Uploading..." : "Upload Profile Photo"}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName" 
                placeholder="e.g. John" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="e.g. Doe" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={!!selectedEmployee} // Emails shouldn't typically be edited
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+91 98765 43210" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="LAB_EMPLOYEE">Lab Employee</option>
                <option value="LAB_ADMIN">Lab Admin</option>
              </select>
            </div>
          </div>
          
          <SheetFooter className="mt-4 pb-6">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : selectedEmployee ? "Update Employee" : "Save Employee"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
