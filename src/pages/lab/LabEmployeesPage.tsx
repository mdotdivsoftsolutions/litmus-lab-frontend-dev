import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employees</h1>
          <p className="text-slate-500 mt-1">Manage your laboratory staff and their access.</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No employees yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          Add your staff members to give them access to the laboratory portal.
        </p>
        <Button variant="outline" onClick={() => setIsSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Employee
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Employee</SheetTitle>
            <SheetDescription>
              Create a new employee profile to grant them access to this laboratory portal.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="e.g. John" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="e.g. Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="admin">Lab Admin</option>
                <option value="staff">Lab Staff</option>
                <option value="technician">Technician</option>
              </select>
            </div>
          </div>
          
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsSheetOpen(false)}>Save Employee</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
