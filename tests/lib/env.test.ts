import { describe, expect, it, vi } from "vitest";
import { hasAdminAuthEnv, hasDatabaseEnv, isAdminPreviewMode } from "@/lib/env";

describe("env", () => {
  it("detecta DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(hasDatabaseEnv()).toBe(false);
    vi.stubEnv("DATABASE_URL", "mysql://u:p@h:1/db");
    expect(hasDatabaseEnv()).toBe(true);
  });

  it("exige hash e segredo com 32+ caracteres para o login", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "$2b$12$hash");
    vi.stubEnv("ADMIN_SESSION_SECRET", "curto");
    expect(hasAdminAuthEnv()).toBe(false);
    vi.stubEnv("ADMIN_SESSION_SECRET", "x".repeat(32));
    expect(hasAdminAuthEnv()).toBe(true);
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(hasAdminAuthEnv()).toBe(false);
  });

  it("modo de visualização só existe em desenvolvimento", () => {
    vi.stubEnv("ADMIN_PREVIEW_MODE", "true");
    vi.stubEnv("NODE_ENV", "production");
    expect(isAdminPreviewMode()).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(isAdminPreviewMode()).toBe(true);
    vi.stubEnv("ADMIN_PREVIEW_MODE", "false");
    expect(isAdminPreviewMode()).toBe(false);
  });
});
