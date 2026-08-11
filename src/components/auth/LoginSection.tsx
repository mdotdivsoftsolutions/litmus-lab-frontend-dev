"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff, Flame, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";

interface LoginSectionProps {
  className?: string;
  showLogo?: boolean;
  defaultRole?: "user" | "admin" | "lab";
}

export function LoginSection({ className, showLogo = false, defaultRole }: LoginSectionProps) {
  const [role, setRole] = useState(defaultRole || "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const navigate = useNavigate();

  const roleRedirects: Record<string, string> = { 
    user: "/home", 
    admin: "/admin/dashboard", 
    lab: "/lab/dashboard" 
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      toast.success("Login successful");
      // Basic role validation logic (can be expanded)
      if (role === "admin" && data.data.user.role !== "ADMIN") {
         toast.error("Not authorized as Admin");
         return;
      }
      if (role === "lab" && !["LAB", "LAB_EMPLOYEE", "LAB_ADMIN"].includes(data.data.user.role)) {
         toast.error("Not authorized as Lab");
         return;
      }
      navigate(roleRedirects[role]);
    },
    onError: (error: any) => {
      if (error.response?.data?.message === "ACCOUNT_BLOCKED") {
        setShowBlockedModal(true);
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <>
      <Card className={cn("w-full max-w-md shadow-lg border border-border bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="items-center pb-2">
        {showLogo && (
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Litmus Logo" className="h-8 object-contain" />
          </Link>
        )}
        <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
        {!defaultRole && (
          <Tabs value={role} onValueChange={(value) => setRole(value as "user" | "admin" | "lab")} className="w-full mt-4">
            <TabsList className="w-full bg-muted/50 p-1">
              <TabsTrigger value="user" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">User</TabsTrigger>
              <TabsTrigger value="admin" className="flex-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all">Admin</TabsTrigger>
              <TabsTrigger value="lab" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Lab</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="focus:ring-2 focus:ring-primary/15 focus:border-primary bg-background/50" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pr-10 focus:ring-2 focus:ring-primary/15 focus:border-primary bg-background/50"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot Password?</Link>
            </div>
          </div>
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-deep text-primary-foreground shadow-md shadow-primary/20"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        {!defaultRole && (
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        )}
      </CardContent>
    </Card>

    <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl">Account Suspended</DialogTitle>
          <DialogDescription className="pt-2 text-base text-center">
            Your account is temporarily blocked. Please contact the administrator to resolve this issue and restore your access.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          <Button onClick={() => setShowBlockedModal(false)} className="w-full sm:w-auto px-8">
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
