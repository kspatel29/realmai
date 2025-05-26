
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import VideoDubbing from "./pages/VideoDubbing";
import Subtitles from "./pages/Subtitles";
import ClipsGenerator from "./pages/ClipsGenerator";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import History from "./pages/History";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Logout component that handles the logout logic
const Logout = () => {
  const { logout } = useAuth();
  
  // Call logout and redirect to home
  logout();
  return <Navigate to="/" />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }>
                <Route index element={<Dashboard />} />
                <Route path="video-dubbing" element={<VideoDubbing />} />
                <Route path="subtitles" element={<Subtitles />} />
                <Route path="clips" element={<ClipsGenerator />} />
                <Route path="history" element={<History />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="billing" element={<Billing />} />
                <Route path="support" element={<Support />} />
                <Route path="logout" element={<Logout />} />
              </Route>
              
              {/* Redirect /settings to /dashboard/settings */}
              <Route path="/settings" element={
                <RequireAuth>
                  <Navigate to="/dashboard/settings" replace />
                </RequireAuth>
              } />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
