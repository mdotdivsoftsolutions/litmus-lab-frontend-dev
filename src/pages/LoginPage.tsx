import { LoginSection } from "@/components/auth/LoginSection";
import { Flame } from "lucide-react";
import loginLabImg from "@/assets/login-lab.jpg";

interface LoginPageProps {
  role?: "admin" | "lab";
}

export default function LoginPage({ role }: LoginPageProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — clean light image panel matching Litmus brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden bg-white border-r border-slate-100">
        {/* Top branding */}
        <div className="relative z-10 px-10 pt-8 flex items-center">
          <img src="/logo.webp" alt="Litmus Logo" className="h-9 w-auto object-contain" />
        </div>

        {/* Headline */}
        <div className="relative z-10 px-10 pt-12 pb-6">
          <h2 className="text-3xl font-light text-secondary/80 leading-snug">
            {role === "admin" ? "Internal Administrator Portal" : role === "lab" ? "Laboratory Partner Portal" : "Safer, Smarter, and Compliant"}
            <br />
            <span className="text-primary font-semibold">{role ? "Access Management" : "Food Solutions"}</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm max-w-sm">
            Please enter your credentials to access the 
            {role === "admin" ? " specialized management tools." : role === "lab" ? " testing and reports dashboard." : " Litmus food safety platform."}
          </p>
        </div>

        {/* Image fills remaining space */}
        <div className="relative flex-1 mx-6 mb-6 rounded-2xl overflow-hidden shadow-sm">
          <img src={loginLabImg} alt="Food testing laboratory" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 relative">
        <LoginSection showLogo={!role} defaultRole={role} />
        
        {/* Copyright */}
        <div className="absolute bottom-6 right-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Litmus. All rights reserved.
        </div>
      </div>
    </div>
  );
}
