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
import React, { useEffect, useState, Suspense } from "react";
// WebSocketDebugger desactivado para mejorar la estabilidad
import { Loader2 } from "lucide-react";
import DemoModeBanner from "@/components/ui/DemoModeBanner";

// Pages
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import TestingRealMode from "@/pages/testing-real-mode";
import UserDashboard from "@/pages/user-dashboard";
import CertifierDashboard from "@/pages/certifier-dashboard";
import CertificationDashboard from "@/pages/certification-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import SellerDashboard from "@/pages/seller-dashboard";
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
import ContratosPage from "@/pages/contratos";
import VerificarDocumento from "@/pages/verificar-documento";
import DocumentVerificationGame from "@/pages/document-verification-game";
import VideocallInterfaceDemo from "@/pages/videocall-interface-demo";
import CursoCertificador from "@/pages/curso-certificador";
// Importamos la versión más nueva/actualizada de VecinosExpress
// Importamos la App web de VecinosExpress 
import VecinosExpress from "@/pages/vecinos-express";
import VecinosSignDocument from "@/pages/vecinos-sign-document";
import PartnerApplications from "@/pages/admin/partner-applications";
import ServiceSelectionPage from "@/pages/service-selection";
import RonVideocall from "@/pages/ron-videocall";
import RonSessionNativePage from "@/pages/ron-session-native";
import VideoConsultation from "@/pages/video-consultation";
import PurchaseCode from "@/pages/purchase-code";
import MicroInteractionsDemo from "@/pages/micro-interactions-demo";
import ShareAchievementPage from "@/pages/share-achievement";
import RonLoginPage from "@/pages/ron-login";
import RonPlatform from "@/pages/ron-platform";
import RonSession from "@/pages/ron-session";
import RonSessionOption from "@/pages/ron-session-option";
import RonSessionExternal from "@/pages/ron-session-external";
import AyudaLegal from "@/pages/ayuda-legal";
import IntegracionesDemo from "@/pages/integraciones-demo";
import IntegracionesApiIdentidad from "@/pages/integraciones-api-identidad";
import DescargarApk from "@/pages/partners/descargar-apk";
import ConfirmacionDescarga from "@/pages/partners/confirmacion-descarga";
// WebAppPOSOfficial ya está importado más arriba
import PaymentDemo from "@/pages/payment-demo";
import PaymentOptions from "@/pages/payment-options";
import DocumentoEjemplo from "@/pages/documento-ejemplo";
import VerificacionIdentidadDemo from "@/pages/verificacion-identidad-demo";
import ReadIDVerificationPage from "@/pages/readid-verification";
import AccesoDirecto from "@/pages/acceso-directo";
// Nuevas páginas para gestión de POS
import POSMenuPage from "@/pages/pos-menu";
import POSSessionPage from "@/pages/pos-session";
import RegisterPOSDevicePage from "@/pages/register-pos-device";

// Document pages
import DocumentCategoriesPage from "@/pages/document-categories";
import DocumentTemplatesPage from "@/pages/document-templates";
import DocumentFormPage from "@/pages/document-form";
import DocumentViewPage from "@/pages/document-view";
import DocumentViewSimplePage from "@/pages/document-view-simple";
import DocumentsPage from "@/pages/documents";
import DocumentProcessor from "@/pages/document-processor";
import DocumentExplorerPage from "@/pages/document-explorer";
import DocumentUploadPage from "@/pages/document-upload";
import SignatureDemo from "@/pages/signature-demo";
import DocumentSignatureFlowPage from "@/pages/document-signature-flow";
import SignMobilePage from "@/pages/sign-mobile";

// Partner pages
import PartnersPublicPage from "@/pages/partners/public-page";
import PartnerRegistrationForm from "@/pages/partners/registration-form";
import PartnerLogin from "@/pages/partners/partner-login";
import PosIntegrationPage from "@/pages/partners/pos-integration";
import AndroidSdkTest from "@/pages/partners/android-sdk-test";
import PasswordGenerator from "@/pages/partners/password-generator";
import WebappLogin from "@/pages/partners/webapp-login";
import WebAppPOS from "@/pages/partners/webapp-pos";
import SdkDemo from "@/pages/partners/sdk-demo";
import WebAppPOSOfficial from "@/pages/partners/webapp-pos-official";

// Admin pages
import PosManagementPage from "@/pages/admin/pos-management";
import ApiIntegrationsPage from "@/pages/admin/api-integrations";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminDocumentsPage from "@/pages/admin/documents";
import AdminCertifiersPage from "@/pages/admin/certifiers";
import AdminAIStrategyPage from "@/pages/admin/ai-strategy";
import TestDocumentGenerator from "@/pages/admin/test-document-generator";
import DocumentTemplatesManager from "@/pages/admin/document-templates-manager";

// Componente de carga para React.lazy
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Cargar módulos Vecinos de forma dinámica
const LazyVecinosIndex = React.lazy(() => import("@/pages/vecinos/index"));
const LazyVecinosLogin = React.lazy(() => import("@/pages/vecinos/login"));
const LazyVecinosRegistro = React.lazy(() => import("@/pages/vecinos/registro"));
const LazyVecinosPosApp = React.lazy(() => import("@/pages/vecinos/pos-app"));
const LazyVecinosDashboard = React.lazy(() => import("@/pages/vecinos/dashboard"));
const LazyVecinosCuenta = React.lazy(() => import("@/pages/vecinos/cuenta"));
const LazyVecinosRetiros = React.lazy(() => import("@/pages/vecinos/retiros"));
const LazyVecinosSoporte = React.lazy(() => import("@/pages/vecinos/soporte"));
const LazyVecinosFAQ = React.lazy(() => import("@/pages/vecinos/faq"));
const LazyVecinosPaymentDemo = React.lazy(() => import("@/pages/vecinos/payment-demo"));
const LazyVecinosAdmin = React.lazy(() => import("@/pages/vecinos/admin/index"));
const LazyVecinosAdminPartners = React.lazy(() => import("@/pages/vecinos/admin/partners"));
const LazyVecinosAdminSellerForms = React.lazy(() => import("@/pages/vecinos/admin/seller-forms"));
const LazyVecinosAdminExpressDashboard = React.lazy(() => import("@/pages/vecinos/admin/express-dashboard"));
const LazyVecinosAdminUsersManagement = React.lazy(() => import("@/pages/vecinos/admin/users-management"));
const LazyVecinosAdminDocumentManager = React.lazy(() => import("@/pages/vecinos/admin/document-manager"));
const LazyVecinosCertifierValidation = React.lazy(() => import("@/pages/vecinos/certifier-validation"));
// Ahora utilizamos la página unificada de verificación
// Importaciones para componentes con carga diferida
const LazyVerificacionNFC = React.lazy(() => import("@/pages/verificacion-nfc-fixed"));
const LazyDocumentoFuncional = React.lazy(() => import("@/pages/documento-funcional"));
const LazyNotaryProChile = React.lazy(() => import("@/pages/notary-pro-chile"));

function Router() {
  return (
    <Switch>
      {/* Página principal con redirección a acceso directo si es necesario */}
      <Route path="/" component={() => {
        try {
          return <LandingPage />;
        } catch (error) {
          console.error("Error al cargar la página principal:", error);
          window.location.href = "/acceso-directo";
          return null;
        }
      }} />
      {/* Página de acceso directo - evita problemas de navegación */}
      <Route path="/acceso-directo" component={AccesoDirecto} />
      {/* VecinosExpress - Versión consolidada */}
      <Route path="/vecinos-express" component={VecinosExpress} />
      <Route path="/vecinos-sign-document/:documentId?" component={VecinosSignDocument} />
      <Route path="/vecinos-complete-verification/:documentId?" component={React.lazy(() => import("./pages/vecinos-complete-verification"))} />
      <Route path="/vecinos-express-new" component={() => {
        window.location.href = "/vecinos-express";
        return null;
      }} />
      {/* Página de entrada de emergencia */}
      <Route path="/emergency-entry" component={() => {
        // Importar dinámicamente para evitar problemas de carga
        const EmergencyEntry = React.lazy(() => import("@/pages/emergency-entry"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <EmergencyEntry />
          </Suspense>
        );
      }} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Páginas de prueba y verificación del modo real */}
      <Route path="/testing-real-mode" component={TestingRealMode} />
      <Route path="/verification-mode-status" component={() => {
        const VerificationModeStatus = React.lazy(() => import("@/pages/verification-mode-status"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <VerificationModeStatus />
          </Suspense>
        );
      }} />
      <Route path="/qa-code-generator" component={() => {
        const QACodeGeneratorPage = React.lazy(() => import("@/pages/qa-code-generator"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <QACodeGeneratorPage />
          </Suspense>
        );
      }} />

      {/* User routes */}
      <ProtectedRoute 
        path="/user-dashboard" 
        component={UserDashboard} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <Route path="/document-sign/:id" component={DocumentSign} />
      <Route path="/document-signature/:documentId" component={DocumentSignatureFlowPage} />
      <Route path="/sign-mobile/:token" component={SignMobilePage} />
      <Route path="/firma-movil/:documentId/:verificationCode" component={React.lazy(() => import("@/pages/firma-movil"))} />

      {/* Document routes */}
      <Route path="/document-categories" component={DocumentCategoriesPage} />
      <Route path="/document-templates/:categoryId" component={DocumentTemplatesPage} />
      <Route path="/document-selection" component={() => {
        const DocumentSelection = React.lazy(() => import("@/pages/document-selection"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando selección de documentos...</p>
          </div>}>
            <DocumentSelection />
          </Suspense>
        );
      }} />
      <Route path="/document-selection-simple" component={() => {
        const DocumentSelectionSimple = React.lazy(() => import("@/pages/document-selection-simple"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando selección de documentos...</p>
          </div>}>
            <DocumentSelectionSimple />
          </Suspense>
        );
      }} />
      <Route path="/iniciar-tramite" component={() => {
        const IniciarTramite = React.lazy(() => import("@/pages/iniciar-tramite"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando iniciar trámite...</p>
          </div>}>
            <IniciarTramite />
          </Suspense>
        );
      }} />
      <Route path="/iniciar-tramite-simple" component={() => {
        const IniciarTramiteSimple = React.lazy(() => import("@/pages/iniciar-tramite-simple"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando iniciar trámite...</p>
          </div>}>
            <IniciarTramiteSimple />
          </Suspense>
        );
      }} />
      <Route path="/verificacion-selfie" component={() => {
        const VerificacionSelfie = React.lazy(() => import("@/pages/verificacion-selfie"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando verificación de identidad...</p>
          </div>}>
            <VerificacionSelfie />
          </Suspense>
        );
      }} />
      <Route path="/verificacion-selfie-simple" component={() => {
        const VerificacionSelfieSimple = React.lazy(() => import("@/pages/verificacion-selfie-simple"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando verificación de identidad...</p>
          </div>}>
            <VerificacionSelfieSimple />
          </Suspense>
        );
      }} />
      <Route path="/document-form/:templateId" component={DocumentFormPage} />
      <ProtectedRoute 
        path="/documents" 
        component={DocumentsPage} 
        allowedRoles={["user", "certifier", "admin"]} 
      />
      <Route path="/documents/:documentId" component={DocumentViewPage} />
      <Route path="/document-view-simple/:documentId" component={DocumentViewSimplePage} />
      <Route path="/document-view/:documentId" component={DocumentViewPage} />
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
      <ProtectedRoute 
        path="/certification-dashboard" 
        component={CertificationDashboard} 
        allowedRoles={["certifier", "admin"]} 
      />

      {/* Supervisor routes */}
      <ProtectedRoute 
        path="/supervisor/dashboard" 
        component={SupervisorDashboard} 
        allowedRoles={["supervisor", "admin"]} 
      />

      {/* Seller routes */}
      <ProtectedRoute 
        path="/seller/dashboard" 
        component={SellerDashboard} 
        allowedRoles={["seller", "admin"]} 
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
      <Route path="/garantias-legales" component={() => {
        const GarantiasLegales = React.lazy(() => import("@/pages/garantias-legales"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando garantías legales...</p>
          </div>}>
            <GarantiasLegales />
          </Suspense>
        );
      }} />
      {/* RUTAS FUNCIONALES ACTUALIZADAS - SISTEMA REAL */}
      <Route path="/documento-funcional" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyDocumentoFuncional />
        </Suspense>
      )} />
      
      <Route path="/notary-pro-chile" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyNotaryProChile />
        </Suspense>
      )} />
      
      <Route path="/notariza-funcional" component={() => {
        const NotarizaFuncional = React.lazy(() => import("@/pages/notariza-funcional"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <NotarizaFuncional />
          </Suspense>
        );
      }} />
      
      <Route path="/firma-legal" component={() => {
        const NotarizaFuncional = React.lazy(() => import("@/pages/notariza-funcional"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <NotarizaFuncional />
          </Suspense>
        );
      }} />

      <Route path="/verificar-documento" component={VerificarDocumento} />
      <Route path="/verificar-documento/:code" component={VerificarDocumento} />
      <Route path="/verificar/:id" component={() => {
        const Verificar = React.lazy(() => import("@/pages/verificar"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando verificación...</p>
          </div>}>
            <Verificar />
          </Suspense>
        );
      }} />
      <Route path="/verificar-simple/:id" component={() => {
        const VerificarSimple = React.lazy(() => import("@/pages/verificar-simple"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando verificación...</p>
          </div>}>
            <VerificarSimple />
          </Suspense>
        );
      }} />
      <Route path="/verification-game" component={DocumentVerificationGame} />
      <Route path="/curso-certificador" component={CursoCertificador} />
      <Route path="/service-selection" component={ServiceSelectionPage} />
      <Route path="/quienes-somos" component={QuienesSomosPage} />
      <Route path="/signature-demo" component={SignatureDemo} />
      <Route path="/test-etoken" component={() => {
        const TestEtoken = React.lazy(() => import("@/pages/test-etoken"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <TestEtoken />
          </Suspense>
        );
      }} />
      <Route path="/etoken-diagnostico" component={() => {
        const EtokenDiagnostico = React.lazy(() => import("@/pages/etoken-diagnostico"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <EtokenDiagnostico />
          </Suspense>
        );
      }} />

      {/* Vecinos Xpress Pages (lazy loaded) */}
      <Route path="/vecinos" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosIndex />
        </Suspense>
      )} />
      <Route path="/vecinos/login" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosLogin />
        </Suspense>
      )} />
      <Route path="/vecinos/registro" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosRegistro />
        </Suspense>
      )} />
      <Route path="/vecinos/pos-app" component={WebAppPOS} />
      {/* Dashboard de Vecinos (versión normal) */}
      <Route path="/vecinos/dashboard" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosDashboard />
        </Suspense>
      )} />
      <Route path="/vecinos/cuenta" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosCuenta />
        </Suspense>
      )} />
      <Route path="/vecinos/retiros" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosRetiros />
        </Suspense>
      )} />
      <Route path="/vecinos/soporte" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosSoporte />
        </Suspense>
      )} />
      <Route path="/vecinos/faq" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosFAQ />
        </Suspense>
      )} />
      <Route path="/vecinos/payment-demo" component={() => (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyVecinosPaymentDemo />
        </Suspense>
      )} />

      {/* Vecinos Admin Dashboard - Acceso directo temporalmente */}
      <Route 
        path="/vecinos/admin" 
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdmin />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos-admin" 
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdmin />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/admin/partners"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdminPartners />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/admin/seller-forms"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdminSellerForms />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/admin/express-dashboard"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdminExpressDashboard />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/admin/users"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdminUsersManagement />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/admin/document-manager"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosAdminDocumentManager />
          </Suspense>
        )}
      />
      <Route 
        path="/vecinos/certifier"
        component={() => (
          <Suspense fallback={<LazyLoadingFallback />}>
            <LazyVecinosCertifierValidation />
          </Suspense>
        )}
      />

      {/* Partner pages */}
      <Route path="/partners/public-page" component={PartnersPublicPage} />
      <Route path="/partners/registration-form" component={PartnerRegistrationForm} />
      <Route path="/partners/partner-login" component={PartnerLogin} />
      <Route path="/partners/android-sdk-test" component={AndroidSdkTest} />
      <Route path="/partners/password-generator" component={PasswordGenerator} />
      <Route path="/partners/webapp-login" component={WebappLogin} />
      {/* POS Web Oficial - Verificación con NFC y otros servicios */}
      <Route path="/partners/webapp-pos-official" component={WebAppPOSOfficial} />

      {/* Versiones del POS web */}
      <Route path="/partners/webapp-pos" component={WebAppPOS} />
      <Route path="/partners/webapp-pos-alternativa" component={WebAppPOS} />
      <Route path="/partners/webapp-pos-buttons" component={WebAppPOS} />
      <Route path="/partners/webapp-pos-nfc" component={WebAppPOS} />
      <Route path="/partners/webapp-pos-tramite" component={WebAppPOS} />

      {/* SDK Demo y otras herramientas para partners */}
      <Route path="/partners/sdk-demo" component={SdkDemo} />
      <Route path="/partners/descargar-apk" component={DescargarApk} />
      <Route path="/partners/confirmacion-descarga" component={ConfirmacionDescarga} />
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

      {/* Contratos Digitales */}
      <Route path="/contratos" component={ContratosPage} />

      {/* RON Platform (Independent Access) */}
      <Route path="/ron-login" component={RonLoginPage} />
      <Route path="/ron-platform" component={RonPlatform} />
      {/* Ruta para la selección entre sistema integrado o externo */}
      <Route path="/ron-session-option/:id?" component={RonSessionOption} />
      {/* Sistema integrado (opción por defecto) */}
      <Route path="/ron-session/:id?" component={RonSession} />
      <Route path="/ron-session-native/:sessionId" component={RonSessionNativePage} />
      {/* Sistema externo (Zoom/Meet) como alternativa */}
      <Route path="/ron-session-external/:id?" component={RonSessionExternal} />

      {/* Ayuda Legal */}
      <ProtectedRoute 
        path="/ayuda-legal" 
        component={AyudaLegal} 
        allowedRoles={["lawyer", "certifier", "admin"]} 
      />
      
      {/* Estado de Servicios */}
      <ProtectedRoute 
        path="/servicios-status" 
        component={() => {
          const ServiciosStatus = React.lazy(() => import("@/pages/servicios-status"));
          return (
            <Suspense fallback={<div className="flex items-center justify-center h-screen">
              <p className="text-xl">Cargando estado de servicios...</p>
            </div>}>
              <ServiciosStatus />
            </Suspense>
          );
        }}
        allowedRoles={["admin", "supervisor"]} 
      />

      {/* Integraciones Demo */}
      <Route path="/integraciones-demo" component={IntegracionesDemo} />
      <Route path="/integraciones-api-identidad" component={IntegracionesApiIdentidad} />
      
      {/* Demo de Opciones de Pago (acceso público) */}
      <Route path="/payment-options" component={() => {
        // Asegurarse de que sea directamente accesible sin autenticación
        return <PaymentOptions />;
      }} />

      {/* VERIFICACIÓN DE IDENTIDAD - Dos métodos principales */}
      
      {/* 1. Verificación con NFC (Método principal y recomendado) */}
      <Route path="/verificacion-nfc" component={() => {
        // Importar dinámicamente el componente (versión corregida y más completa)
        const VerificacionNFC = React.lazy(() => import("@/pages/verificacion-nfc-fixed"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <VerificacionNFC />
          </Suspense>
        );
      }} />
      
      {/* Versión fixed explícita (para acceso directo) */}
      <Route path="/verificacion-nfc-fixed" component={() => {
        // Importar dinámicamente el componente (versión corregida y más completa)
        const VerificacionNFC = React.lazy(() => import("@/pages/verificacion-nfc-fixed"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <VerificacionNFC />
          </Suspense>
        );
      }} />
      
      {/* Herramienta de validación y diagnóstico de NFC para tablets Lenovo */}
      <Route path="/nfc-validation" component={() => {
        const NFCValidation = React.lazy(() => import("@/pages/nfc-validation"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <NFCValidation />
          </Suspense>
        );
      }} />
      
      {/* 2. Verificación con Demo vía QR (Alternativa) */}
      <Route path="/verificacion-identidad" component={VerificacionIdentidadDemo} />
      <Route path="/readid-verification" component={ReadIDVerificationPage} />
      
      {/* Redireccionar todas las demás versiones de verificación a las principales */}
      <Route path="/verificacion-movil" component={() => {
        window.location.href = "/verificacion-nfc";
        return null;
      }} />
      <Route path="/verificacion-identidad-nfc" component={() => {
        window.location.href = "/verificacion-nfc";
        return null;
      }} />
      <Route path="/verificacion-nfc-movil" component={() => {
        window.location.href = "/verificacion-nfc";
        return null;
      }} />
      <Route path="/verificacion-identidad-qr" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-identidad-demo" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-avanzada" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-integrada" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-identidad-movil" component={() => {
        window.location.href = "/verificacion-nfc";
        return null;
      }} />
      <Route path="/verificacion-identidad-readid" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-inverid" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-selfie" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />
      <Route path="/verificacion-selfie-simple" component={() => {
        window.location.href = "/verificacion-identidad";
        return null;
      }} />

      {/* Demostración de Pagos con MercadoPago */}
      <Route path="/payment-demo" component={PaymentDemo} />
      
      {/* Nuevos terminales POS para VecinoXpress */}
      <Route path="/pos" component={() => {
        const POSMenu = React.lazy(() => import("@/pages/pos-menu"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <POSMenu />
          </Suspense>
        );
      }} />
      <Route path="/tablet-pos" component={() => {
        const TabletPOS = React.lazy(() => import("@/pages/tablet-pos-payment"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <TabletPOS />
          </Suspense>
        );
      }} />
      <Route path="/real-pos" component={() => {
        const RealPOS = React.lazy(() => import("@/pages/real-pos-payment"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <RealPOS />
          </Suspense>
        );
      }} />
      <Route path="/test-pos" component={() => {
        const TestPOS = React.lazy(() => import("@/pages/test-pos-payment"));
        return (
          <Suspense fallback={<LazyLoadingFallback />}>
            <TestPOS />
          </Suspense>
        );
      }} />

      {/* Páginas de retorno para los pagos (MercadoPago y Tuu) */}
      <Route path="/payment-success" component={() => {
        const PaymentSuccess = React.lazy(() => import("@/pages/payment-success"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando confirmación de pago...</p>
          </div>}>
            <PaymentSuccess />
          </Suspense>
        );
      }} />
      <Route path="/payment-failure" component={() => {
        // Redireccionar a la página de opciones de pago con parámetros (preferencia a Tuu)
        const currentUrl = new URL(window.location.href);
        const tuu = currentUrl.searchParams.get("tuu");
        const redirectUrl = tuu === "true" ? "/payment-options" : "/payment-demo"; 
        window.location.replace(redirectUrl + "?status=error");
        return <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Redireccionando...</p>
        </div>;
      }} />
      <Route path="/payment-cancel" component={() => {
        // Redireccionar a la página de opciones de pago con parámetros (específico para Tuu)
        window.location.replace("/payment-options?status=canceled");
        return <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Redireccionando...</p>
        </div>;
      }} />
      <Route path="/payment-pending" component={() => {
        // Redireccionar a la página de opciones de pago con parámetros (preferencia a Tuu)
        const currentUrl = new URL(window.location.href);
        const tuu = currentUrl.searchParams.get("tuu");
        const redirectUrl = tuu === "true" ? "/payment-options" : "/payment-demo"; 
        window.location.replace(redirectUrl + "?status=pending");
        return <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Redireccionando...</p>
        </div>;
      }} />

      {/* Documento Ejemplo */}
      <Route path="/documento-ejemplo" component={DocumentoEjemplo} />

      {/* Sistema de Gestión de Dispositivos POS */}
      <Route path="/pos-menu" component={POSMenuPage} />
      <Route path="/pos-session/:id" component={POSSessionPage} />
      <Route path="/register-pos-device" component={RegisterPOSDevicePage} />
      <ProtectedRoute 
        path="/pos-menu" 
        component={() => {
          const POSMenuPage = React.lazy(() => import("@/pages/pos-menu"));
          return (
            <Suspense fallback={<LazyLoadingFallback />}>
              <POSMenuPage />
            </Suspense>
          );
        }} 
        allowedRoles={["user", "certifier", "admin", "manager", "partner"]} 
      />
      
      <ProtectedRoute 
        path="/pos-session/:deviceCode" 
        component={() => {
          const POSSessionPage = React.lazy(() => import("@/pages/pos-session"));
          return (
            <Suspense fallback={<LazyLoadingFallback />}>
              <POSSessionPage />
            </Suspense>
          );
        }} 
        allowedRoles={["user", "certifier", "admin", "manager", "partner"]} 
      />
      
      <ProtectedRoute 
        path="/register-pos-device" 
        component={() => {
          const RegisterPOSDevicePage = React.lazy(() => import("@/pages/register-pos-device"));
          return (
            <Suspense fallback={<LazyLoadingFallback />}>
              <RegisterPOSDevicePage />
            </Suspense>
          );
        }} 
        allowedRoles={["admin", "manager"]} 
      />

      {/* Documentación Técnica */}
      <Route path="/documentacion" component={() => {
        const DocumentacionPage = React.lazy(() => import("@/pages/documentacion-page"));
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <p className="text-xl">Cargando documentación técnica...</p>
          </div>}>
            <DocumentacionPage />
          </Suspense>
        );
      }} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Estado para controlar si ha habido un error de carga
  const [loadingFailed, setLoadingFailed] = useState(false);

  // Iniciar la conexión WebSocket cuando se monta el componente
  useEffect(() => {
    // Iniciar la conexión WebSocket con un retardo para permitir que la aplicación cargue primero
    const wsTimeoutId = setTimeout(() => {
      try {
        // Solo intentar conectar en entornos de producción o 
        // cuando no estamos experimentando problemas de conectividad
        if (import.meta.env.PROD || !window.location.host.includes('replit')) {
          webSocketService.connect();
          console.log("Conexión WebSocket iniciada exitosamente");
        } else {
          console.log("WebSocket desactivado en entorno de desarrollo para mejorar estabilidad");
        }
      } catch (error) {
        console.error("Error al iniciar WebSocket, continuando sin él:", error);
        // No bloqueamos la carga de la aplicación si falla el WebSocket
      }
    }, 2000);

    // Configurar un timeout para verificar si la aplicación carga
    const loadTimeoutId = setTimeout(() => {
      // Este código nunca debería ejecutarse si la aplicación carga normalmente
      const appRoot = document.getElementById("root");
      if (appRoot && appRoot.children.length <= 1) {
        console.log("Detectado posible fallo de carga, intentando recuperar...");
        setLoadingFailed(true);
      }
    }, 8000);

    // Limpiar conexión cuando se desmonta
    return () => {
      clearTimeout(wsTimeoutId);
      clearTimeout(loadTimeoutId);
      try {
        webSocketService.disconnect();
      } catch (error) {
        console.error("Error al desconectar WebSocket:", error);
      }
    };
  }, []);

  // Si detectamos un problema de carga, mostrar una interfaz alternativa
  if (loadingFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Problemas de conectividad</h1>
        <p className="text-gray-700 mb-6 text-center max-w-md">
          Estamos experimentando problemas para establecer algunas conexiones. 
          La aplicación funcionará con características limitadas.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reiniciar aplicación
        </button>
      </div>
    );
  }

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
                <DemoModeBanner variant="prominent" position="top" dismissible={true} />
                {/* WebSocketDebugger completamente desactivado para evitar problemas de conectividad */}
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