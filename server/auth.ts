import passport from "passport";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const PgSession = connectPgSimple(session);

export interface KeycloakUser {
  id: string;
  email: string;
  name: string;
  username: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface User extends KeycloakUser {}
  }
}

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://keycloak.pcw.com.do";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "sici";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "sici-app";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const REPLIT_DEV_DOMAIN = process.env.REPLIT_DEV_DOMAIN;

const issuerUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
const callbackUrl = REPLIT_DEV_DOMAIN 
  ? `https://${REPLIT_DEV_DOMAIN}/api/callback`
  : "/api/callback";

export function setupAuth(app: Express): void {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "sici-session-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const verifyCallback = (
    iss: string,
    uiProfile: any,
    idProfile: any,
    context: any,
    idToken: string,
    accessToken: string,
    refreshToken: string,
    params: any,
    done: (err: any, user?: any) => void
  ) => {
    let roles: string[] = [];
    
    try {
      if (accessToken) {
        const decodedToken = jwt.decode(accessToken) as any;
        
        if (decodedToken?.realm_access?.roles) {
          roles.push(...decodedToken.realm_access.roles);
        }
        if (decodedToken?.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles) {
          roles.push(...decodedToken.resource_access[KEYCLOAK_CLIENT_ID].roles);
        }
      }
    } catch (e) {
      console.error("Error parsing token for roles:", e);
    }

    const profile = uiProfile || idProfile || {};
    
    const user: KeycloakUser = {
      id: profile.id || profile.sub || "",
      email: profile.emails?.[0]?.value || profile.email || "",
      name: profile.displayName || profile.name || profile.preferred_username || "",
      username: profile.username || profile.preferred_username || profile.sub || "",
      roles,
    };

    return done(null, user);
  };

  passport.use(
    "keycloak",
    new OpenIDConnectStrategy(
      {
        issuer: issuerUrl,
        authorizationURL: `${issuerUrl}/protocol/openid-connect/auth`,
        tokenURL: `${issuerUrl}/protocol/openid-connect/token`,
        userInfoURL: `${issuerUrl}/protocol/openid-connect/userinfo`,
        clientID: KEYCLOAK_CLIENT_ID,
        clientSecret: KEYCLOAK_CLIENT_SECRET!,
        callbackURL: callbackUrl,
        scope: ["openid", "profile", "email"],
      },
      verifyCallback as any
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.get("/auth/login", passport.authenticate("keycloak"));

  app.get(
    "/api/callback",
    passport.authenticate("keycloak", {
      failureRedirect: "/auth/login",
      failureMessage: true,
    }),
    async (req, res) => {
      if (req.user) {
        try {
          const keycloakRoles = req.user.roles || [];
          let localRole = "consulta";
          if (keycloakRoles.includes("Administrador")) {
            localRole = "admin";
          } else if (keycloakRoles.includes("Supervisor")) {
            localRole = "supervisor";
          } else if (keycloakRoles.includes("Operador")) {
            localRole = "operador";
          }
          
          await storage.upsertUser(req.user.id, {
            username: req.user.username,
            password: "keycloak-managed",
            name: req.user.name,
            email: req.user.email,
            role: localRole as any,
            isActive: true,
          });
        } catch (error) {
          console.error("Error syncing user to local database:", error);
        }
      }
      res.redirect("/");
    }
  );

  app.get("/auth/logout", (req, res) => {
    const returnUrl = REPLIT_DEV_DOMAIN 
      ? `https://${REPLIT_DEV_DOMAIN}/`
      : `${req.protocol}://${req.get("host")}/`;
    const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout?client_id=${KEYCLOAK_CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(returnUrl)}`;
    
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.redirect(logoutUrl);
      });
    });
  });

  app.get("/auth/me", async (req, res) => {
    if (req.isAuthenticated() && req.user) {
      try {
        const keycloakRoles = req.user.roles || [];
        let localRole = "consulta";
        if (keycloakRoles.includes("Administrador")) {
          localRole = "admin";
        } else if (keycloakRoles.includes("Supervisor")) {
          localRole = "supervisor";
        } else if (keycloakRoles.includes("Operador")) {
          localRole = "operador";
        }
        
        await storage.upsertUser(req.user.id, {
          username: req.user.username,
          password: "keycloak-managed",
          name: req.user.name,
          email: req.user.email,
          role: localRole as any,
          isActive: true,
        });
      } catch (error) {
        console.error("Error syncing user on /auth/me:", error);
      }
      res.json(req.user);
    } else {
      res.status(401).json({ error: "No autenticado" });
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Autenticación requerida" });
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: "Autenticación requerida" });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({ error: "No tienes permisos para esta acción" });
      return;
    }

    next();
  };
}
