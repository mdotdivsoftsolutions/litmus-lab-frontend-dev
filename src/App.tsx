import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy-loaded Pages for Route Code-Splitting & Minimal Initial Bundle Size
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));

// Lazy-loaded Lab Pages
const LabDashboard = lazy(() => import("./pages/lab/LabDashboard"));
const LabBookings = lazy(() => import("./pages/lab/LabBookings"));
const UploadResultsPage = lazy(() => import("./pages/lab/UploadResultsPage"));
const LabTestsPage = lazy(() => import("./pages/lab/LabTestsPage"));
const LabPackagesPage = lazy(() => import("./pages/lab/LabPackagesPage"));
const LabSchedulePage = lazy(() => import("./pages/lab/LabSchedulePage"));
const LabProfilePage = lazy(() => import("./pages/lab/LabProfilePage"));
const LabBookingDetails = lazy(() => import("./pages/lab/LabBookingDetails"));
const LabTestFormPage = lazy(() => import("./pages/lab/LabTestFormPage"));
const LabPackageFormPage = lazy(() => import("./pages/lab/LabPackageFormPage"));
const LabEmployeesPage = lazy(() => import("./pages/lab/LabEmployeesPage"));

// Optimized QueryClient to prevent excessive refetching and CPU thrashing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="flex min-h-[60vh] w-full items-center justify-center p-6"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-medium text-slate-500">Loading portal...</span>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

