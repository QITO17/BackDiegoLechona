import jwt from "jsonwebtoken";
import { User } from "./database.js";

const JWT_ISSUER = "lechona-api";
const JWT_AUDIENCE = "lechona-app";

export function signAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: user.id, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: "8h" },
  );
}

export async function authenticate(req, res, next) {
  const [scheme, token] = String(req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Inicia sesión para continuar." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch {
    return res.status(401).json({ error: "La sesión venció o no es válida. Inicia sesión nuevamente." });
  }

  if (!payload || typeof payload === "string" || typeof payload.sub !== "string") {
    return res.status(401).json({ error: "La sesión no es válida. Inicia sesión nuevamente." });
  }

  try {
    const user = await User.findByPk(payload.sub);
    if (!user || !user.active) {
      return res.status(401).json({ error: "La cuenta no existe o está desactivada." });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción." });
    }
    next();
  };
}

export function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}
