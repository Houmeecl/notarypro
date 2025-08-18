# 🔐 **SISTEMA DE AUTENTICACIÓN JWT - NotaryVecino**

## 🎯 **IMPLEMENTACIÓN COMPLETA CON TOKENS JWT**

### ✅ **FUNCIONALIDADES IMPLEMENTADAS**

- **🔑 Login/Registro con JWT**
- **🎫 Access Token + Refresh Token**
- **👥 Gestión de Roles y Permisos**
- **🛡️ Protección de Rutas**
- **🔄 Renovación Automática de Tokens**
- **🍪 Soporte de Cookies + Headers**
- **📱 Compatible con Frontend/Mobile**

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### 📁 **Archivos Implementados:**

```
/server/services/jwt-auth-service.ts     # Servicio principal JWT
/server/auth-jwt-routes.ts               # Rutas de autenticación
/server/middleware/jwt-protection.ts     # Middleware de protección
/client/src/services/auth-service.ts     # Cliente JWT para frontend
```

---

## 🔧 **APIs DE AUTENTICACIÓN**

### 🚀 **Endpoints Disponibles:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login con JWT |
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/refresh` | Renovar access token |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/me` | Info del usuario actual |
| `GET` | `/api/auth/verify-token` | Verificar validez del token |
| `GET` | `/api/auth/permissions` | Permisos del usuario |
| `PUT` | `/api/auth/change-password` | Cambiar contraseña |

---

## 👤 **GESTIÓN DE USUARIOS Y ROLES**

### 🎭 **Roles Disponibles:**

```typescript
// Roles del sistema
'admin'      // Administrador completo
'certifier'  // Certificador de documentos
'notary'     // Notario público
'lawyer'     // Abogado
'partner'    // Socio/Partner
'pos-user'   // Usuario POS
'operator'   // Operador de terminal
'user'       // Usuario básico
```

### 🔐 **Permisos por Rol:**

```typescript
const rolePermissions = {
  'admin': [
    'manage_users', 'manage_system', 'view_all_documents',
    'manage_pos', 'manage_integrations', 'view_analytics'
  ],
  'certifier': [
    'certify_documents', 'view_documents', 'manage_sessions',
    'ron_sessions', 'identity_verification'
  ],
  'pos-user': [
    'pos_operations', 'process_payments', 'view_transactions'
  ]
  // ... más roles
};
```

---

## 🛠️ **USO DEL SISTEMA**

### 📋 **1. Login con JWT:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Edwardadmin",
    "password": "adminq"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "Edwardadmin",
      "email": "admin@notarypro.cl",
      "fullName": "Admin Principal",
      "role": "admin",
      "platform": "notarypro"
    }
  }
}
```

### 📋 **2. Registro de Usuario:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "email": "user@example.com",
    "fullName": "Nuevo Usuario",
    "role": "user",
    "platform": "notarypro"
  }'
```

### 📋 **3. Acceso a Ruta Protegida:**

```bash
curl -X GET http://localhost:5000/api/admin/real-data/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 📋 **4. Renovar Token:**

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 💻 **USO EN FRONTEND**

### 🔧 **Servicio de Autenticación:**

```typescript
import { authService } from '@/services/auth-service';

// Login
const tokens = await authService.login({
  username: 'admin',
  password: 'password'
});

// Verificar autenticación
if (authService.isAuthenticated()) {
  const user = authService.getUser();
  console.log('Usuario logueado:', user);
}

// Hacer petición autenticada
const data = await authService.authenticatedRequest('/api/protected-route');

// Verificar roles
if (authService.isAdmin()) {
  // Mostrar panel de admin
}

if (authService.isCertifier()) {
  // Mostrar panel de certificador
}
```

### 🔧 **Hook de React (Ejemplo):**

```typescript
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth-service';

export const useAuth = () => {
  const [user, setUser] = useState(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const tokens = await authService.login(credentials);
    setUser(tokens.user);
    setIsAuthenticated(true);
    return tokens;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isAdmin: () => authService.isAdmin(),
    isCertifier: () => authService.isCertifier(),
    isPosUser: () => authService.isPosUser()
  };
};
```

---

## 🛡️ **PROTECCIÓN DE RUTAS EN BACKEND**

### 🔧 **Middleware de Autenticación:**

```typescript
import { authenticateJWT, requireAdmin, requireCertifier } from './services/jwt-auth-service';

// Ruta protegida básica
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

// Ruta solo para administradores
router.get('/admin-only', requireAdmin, (req, res) => {
  res.json({ message: 'Solo admins pueden ver esto' });
});

// Ruta para certificadores
router.get('/certifier-only', requireCertifier, (req, res) => {
  res.json({ message: 'Solo certificadores pueden ver esto' });
});
```

### 🔧 **Middleware Híbrido (JWT + Sesión):**

```typescript
import { hybridAuth, hybridRequireAdmin } from './middleware/jwt-protection';

// Soporta tanto JWT como sesión tradicional
router.get('/hybrid-protected', hybridAuth, (req, res) => {
  res.json({ user: req.user });
});
```

---

## 🧪 **TESTING DEL SISTEMA**

### 🚀 **Ejecutar Pruebas:**

```bash
# Probar todas las funcionalidades JWT
./test-jwt-auth.sh

# Iniciar servidor
npm start

# Probar manualmente
curl http://localhost:5000/api/auth/login -d '{"username":"admin","password":"pass"}'
```

---

## ⚙️ **CONFIGURACIÓN**

### 🔧 **Variables de Entorno:**

```bash
# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# Session fallback
SESSION_SECRET=tu_session_secret
```

### 🔧 **Configuración de Cookies:**

```typescript
// Configuración automática de cookies seguras
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 horas
});
```

---

## 🎯 **USUARIOS DE PRUEBA CON JWT**

### 👥 **Usuarios Disponibles:**

| Usuario | Contraseña | Rol | Plataforma |
|---------|------------|-----|------------|
| `Edwardadmin` | `adminq` | admin | notarypro |
| `Sebadmin` | `admin123` | admin | notarypro |
| `vecinosadmin` | `vecinos123` | admin | vecinos |
| `posoperator1` | `pos123` | pos-user | notarypro |
| `certifier1` | `cert123456` | certifier | notarypro |

### 🧪 **Crear Usuarios de Prueba:**

```bash
# Admin
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"username":"Edwardadmin","password":"adminq"}'

# Certificador
curl -X POST http://localhost:5000/api/auth/register \
  -d '{
    "username":"mycertifier",
    "password":"cert123",
    "email":"cert@test.com",
    "fullName":"Mi Certificador",
    "role":"certifier"
  }'

# Usuario POS
curl -X POST http://localhost:5000/api/auth/register \
  -d '{
    "username":"mypos",
    "password":"pos123",
    "email":"pos@test.com",
    "fullName":"Mi Usuario POS",
    "role":"pos-user"
  }'
```

---

## 🎉 **CARACTERÍSTICAS AVANZADAS**

### ✅ **Funcionalidades Implementadas:**

- **🔄 Renovación automática** de tokens expirados
- **🍪 Soporte dual** cookies + headers Authorization
- **📱 Compatible** con aplicaciones móviles
- **🛡️ Middleware híbrido** JWT + sesión tradicional
- **👥 Sistema granular** de roles y permisos
- **🔐 Encriptación segura** de contraseñas con bcrypt
- **📊 Auditoría completa** de accesos y acciones
- **⚡ Rendimiento optimizado** con caché de tokens

### 🚀 **Listo para Producción:**

- **✅ Tokens seguros** con expiración configurable
- **✅ Refresh tokens** para renovación automática
- **✅ Validación completa** de entrada y permisos
- **✅ Manejo de errores** robusto
- **✅ Logging detallado** para debugging
- **✅ Compatibilidad completa** con el sistema existente

---

## 🎯 **RESUMEN**

### 🏆 **SISTEMA JWT COMPLETAMENTE FUNCIONAL:**

- **🔐 Autenticación completa** con JWT tokens
- **👥 8 roles diferentes** con permisos específicos
- **🛡️ Protección granular** de rutas y recursos
- **📱 Cliente completo** para frontend/móvil
- **🧪 Suite de pruebas** automatizada
- **⚡ Rendimiento optimizado** para producción

**¡NotaryVecino tiene ahora un sistema de autenticación JWT de nivel empresarial completamente funcional!** 🚀