import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import OnboardingPopup from "@/components/onboarding/OnboardingPopup";
import HelpButton from "@/components/onboarding/HelpButton";
import { MicroInteractionProvider } from "@/hooks/use-micro-interactions";
import { MicroInteractionDisplay } from "@/components/micro-interactions/MicroInteractionDisplay";
import { ProtectedRoute } from "./lib/protected-route";
import { webSocketService } from "./lib/websocket";
import { useEffect } from "react";
import { WebSocketDebugger } from "@/components/utils/WebSocketDebugger";
import { Loader2 } from "lucide-react";

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
import QuienesSomosPage from "@/pages/quienes-somos";
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
import MicroInteractionsDemo from "@/pages/micro-interactions-demo";
import ShareAchievementPage from "@/pages/share-achievement";
import RonLoginPage from "@/pages/ron-login";
import RonPlatform from "@/pages/ron-platform";
import RonSession from "@/pages/ron-session";
import AyudaLegal from "@/pages/ayuda-legal";
import IntegracionesDemo from "@/pages/integraciones-demo";

// Document pages
import DocumentCategoriesPage from "@/pages/document-categories";
import DocumentTemplatesPage from "@/pages/document-templates";
import DocumentFormPage from "@/pages/document-form";
import DocumentViewPage from "@/pages/document-view";
import DocumentsPage from "@/pages/documents";
import DocumentProcessor from "@/pages/document-processor";

// Partner pages
import PartnersPublicPage from "@/pages/partners/public-page";
import PartnerRegistrationForm from "@/pages/partners/registration-form";
import PartnerLogin from "@/pages/partners/partner-login";
import PosIntegrationPage from "@/pages/partners/pos-integration";
import AndroidSdkTest from "@/pages/partners/android-sdk-test";
import PasswordGenerator from "@/pages/partners/password-generator";
import WebappLogin from "@/pages/partners/webapp-login";
import WebAppPOS from "@/pages/partners/webapp-pos";

// Admin pages
import PosManagementPage from "@/pages/admin/pos-management";
import ApiIntegrationsPage from "@/pages/admin/api-integrations";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminDocumentsPage from "@/pages/admin/documents";
import AdminCertifiersPage from "@/pages/admin/certifiers";
import AdminAIStrategyPage from "@/pages/admin/ai-strategy";
import TestDocumentGenerator from "@/pages/admin/test-document-generator";
import DocumentTemplatesManager from "@/pages/admin/document-templates-manager";

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
      <Route path="/document-sign/:id" component={DocumentSign} />
      
      {/* Document routes */}
      <Route path="/document-categories" component={DocumentCategoriesPage} />
      <Route path="/document-templates/:categoryId" component={DocumentTemplatesPage} />
      <Route path="/document-form/:templateId" component={DocumentFormPage} />
      <ProtectedRoute 
        path="/documents" 
        component={DocumentsPage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <Route path="/documents/:documentId" component={DocumentViewPage} />
      <ProtectedRoute 
        path="/document-processor" 
        component={DocumentProcessor} 
        allowedRoles={["user", "certifier", "admin", "partner"]} 
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
      <Route path="/quienes-somos" component={QuienesSomosPage} />
      
      {/* Partner pages */}
      <Route path="/partners/public-page" component={PartnersPublicPage} />
      <Route path="/partners/registration-form" component={PartnerRegistrationForm} />
      <Route path="/partners/partner-login" component={PartnerLogin} />
      <Route path="/partners/android-sdk-test" component={AndroidSdkTest} />
      <Route path="/partners/password-generator" component={PasswordGenerator} />
      <Route path="/partners/webapp-login" component={WebappLogin} />
      <Route path="/partners/webapp-pos" component={WebAppPOS} />
      <Route path="/partners/sdk-demo" component={SdkDemo} />
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
      
      {/* Admin Test Document Generator */}
      <ProtectedRoute 
        path="/admin/test-document-generator" 
        component={TestDocumentGenerator} 
        allowedRoles={["admin"]} 
      />
      
      {/* Admin Document Templates Manager */}
      <ProtectedRoute 
        path="/admin/document-templates-manager" 
        component={DocumentTemplatesManager} 
        allowedRoles={["admin"]} 
      />
      
      {/* Videocall demo */}
      <ProtectedRoute 
        path="/videocall-interface-demo" 
        component={VideocallInterfaceDemo} 
        allowedRoles={["certifier", "admin"]} 
      />
      
      {/* RON (Remote Online Notarization) */}
      <ProtectedRoute 
        path="/ron-videocall/:sessionId" 
        component={RonVideocall} 
        allowedRoles={["certifier", "admin"]} 
      />
      
      {/* Lawyer Dashboard */}
      <ProtectedRoute 
        path="/lawyer-dashboard" 
        component={LawyerDashboard} 
        allowedRoles={["lawyer", "admin"]} 
      />
      
      {/* Video Consultation */}
      <ProtectedRoute 
        path="/video-consultation/:consultationId" 
        component={VideoConsultation} 
        allowedRoles={["lawyer", "admin"]} 
      />
      
      {/* Purchase Code */}
      <Route path="/purchase-code" component={PurchaseCode} />
      
      {/* Micro-Interactions Demo */}
      <ProtectedRoute 
        path="/micro-interactions-demo" 
        component={MicroInteractionsDemo} 
        allowedRoles={["user", "certifier", "lawyer", "admin"]}
      />
      
      {/* Achievement Sharing */}
      <Route path="/share-achievement/:id" component={ShareAchievementPage} />
      
      {/* RON Platform (Independent Access) */}
      <Route path="/ron-login" component={RonLoginPage} />
      <Route path="/ron-platform" component={RonPlatform} />
      <Route path="/ron-session/:id?" component={RonSession} />
      
      {/* Ayuda Legal */}
      <ProtectedRoute 
        path="/ayuda-legal" 
        component={AyudaLegal} 
        allowedRoles={["lawyer", "certifier", "admin"]} 
      />
      
      {/* Integraciones Demo */}
      <Route path="/integraciones-demo" component={IntegracionesDemo} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Iniciar la conexión WebSocket cuando se monta el componente
  useEffect(() => {
    // Iniciar la conexión WebSocket
    webSocketService.connect();

    // Limpiar conexión cuando se desmonta
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <MicroInteractionProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider>
                <Toaster />
                <MicroInteractionDisplay />
                <OnboardingPopup />
                <HelpButton />
                <WebSocketDebugger />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </MicroInteractionProvider>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
