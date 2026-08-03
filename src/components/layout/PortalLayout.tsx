import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { SidebarNav } from "./SidebarNav";
import { TopNavbar } from "./TopNavbar";

interface PortalLayoutProps {
  portal: "user" | "admin" | "lab";
}

export function PortalLayout({ portal }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: userResponse } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getMe,
    retry: false,
  });

  const user = userResponse?.data;

  const handleLogout = async () => {
    try {
      await authApi.logout();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate(portal === "admin" ? "/admin/login" : "/laboratory/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <SidebarNav portal={portal} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} user={user} onLogoutClick={handleLogout} portal={portal} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
