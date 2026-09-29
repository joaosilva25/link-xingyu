import { describe, expect, it, vi } from "vitest";
import type { RowDataPacket } from "mysql2/promise";
import { getDb, toBanner } from "@/lib/db";
import { bannerRow } from "../helpers";

describe("toBanner", () => {
  it("converte booleanos, números e datas do MySQL", () => {
    const banner = toBanner(
      bannerRow({
        enabled: 0,
        open_new_tab: 1,
        sort_order: "3",
        publish_at: new Date("2026-10-01T13:00:00.000Z"),
      }) as unknown as RowDataPacket,
    );
    expect(banner).toMatchObject({
      enabled: false,
      open_new_tab: true,
      sort_order: 3,
      publish_at: "2026-10-01T13:00:00.000Z",
      unpublish_at: null,
      deleted_at: null,
      created_at: "2026-09-01T12:00:00.000Z",
      updated_at: "2026-09-02T12:00:00.000Z",
    });
  });
});

describe("getDb", () => {
  it("falha quando DATABASE_URL não está definida", () => {
    vi.stubEnv("DATABASE_URL", "");
    globalThis.__linkbioPool = undefined;
    expect(() => getDb()).toThrow("Banco de dados não configurado.");
  });

  it("reutiliza o mesmo pool entre chamadas", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://u:p@127.0.0.1:1/db");
    globalThis.__linkbioPool = undefined;
    const pool = getDb();
    expect(getDb()).toBe(pool);
    await pool.end();
    globalThis.__linkbioPool = undefined;
  });
});
