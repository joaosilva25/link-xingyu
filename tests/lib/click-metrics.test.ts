import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bannerRow, fakeDb } from "../helpers";
import type { Banner } from "@/types/banner";

let db = fakeDb();
const requireAdminSession = vi.fn(async () => {});

vi.mock("@/lib/db", () => ({ getDb: () => db.pool }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminSession }));

const { addClickCounts, getClickMetrics } = await import("@/lib/click-metrics");

describe("getClickMetrics", () => {
  beforeEach(() => {
    requireAdminSession.mockReset();
    vi.useFakeTimers({ toFake: ["Date"] });
    // 29/09 00:30 em São Paulo
    vi.setSystemTime(new Date("2026-09-29T03:30:00.000Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("usa o início do dia em São Paulo e monta a série completa", async () => {
    db = fakeDb([
      [{ today: "2", yesterday: "1", last7: "5", previous7: "0", last30: "9", previous30: "3", total: 12 }],
      [{ day: "2026-09-29", clicks: 2 }, { day: "2026-09-23", clicks: 3 }],
      [{ ...bannerRow(), clicks: 4 }],
    ]);
    const metrics = await getClickMetrics(7);

    expect(requireAdminSession).toHaveBeenCalledOnce();
    const [, totalsParams] = db.calls[0];
    expect((totalsParams![0] as Date).toISOString()).toBe("2026-09-29T03:00:00.000Z");
    expect((totalsParams![1] as Date).toISOString()).toBe("2026-09-30T03:00:00.000Z");
    expect((totalsParams![2] as Date).toISOString()).toBe("2026-09-28T03:00:00.000Z");

    expect(metrics).toMatchObject({
      today: 2,
      yesterday: 1,
      last7: 5,
      previous7: 0,
      last30: 9,
      previous30: 3,
      total: 12,
    });
    expect(metrics.series.map((point) => point.date)).toEqual([
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
    ]);
    expect(metrics.series.map((point) => point.clicks)).toEqual([3, 0, 0, 0, 0, 0, 2]);
    expect(metrics.ranking).toEqual([
      {
        id: bannerRow().id,
        internal_name: "Coleção Lunar",
        image_url: bannerRow().image_url,
        enabled: true,
        publish_at: null,
        unpublish_at: null,
        clicks: 4,
      },
    ]);
  });

  it.each([7, 30, 90] as const)("série tem %i dias", async (period) => {
    db = fakeDb([[{ today: 0, yesterday: 0, last7: 0, previous7: 0, last30: 0, previous30: 0, total: 0 }], [], []]);
    const metrics = await getClickMetrics(period);
    expect(metrics.series).toHaveLength(period);
    expect(new Set(metrics.series.map((point) => point.date)).size).toBe(period);
    expect(metrics.series.at(-1)?.date).toBe("2026-09-29");
  });

  it("não consulta sem sessão", async () => {
    db = fakeDb();
    requireAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT:/acesso-7k2q"));
    await expect(getClickMetrics(30)).rejects.toThrow("NEXT_REDIRECT");
    expect(db.calls).toHaveLength(0);
  });

  it("traduz erro do banco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db = fakeDb([new Error("down")]);
    await expect(getClickMetrics(30)).rejects.toThrow("Não foi possível carregar as métricas de clique.");
  });
});

describe("addClickCounts", () => {
  beforeEach(() => requireAdminSession.mockReset());

  it("soma os cliques por banner e usa zero quando não há", async () => {
    db = fakeDb([[{ banner_id: "a", click_count: "7" }]]);
    const banners = [{ id: "a" }, { id: "b" }] as Banner[];
    expect(await addClickCounts(banners)).toEqual([
      { id: "a", click_count: 7 },
      { id: "b", click_count: 0 },
    ]);
  });

  it("traduz erro do banco", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db = fakeDb([new Error("down")]);
    await expect(addClickCounts([])).rejects.toThrow("Não foi possível carregar os cliques dos banners.");
  });
});
