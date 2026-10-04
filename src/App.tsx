import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import ReferrerPanel from "./pages/ReferrerPanel";
import AdminPanel from "./pages/AdminPanel";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/referrer" element={<ProtectedRoute><ReferrerPanel /></ProtectedRoute>} />
            <Route path="/mgmt" element={<AdminLogin />} />
            <Route path="/mgmt-panel" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
