import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { redirectMock } from "../helpers";

let clientIp = "10.0.0.1";
const setAdminSession = vi.fn(async () => {});

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": `${clientIp}, 172.16.0.1` }),
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/admin-auth", () => ({ setAdminSession }));

const { login } = await import("@/app/acesso-7k2q/actions");

const PASSWORD = "senha-correta-123";
let passwordHash: string;

const form = (password: string, next = "/gestao-7k2q") => {
  const data = new FormData();
  data.set("password", password);
  data.set("next", next);
  return data;
};

describe("login", () => {
  beforeAll(async () => {
    passwordHash = await hash(PASSWORD, 4);
  });

  beforeEach((context) => {
    clientIp = `10.0.0.${Math.floor(Math.random() * 250) + 1}-${context.task.id}`;
    setAdminSession.mockClear();
    vi.stubEnv("ADMIN_PASSWORD_HASH", passwordHash);
    vi.stubEnv("ADMIN_SESSION_SECRET", "x".repeat(64));
  });

  it("entra com a senha correta e redireciona para o destino interno", async () => {
    await expect(login({ error: "" }, form(PASSWORD, "/gestao-7k2q/banners"))).rejects.toMatchObject({
      url: "/gestao-7k2q/banners",
    });
    expect(setAdminSession).toHaveBeenCalledOnce();
  });

  it("ignora destino externo depois do login", async () => {
    await expect(login({ error: "" }, form(PASSWORD, "https://evil.com"))).rejects.toMatchObject({
      url: "/gestao-7k2q",
    });
  });

  it("recusa senha errada sem criar sessão", async () => {
    expect(await login({ error: "" }, form("errada"))).toEqual({ error: "Senha incorreta." });
    expect(setAdminSession).not.toHaveBeenCalled();
  });

  it("recusa senha vazia", async () => {
    expect(await login({ error: "" }, form(""))).toEqual({ error: "Senha incorreta." });
    expect(setAdminSession).not.toHaveBeenCalled();
  });

  it("bloqueia após 8 tentativas erradas, mesmo com a senha certa", async () => {
    for (let attempt = 0; attempt < 8; attempt++)
      expect(await login({ error: "" }, form("errada"))).toEqual({ error: "Senha incorreta." });
    expect(await login({ error: "" }, form(PASSWORD))).toEqual({
      error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    });
    expect(setAdminSession).not.toHaveBeenCalled();
  });

  it("libera novamente depois da janela de 10 minutos", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      for (let attempt = 0; attempt < 8; attempt++) await login({ error: "" }, form("errada"));
      vi.setSystemTime(Date.now() + 10 * 60 * 1000 + 1);
      await expect(login({ error: "" }, form(PASSWORD))).rejects.toMatchObject({ url: "/gestao-7k2q" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("não deixa entrar quando o login não está configurado", async () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(await login({ error: "" }, form(PASSWORD))).toEqual({
      error: "Não foi possível entrar. Tente novamente mais tarde.",
    });
    vi.stubEnv("NODE_ENV", "development");
    expect(await login({ error: "" }, form(PASSWORD))).toEqual({
      error: "Configure ADMIN_PASSWORD_HASH e ADMIN_SESSION_SECRET.",
    });
    expect(setAdminSession).not.toHaveBeenCalled();
  });
});
