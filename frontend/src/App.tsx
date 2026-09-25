import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Compare from "./pages/Compare";
import Calculator from "./pages/Calculator";
import Dashboard from "./pages/Dashboard";
import LenderDashboard from "./pages/LenderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OnboardBank from "./pages/OnboardBank";
import Login from "./pages/Login";
import Learn from "./pages/Learn";
import ForLenders from "./pages/ForLenders";
import ApplicationDetails from "./pages/ApplicationDetails";
import PreApprovalCertificate from "./pages/PreApprovalCertificate";
import LenderOnboarding from "./pages/LenderOnboarding";
import LenderProfile from "./pages/LenderProfile";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CbnCompliance from "./pages/CbnCompliance";
import NotFound from "./pages/NotFound";
import RegistryIndex from "./pages/RegistryIndex";
import SurveyorPortal from "./pages/SurveyorPortal";
import LandownerVault from "./pages/LandownerVault";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lender" element={<LenderDashboard />} />
                <Route path="/lender/dashboard" element={<LenderDashboard />} />
                <Route path="/lender/:id" element={<LenderProfile />} />
                <Route path="/lender-onboarding" element={<LenderOnboarding />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/onboard-bank" element={<OnboardBank />} />
                <Route path="/login" element={<Login />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/for-lenders" element={<ForLenders />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/application/:id" element={<ApplicationDetails />} />
                <Route path="/application/:id/certificate" element={<PreApprovalCertificate />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/compliance" element={<CbnCompliance />} />
                {/* Registry Routes */}
                <Route path="/registry" element={<RegistryIndex />} />
                <Route path="/registry/surveyor" element={<SurveyorPortal />} />
                <Route path="/registry/vault" element={<LandownerVault />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationsProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
