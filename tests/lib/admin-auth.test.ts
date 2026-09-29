import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirectMock } from "../helpers";

const cookieStore = new Map<string, string>();
const setCookie = vi.fn((name: string, value: string, options: Record<string, unknown>) => {
  void options;
  cookieStore.set(name, value);
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    set: setCookie,
  }),
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const {
  clearAdminSession,
  hasValidAdminSession,
  requireAdminSession,
  setAdminSession,
} = await import("@/lib/admin-auth");
const { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } = await import("@/lib/admin-session");

describe("admin-auth", () => {
  beforeEach(() => {
    cookieStore.clear();
    setCookie.mockClear();
    vi.stubEnv("ADMIN_SESSION_SECRET", "k".repeat(64));
  });

  it("sem cookie não há sessão e requireAdminSession manda para o login", async () => {
    expect(await hasValidAdminSession()).toBe(false);
    await expect(requireAdminSession()).rejects.toMatchObject({ url: "/acesso-7k2q" });
  });

  it("modo de visualização não dispensa o login", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_PREVIEW_MODE", "true");
    expect(await hasValidAdminSession()).toBe(false);
    await expect(requireAdminSession()).rejects.toMatchObject({ url: "/acesso-7k2q" });
  });

  it("setAdminSession grava cookie seguro que passa a valer como sessão", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await setAdminSession();
    const [name, , options] = setCookie.mock.calls[0];
    expect(name).toBe(ADMIN_SESSION_COOKIE);
    expect(options).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    expect(await hasValidAdminSession()).toBe(true);
    await expect(requireAdminSession()).resolves.toBeUndefined();
  });

  it("setAdminSession falha sem segredo configurado", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    await expect(setAdminSession()).rejects.toThrow("Configuração administrativa indisponível.");
  });

  it("clearAdminSession invalida o cookie", async () => {
    await setAdminSession();
    await clearAdminSession();
    const [, value, options] = setCookie.mock.calls.at(-1)!;
    expect(value).toBe("");
    expect(options).toMatchObject({ maxAge: 0, httpOnly: true, path: "/" });
    expect(await hasValidAdminSession()).toBe(false);
  });
});
