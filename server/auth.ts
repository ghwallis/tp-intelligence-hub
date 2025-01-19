import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as AppleStrategy } from "passport-apple";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Crypto utilities for password hashing and verification
const crypto = {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
    return `${derivedKey.toString('hex')}:${salt}`;
  },

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      const [hashedPassword, salt] = hash.split(':');
      if (!hashedPassword || !salt) return false;

      const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
      const keyBuffer = Buffer.from(hashedPassword, 'hex');
      return timingSafeEqual(keyBuffer, derivedKey);
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }
};

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export async function createInitialAdmin() {
  try {
    // Delete existing admin if any
    await db.delete(users).where(eq(users.username, 'admin'));

    // Create fresh admin user
    console.log("Creating admin user...");
    const hashedPassword = await crypto.hash('admin123');
    const [newAdmin] = await db.insert(users)
      .values({
        username: 'admin',
        password: hashedPassword,
      })
      .returning();
    console.log("Admin user created successfully");
    return newAdmin;

  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "tp-hub-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isValid = await crypto.verify(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let [user] = await db
              .select()
              .from(users)
              .where(eq(users.username, profile.emails?.[0].value || profile.id))
              .limit(1);

            if (!user) {
              const [newUser] = await db
                .insert(users)
                .values({
                  username: profile.emails?.[0].value || profile.id,
                  password: await crypto.hash(randomBytes(32).toString('hex')),
                })
                .returning();
              user = newUser;
            }

            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await crypto.hash(password);
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.json({
          message: "Registration successful",
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) return next(err);
      if (!user) return res.status(400).send(info.message ?? "Login failed");

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username },
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).send("Logout failed");
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });

  // Social Login Routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (_req, res) => {
      res.redirect("/");
    }
  );

  // Create initial admin user
  createInitialAdmin().catch(console.error);
}