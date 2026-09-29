import { beforeEach, describe, expect, it, vi } from "vitest";
import { bannerRow, fakeDb } from "../helpers";

let db = fakeDb();
const requireAdminSession = vi.fn(async () => {});

vi.mock("@/lib/db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db")>()),
  getDb: () => db.pool,
}));
vi.mock("@/lib/admin-auth", () => ({ requireAdminSession }));

const { getAllBanners, getBannerById, getPublicBanners } = await import("@/lib/banner-queries");

describe("banner-queries", () => {
  beforeEach(() => {
    requireAdminSession.mockReset();
    vi.stubEnv("DATABASE_URL", "mysql://u:p@h:1/db");
  });

  it("getAllBanners exige sessão e ignora excluídos", async () => {
    db = fakeDb([[bannerRow(), bannerRow({ id: "2", sort_order: 1 })]]);
    const banners = await getAllBanners();
    expect(requireAdminSession).toHaveBeenCalledOnce();
    expect(banners.map((banner) => banner.id)).toEqual([bannerRow().id, "2"]);
    expect(db.calls[0][0]).toContain("WHERE deleted_at IS NULL ORDER BY sort_order");
  });

  it("getAllBanners não consulta o banco sem sessão", async () => {
    db = fakeDb();
    requireAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT:/acesso-7k2q"));
    await expect(getAllBanners()).rejects.toThrow("NEXT_REDIRECT:/acesso-7k2q");
    expect(db.calls).toHaveLength(0);
  });

  it("getAllBanners traduz erro do banco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db = fakeDb([new Error("ECONNREFUSED")]);
    await expect(getAllBanners()).rejects.toThrow("Não foi possível carregar os banners.");
  });

  it("getBannerById retorna o banner ou null", async () => {
    db = fakeDb([[bannerRow()], []]);
    expect((await getBannerById("x"))?.internal_name).toBe("Coleção Lunar");
    expect(await getBannerById("y")).toBeNull();
    expect(db.calls[0][1]).toEqual(["x"]);
    expect(requireAdminSession).toHaveBeenCalledTimes(2);
  });

  it("getPublicBanners filtra ativos dentro da janela sem exigir sessão", async () => {
    db = fakeDb([[bannerRow()]]);
    const banners = await getPublicBanners();
    expect(banners).toHaveLength(1);
    expect(requireAdminSession).not.toHaveBeenCalled();
    const [sql, params] = db.calls[0];
    expect(sql).toContain("enabled = 1 AND deleted_at IS NULL");
    expect(sql).toContain("(publish_at IS NULL OR publish_at <= ?)");
    expect(sql).toContain("(unpublish_at IS NULL OR unpublish_at > ?)");
    expect(params).toHaveLength(2);
    expect(params![0]).toBeInstanceOf(Date);
  });

  it("getPublicBanners devolve lista vazia sem banco configurado", async () => {
    vi.stubEnv("DATABASE_URL", "");
    db = fakeDb();
    expect(await getPublicBanners()).toEqual([]);
    expect(db.calls).toHaveLength(0);
  });

  it("getPublicBanners traduz erro do banco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db = fakeDb([new Error("timeout")]);
    await expect(getPublicBanners()).rejects.toThrow("Não foi possível carregar esta Link Bio.");
  });
});
