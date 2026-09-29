import { describe, expect, it } from "vitest";
import { bannerStatus, formatDate, safeAdminPath } from "@/lib/banners";
import type { Banner } from "@/types/banner";

const NOW = new Date("2026-09-29T12:00:00.000Z");
const banner = (overrides: Partial<Banner> = {}): Banner => ({
  id: "1",
  internal_name: "Teste",
  image_url: "/media/1",
  image_path: "1",
  destination_url: null,
  alt_text: null,
  sort_order: 0,
  enabled: true,
  publish_at: null,
  unpublish_at: null,
  open_new_tab: false,
  created_at: NOW.toISOString(),
  updated_at: NOW.toISOString(),
  deleted_at: null,
  ...overrides,
});

describe("bannerStatus", () => {
  it("publicado quando ativo e sem janela", () => {
    expect(bannerStatus(banner(), NOW)).toBe("published");
  });
  it("oculto quando desativado, mesmo dentro da janela", () => {
    expect(bannerStatus(banner({ enabled: false }), NOW)).toBe("hidden");
  });
  it("programado quando a entrada é futura", () => {
    expect(bannerStatus(banner({ publish_at: "2026-09-30T00:00:00Z" }), NOW)).toBe("scheduled");
  });
  it("encerrado quando a saída já passou", () => {
    expect(bannerStatus(banner({ unpublish_at: "2026-09-29T11:59:59Z" }), NOW)).toBe("ended");
  });
  it("encerra exatamente no horário de saída", () => {
    expect(bannerStatus(banner({ unpublish_at: NOW.toISOString() }), NOW)).toBe("ended");
  });
  it("publicado dentro da janela", () => {
    expect(
      bannerStatus(
        banner({ publish_at: "2026-09-01T00:00:00Z", unpublish_at: "2026-10-01T00:00:00Z" }),
        NOW,
      ),
    ).toBe("published");
  });
});

describe("formatDate", () => {
  it("formata no fuso de São Paulo", () => {
    expect(formatDate("2026-09-29T03:30:00.000Z")).toBe("29/09/2026, 00:30");
  });
  it("retorna null sem data", () => {
    expect(formatDate(null)).toBeNull();
  });
});

describe("safeAdminPath", () => {
  it.each([
    ["/gestao-7k2q", "/gestao-7k2q"],
    ["/gestao-7k2q/banners", "/gestao-7k2q/banners"],
    ["/gestao-7k2q?period=7", "/gestao-7k2q?period=7"],
  ])("mantém caminho interno %s", (input, expected) => {
    expect(safeAdminPath(input)).toBe(expected);
  });

  it.each([
    null,
    "",
    "/",
    "/acesso-7k2q",
    "/admin",
    "/gestao-7k2qx",
    "https://evil.com/admin",
    "//evil.com/admin",
    "/gestao-7k2q\\@evil.com",
    "/gestao-7k2q/x:y",
  ])("bloqueia redirecionamento para %s", (input) => {
    expect(safeAdminPath(input)).toBe("/gestao-7k2q");
  });
});
