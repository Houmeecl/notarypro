# Architecture Documentation

## 1. Overview

VecinoXpress/NotaryPro is a multi-platform application for document verification, certification, and management with a focus on identity verification through NFC and remote notary services. The system supports both web and mobile interfaces, with special optimization for tablet devices (particularly Lenovo tablets with NFC capabilities).

The application consists of:
- A web application built with React
- A server-side API built with Express
- Mobile/tablet capabilities via Capacitor
- Document management system with forensics capabilities
- Identity verification system with NFC support
- Payment processing integration

## 2. System Architecture

The application follows a client-server architecture with the following components:

### 2.1 Frontend

- **Technology**: React with TypeScript
- **Build System**: Vite
- **UI Framework**: Custom components with Radix UI primitives and Tailwind CSS
- **Mobile/Tablet Support**: Apache Capacitor for native capabilities

### 2.2 Backend

- **Framework**: Express.js with TypeScript
- **API Style**: RESTful APIs with JSON responses
- **Authentication**: Session-based authentication with Passport.js
- **Document Processing**: Custom document forensics with Python/Flask microservice

### 2.3 Database

- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM
- **Schema Management**: Migration-based with drizzle-kit

### 2.4 External Services

- **Identity Verification**: Integration with GetAPI.cl and custom NFC reading
- **Payment Processing**: Stripe, PayPal, and custom payment integrations
- **Email**: SendGrid integration
- **Real-time Communication**: Agora for video/audio communication

## 3. Key Components

### 3.1 Document Management System

The document management system is a central part of the application, handling:
- Document templates and generation
- Digital signatures
- Verification codes and QR codes
- Document categorization
- Document lifecycle management

**Implementation**: The system uses a structured approach with separate tables for documents, categories, versions, and templates. Document forensics capabilities are provided through a Python/Flask microservice.

### 3.2 Identity Verification System

The identity verification system provides multiple methods to verify user identities:
- NFC verification for ID cards (primarily Chilean cédulas)
- Selfie/photo verification
- Document upload verification
- Video verification

**Implementation**: NFC verification is implemented through the Web NFC API for browsers with a fallback to Capacitor for native mobile apps. The application includes significant optimization for Lenovo tablets with NFC readers.

### 3.3 Payment Processing

The application supports multiple payment methods:
- Credit card processing via Stripe
- PayPal integration
- POS (Point of Sale) system for in-person transactions

**Implementation**: The payment system is modular, allowing different payment processors to be used depending on the context and availability.

### 3.4 User Management System

The user management system handles:
- User registration and authentication
- Role-based access control (admin, user, certifier, partner, supervisor, seller)
- Platform separation (NotaryPro vs. VecinoXpress)
- Profile management for different user types

**Implementation**: Uses a session-based authentication system with Passport.js. Passwords are securely hashed using scrypt with salt.

### 3.5 Gamification System

The application includes gamification elements:
- Challenges and achievements
- Badges and rewards
- Progress tracking

**Implementation**: Custom implementation with database tables for challenges, badges, and rewards.

## 4. Data Flow

### 4.1 Document Creation and Verification

1. User initiates document creation through web or mobile interface
2. System generates document based on template
3. User provides identity verification (NFC, photo, video)
4. Document is digitally signed and stored
5. Verification code and QR code are generated
6. Document can be verified later using the verification code

### 4.2 Identity Verification

1. User initiates identity verification process
2. System prompts for verification method (NFC, photo, document)
3. Verification data is processed (either locally or via external API)
4. System confirms or rejects identity
5. Verification result is associated with the user/document

### 4.3 Payment Processing

1. User initiates payment
2. System presents appropriate payment options
3. User selects payment method and completes transaction
4. Payment is processed through respective payment gateway
5. System records transaction and updates user/document status

## 5. External Dependencies

### 5.1 Major Dependencies

- **@capacitor/android**, **@capacitor/core**, **@capacitor/cli**: Native mobile capabilities
- **@neondatabase/serverless**: PostgreSQL database connection
- **@paypal/paypal-server-sdk**: PayPal integration
- **@sendgrid/mail**: Email service
- **@stripe/react-stripe-js**, **@stripe/stripe-js**: Stripe payment processing
- **@radix-ui/** components: UI primitives
- **@tanstack/react-query**: Data fetching and state management
- **drizzle-orm**: Database ORM
- **express**: Web server framework
- **passport**: Authentication
- **react**, **react-dom**: Frontend library
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool and development server
- **zod**: Schema validation

### 5.2 Third-Party Services

- **Agora**: Video/audio communication (SDK integrated)
- **Stripe**: Payment processing
- **PayPal**: Payment processing
- **SendGrid**: Email delivery
- **GetAPI.cl**: Identity verification (Chilean API)

## 6. Deployment Strategy

### 6.1 Web Deployment

The application is deployed using a Node.js server that serves both the API and the static frontend assets. The application can be configured for development or production environments.

**Production Deployment**:
- Build frontend assets with Vite
- Bundle server code with esbuild
- Deploy combined package to hosting environment

### 6.2 Mobile Deployment

Mobile/tablet versions are deployed as native applications built with Capacitor:
- Build web application
- Sync with Capacitor
- Generate APK/IPA files using Android Studio/Xcode
- Distribute via app stores or direct installation

### 6.3 Environment Configuration

The application uses environment variables for configuration:
- Database connection strings
- API keys for third-party services
- Feature flags
- Environment-specific settings

### 6.4 Current Hosting

The application appears to be hosted on Replit, with automatic deployment configured. The `.replit` file indicates configuration for:
- Node.js runtime
- PostgreSQL database
- Automatic build and deployment
- Port mapping for various services

## 7. Security Considerations

### 7.1 Authentication

- Session-based authentication with secure cookies
- Password hashing using scrypt with salt
- Role-based access control

### 7.2 Data Protection

- HTTPS for all communications
- Input validation using Zod schemas
- Secure file uploads with proper validation

### 7.3 API Security

- Authentication middleware for protected routes
- Request validation
- Rate limiting (to be implemented)

## 8. Future Considerations

Based on the codebase, potential areas for architectural evolution include:

- Improved offline capabilities for mobile applications
- Enhanced NFC reader compatibility across more devices
- Microservice architecture for scaling specific components
- Internationalization support for multiple languages
- Expanded payment gateway integrations