import { describe, expect, it } from "vitest";
import {
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const SECRET = "a".repeat(64);
const NOW = Date.UTC(2026, 8, 29, 12);

describe("admin session token", () => {
  it("aceita um token recém-criado com o mesmo segredo", async () => {
    const token = await createAdminSessionToken(SECRET, NOW);
    expect(await verifyAdminSessionToken(token, SECRET, NOW + 1000)).toBe(true);
  });

  it("recusa token assinado com outro segredo", async () => {
    const token = await createAdminSessionToken(SECRET, NOW);
    expect(await verifyAdminSessionToken(token, "b".repeat(64), NOW)).toBe(false);
  });

  it("expira depois de 7 dias", async () => {
    const token = await createAdminSessionToken(SECRET, NOW);
    const expiry = NOW + ADMIN_SESSION_MAX_AGE * 1000;
    expect(await verifyAdminSessionToken(token, SECRET, expiry - 1)).toBe(true);
    expect(await verifyAdminSessionToken(token, SECRET, expiry)).toBe(false);
  });

  it("recusa payload adulterado mantendo a assinatura original", async () => {
    const token = await createAdminSessionToken(SECRET, NOW);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ version: 1, expiresAt: NOW + 10 ** 12 }),
    ).toString("base64url");
    expect(await verifyAdminSessionToken(`${forged}.${signature}`, SECRET, NOW)).toBe(false);
  });

  it.each([
    ["ausente", undefined],
    ["vazio", ""],
    ["sem assinatura", "abc"],
    ["com partes extras", "a.b.c"],
    ["com base64 inválido", "%%%.%%%"],
  ])("recusa token %s", async (_label, token) => {
    expect(await verifyAdminSessionToken(token, SECRET, NOW)).toBe(false);
  });

  it("falha fechado quando o segredo não está configurado", async () => {
    const token = await createAdminSessionToken(SECRET, NOW);
    expect(await verifyAdminSessionToken(token, undefined, NOW)).toBe(false);
  });

  it("recusa versão de payload desconhecida mesmo com assinatura válida", async () => {
    const encoder = new TextEncoder();
    const payload = Buffer.from(
      JSON.stringify({ version: 2, expiresAt: NOW + 60_000 }),
    ).toString("base64url");
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = Buffer.from(
      await crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
    ).toString("base64url");
    expect(await verifyAdminSessionToken(`${payload}.${signature}`, SECRET, NOW)).toBe(false);
  });
});
