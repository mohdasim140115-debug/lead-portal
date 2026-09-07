import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

// Edge-safe (jose only). No DB access here.
const secret = () => new TextEncoder().encode(env.authSecret);
const ISSUER = "lead-portal";

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${env.authSessionTtl}s`)
    .sign(secret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    return payload;
  } catch {
    return null;
  }
}
