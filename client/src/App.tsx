import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import CertifierDashboard from "@/pages/certifier-dashboard";
import LawyerDashboard from "@/pages/lawyer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import CoursePage from "@/pages/course-page";
import DocumentSign from "@/pages/document-sign";
import AvisoLegal from "@/pages/aviso-legal";
import ServiciosEmpresariales from "@/pages/servicios-empresariales";
import NotarizeOnline from "@/pages/notarize-online";
import CertificacionPorVideo from "@/pages/certificacion-por-video";
import UneteAlEquipo from "@/pages/unete-al-equipo";
import ConversorPresencialOnline from "@/pages/conversor-presencial-online";
import TemplateAdminPage from "@/pages/template-admin";
import VerificarDocumento from "@/pages/verificar-documento";
import DocumentVerificationGame from "@/pages/document-verification-game";
import VideocallInterfaceDemo from "@/pages/videocall-interface-demo";
import CursoCertificador from "@/pages/curso-certificador";
import VecinosExpress from "@/pages/vecinos-express";
import PartnerApplications from "@/pages/admin/partner-applications";
import ServiceSelectionPage from "@/pages/service-selection";
import RonVideocall from "@/pages/ron-videocall";
import VideoConsultation from "@/pages/video-consultation";
import PurchaseCode from "@/pages/purchase-code";

// Document pages
import DocumentCategoriesPage from "@/pages/document-categories";
import DocumentTemplatesPage from "@/pages/document-templates";
import DocumentFormPage from "@/pages/document-form";
import DocumentViewPage from "@/pages/document-view";
import DocumentsPage from "@/pages/documents";

// Partner pages
import PartnersPublicPage from "@/pages/partners/public-page";
import PartnerRegistrationForm from "@/pages/partners/registration-form";
import PartnerLogin from "@/pages/partners/partner-login";
import PosIntegrationPage from "@/pages/partners/pos-integration";
import AndroidSdkTest from "@/pages/partners/android-sdk-test";

// Admin pages
import PosManagementPage from "@/pages/admin/pos-management";
import ApiIntegrationsPage from "@/pages/admin/api-integrations";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminDocumentsPage from "@/pages/admin/documents";
import AdminCertifiersPage from "@/pages/admin/certifiers";
import AdminAIStrategyPage from "@/pages/admin/ai-strategy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* User routes */}
      <ProtectedRoute 
        path="/user-dashboard" 
        component={UserDashboard} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <ProtectedRoute 
        path="/document-sign/:id" 
        component={DocumentSign} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      
      {/* Document routes */}
      <Route path="/document-categories" component={DocumentCategoriesPage} />
      <Route path="/document-templates/:categoryId" component={DocumentTemplatesPage} />
      <ProtectedRoute 
        path="/document-form/:templateId" 
        component={DocumentFormPage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <ProtectedRoute 
        path="/documents" 
        component={DocumentsPage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <ProtectedRoute 
        path="/documents/:documentId" 
        component={DocumentViewPage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      
      {/* Certifier routes */}
      <ProtectedRoute 
        path="/certifier-dashboard" 
        component={CertifierDashboard} 
        allowedRoles={["certifier", "admin"]} 
      />
      
      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin-dashboard" 
        component={AdminDashboard} 
        allowedRoles={["admin"]} 
      />
      <ProtectedRoute 
        path="/template-admin" 
        component={TemplateAdminPage} 
        allowedRoles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/partner-applications" 
        component={PartnerApplications}
        allowedRoles={["admin", "supervisor"]} 
      />
      
      {/* Course routes */}
      <ProtectedRoute 
        path="/courses/:id" 
        component={CoursePage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      
      {/* Public pages */}
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/servicios-empresariales" component={ServiciosEmpresariales} />
      <Route path="/notarize-online" component={NotarizeOnline} />
      <Route path="/certificacion-por-video" component={CertificacionPorVideo} />
      <Route path="/unete-al-equipo" component={UneteAlEquipo} />
      <Route path="/conversor-presencial-online" component={ConversorPresencialOnline} />
      <Route path="/verificar-documento" component={VerificarDocumento} />
      <Route path="/verificar-documento/:code" component={VerificarDocumento} />
      <Route path="/verification-game" component={DocumentVerificationGame} />
      <Route path="/curso-certificador" component={CursoCertificador} />
      <Route path="/vecinos-express" component={VecinosExpress} />
      <Route path="/service-selection" component={ServiceSelectionPage} />
      
      {/* Partner pages */}
      <Route path="/partners/public-page" component={PartnersPublicPage} />
      <Route path="/partners/registration-form" component={PartnerRegistrationForm} />
      <Route path="/partners/partner-login" component={PartnerLogin} />
      <Route path="/partners/android-sdk-test" component={AndroidSdkTest} />
      <ProtectedRoute 
        path="/partners/pos-integration" 
        component={PosIntegrationPage} 
        allowedRoles={["partner"]} 
      />
      
      {/* Admin POS Management */}
      <ProtectedRoute 
        path="/admin/pos-management" 
        component={PosManagementPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin API Integrations */}
      <ProtectedRoute 
        path="/admin/api-integrations" 
        component={ApiIntegrationsPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin Master Dashboard */}
      <ProtectedRoute 
        path="/admin/dashboard" 
        component={AdminDashboardPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin Documents Management */}
      <ProtectedRoute 
        path="/admin/documents" 
        component={AdminDocumentsPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin Certifiers Management */}
      <ProtectedRoute 
        path="/admin/certifiers" 
        component={AdminCertifiersPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin AI Strategy */}
      <ProtectedRoute 
        path="/admin/ai-strategy" 
        component={AdminAIStrategyPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Videocall demo */}
      <ProtectedRoute 
        path="/videocall-interface-demo" 
        component={VideocallInterfaceDemo} 
        allowedRoles={["certifier", "admin"]} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
