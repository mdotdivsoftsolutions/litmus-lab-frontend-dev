import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import loginLabImg from "@/assets/login-lab.jpg";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: OTP, 3: Reset, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success("Reset link sent to your email!");
      setStep(2);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      setStep(3);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setStep(4);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate({ email });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    verifyOtpMutation.mutate({ email, otp });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    resetPasswordMutation.mutate({ email, otp, newPassword });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden bg-white border-r border-slate-100">
        <div className="relative z-10 px-10 pt-8 flex items-center gap-2.5">
          <Flame className="h-7 w-7 text-primary" />
          <div>
            <span className="text-lg font-bold text-secondary tracking-tight">litmus</span>
            <span className="block text-[9px] tracking-[0.2em] text-primary font-medium -mt-0.5 uppercase">Food Analytics</span>
          </div>
        </div>

        <div className="relative z-10 px-10 pt-12 pb-6">
          <h2 className="text-3xl font-light text-secondary/80 leading-snug">
            Account Recovery <br />
            <span className="text-primary font-semibold">Laboratory Portal</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm max-w-sm">
            Enter your email to receive an OTP and set up a new password to regain access to your dashboard.
          </p>
        </div>

        <div className="relative flex-1 mx-6 mb-6 rounded-2xl overflow-hidden shadow-sm">
          <img src={loginLabImg} alt="Food testing laboratory" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <Card className="w-full max-w-md shadow-lg border border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="items-center pb-2">
            <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {step === 1 && "We'll send you an OTP to verify your email address."}
              {step === 2 && "Enter the 6-digit OTP sent to your email."}
              {step === 3 && "Create a new strong password."}
              {step === 4 && "Your password has been successfully updated."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
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
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-deep text-primary-foreground shadow-md shadow-primary/20"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-foreground">One-Time Password</Label>
                  <Input 
                    id="otp" 
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="focus:ring-2 focus:ring-primary/15 focus:border-primary bg-background/50 tracking-widest text-center text-lg" 
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-deep text-primary-foreground shadow-md shadow-primary/20"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </Button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => forgotPasswordMutation.mutate({ email })}
                    className="text-xs font-medium text-primary hover:underline"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="focus:ring-2 focus:ring-primary/15 focus:border-primary bg-background/50" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="focus:ring-2 focus:ring-primary/15 focus:border-primary bg-background/50" 
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-deep text-primary-foreground shadow-md shadow-primary/20"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Updating..." : "Set New Password"}
                </Button>
              </form>
            )}

            {step === 4 && (
              <div className="py-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Password Reset Complete</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You can now log in with your new password.
                </p>
                <Link to="/laboratory/login">
                  <Button className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}
            
            {step !== 4 && (
              <div className="mt-6 text-center">
                <Link to="/laboratory/login" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
