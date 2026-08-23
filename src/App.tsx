import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalLayout } from "@/components/layout/PortalLayout";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lab Pages
import LabDashboard from "./pages/lab/LabDashboard";
import LabBookings from "./pages/lab/LabBookings";
import UploadResultsPage from "./pages/lab/UploadResultsPage";
import LabTestsPage from "./pages/lab/LabTestsPage";
import LabPackagesPage from "./pages/lab/LabPackagesPage";
import LabSchedulePage from "./pages/lab/LabSchedulePage";
import LabProfilePage from "./pages/lab/LabProfilePage";
import LabBookingDetails from "./pages/lab/LabBookingDetails";
import LabTestFormPage from "./pages/lab/LabTestFormPage";
import LabPackageFormPage from "./pages/lab/LabPackageFormPage";
import LabEmployeesPage from "./pages/lab/LabEmployeesPage";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Routes>
            {/* Public Auth */}
            <Route path="/laboratory/login" element={<LoginPage role="lab" />} />
            <Route path="/lab/login" element={<LoginPage role="lab" />} />
            <Route path="/login" element={<LoginPage role="lab" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Base route redirect */}
            <Route path="/" element={<Navigate to="/lab/dashboard" replace />} />

            {/* Lab Portal */}
            <Route path="/lab" element={<ProtectedRoute allowedRoles={["LAB", "LAB_EMPLOYEE", "LAB_ADMIN"]} />}>
              <Route element={<PortalLayout portal="lab" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<LabDashboard />} />
                <Route path="bookings" element={<LabBookings />} />
                <Route path="bookings/:id" element={<LabBookingDetails />} />
                <Route path="bookings/:id/upload" element={<UploadResultsPage />} />
                <Route path="upload" element={<UploadResultsPage />} />
                <Route path="tests" element={<LabTestsPage />} />
                <Route path="tests/new" element={<LabTestFormPage />} />
                <Route path="tests/edit/:id" element={<LabTestFormPage />} />
                <Route path="packages" element={<LabPackagesPage />} />
                <Route path="packages/new" element={<LabPackageFormPage />} />
                <Route path="packages/edit/:id" element={<LabPackageFormPage />} />
                <Route path="schedule" element={<LabSchedulePage />} />
                <Route path="employees" element={<LabEmployeesPage />} />
                <Route path="profile" element={<LabProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
