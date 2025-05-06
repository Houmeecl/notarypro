import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Verificar que stored sea una cadena válida y tenga el formato correcto
    if (!stored || !stored.includes(".")) {
      console.error("Error: Formato de contraseña almacenada inválido");
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Verificar que ambos componentes estén presentes
    if (!hashed || !salt) {
      console.error("Error: Componentes de contraseña faltantes");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
}

// Variable para modo de emergencia (bypass de autenticación)
export const EMERGENCY_MODE = false;

// Simulación de usuario para uso en modo de emergencia
export const EMERGENCY_USER: SelectUser = {
  id: 999999,
  username: "emergency_access",
  email: "emergency@vecinoxpress.cl",
  fullName: "Acceso de Emergencia",
  password: "emergency_bypass_password",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "docusignpro-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName, role = "user" } = req.body;
      
      // Validate role
      if (role !== "user" && role !== "certifier" && role !== "admin") {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      // Check if username exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        username,
        email,
        fullName,
        role,
        password: await hashPassword(password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Imprimimos los datos de inicio de sesión (solo el nombre de usuario por seguridad)
    console.log(`Intento de inicio de sesión para el usuario: ${req.body.username}`);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error en autenticación:", err);
        return next(err);
      }
      
      if (!user) {
        console.log(`Inicio de sesión fallido para el usuario: ${req.body.username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`Inicio de sesión exitoso para el usuario: ${req.body.username}`);
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error en login:", loginErr);
          return next(loginErr);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // MODO DE EMERGENCIA: Siempre devuelve el usuario de emergencia
    if (EMERGENCY_MODE) {
      console.log("MODO DE EMERGENCIA ACTIVADO: Devolviendo usuario de emergencia");
      return res.json(EMERGENCY_USER);
    }
    
    // Comportamiento normal cuando no está en modo de emergencia
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
