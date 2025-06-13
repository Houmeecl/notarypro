import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./db";
import { eq } from "drizzle-orm";

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Función para comparar contraseñas
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'notary_vecino_super_secret_2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // cambiar a true si usas HTTPS
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return done(null, false, { message: "Contraseña inválida" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // Rutas básicas
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => res.json({ message: "Sesión cerrada" }));
  });

  app.get('/api/user', (req, res) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    res.json(req.user);
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, email, fullName, role = "user" } = req.body;
      const hashedPassword = await hashPassword(password);
      
      const [user] = await db.insert(users).values({
        username,
        password: hashedPassword,
        email,
        fullName,
        role,
        createdAt: new Date()
      }).returning();

      req.login(user, () => {
        res.json(user);
      });
    } catch (error) {
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });
}