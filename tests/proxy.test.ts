import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "@/proxy";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-session";

const SECRET = "s".repeat(64);

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie: `${ADMIN_SESSION_COOKIE}=${cookie}` } : {},
  });

describe("proxy de autenticação", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
  });

  it("protege o painel e subrotas, além do login", () => {
    expect(config.matcher).toEqual(["/gestao-7k2q/:path*", "/acesso-7k2q"]);
  });

  it.each(["/gestao-7k2q", "/gestao-7k2q/banners", "/gestao-7k2q/banners/novo", "/gestao-7k2q/programacoes"])(
    "redireciona %s para o login sem sessão",
    async (path) => {
      const response = await proxy(request(path));
      expect(response.status).toBe(307);
      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/acesso-7k2q");
      expect(location.searchParams.get("next")).toBe(path);
    },
  );

  it("redireciona para o login com cookie inválido", async () => {
    const response = await proxy(request("/gestao-7k2q", "forjado.assinatura"));
    expect(new URL(response.headers.get("location")!).pathname).toBe("/acesso-7k2q");
  });

  it("redireciona para o login com cookie assinado por outro segredo", async () => {
    const token = await createAdminSessionToken("o".repeat(64));
    const response = await proxy(request("/gestao-7k2q", token));
    expect(new URL(response.headers.get("location")!).pathname).toBe("/acesso-7k2q");
  });

  it("não libera o painel quando o segredo não está configurado", async () => {
    const token = await createAdminSessionToken(SECRET);
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    const response = await proxy(request("/gestao-7k2q", token));
    expect(new URL(response.headers.get("location")!).pathname).toBe("/acesso-7k2q");
  });

  it("não libera o painel sem sessão mesmo com ADMIN_PREVIEW_MODE=true em desenvolvimento", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_PREVIEW_MODE", "true");
    const response = await proxy(request("/gestao-7k2q"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/acesso-7k2q");
  });

  it("deixa passar com sessão válida", async () => {
    const token = await createAdminSessionToken(SECRET);
    const response = await proxy(request("/gestao-7k2q/banners", token));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("mostra o login para quem não tem sessão", async () => {
    const response = await proxy(request("/acesso-7k2q"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("manda quem já está logado do login para o painel", async () => {
    const token = await createAdminSessionToken(SECRET);
    const response = await proxy(request("/acesso-7k2q", token));
    expect(new URL(response.headers.get("location")!).pathname).toBe("/gestao-7k2q");
  });
});
