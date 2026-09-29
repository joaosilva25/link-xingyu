import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeDb } from "../helpers";

let db = fakeDb();
vi.mock("@/lib/db", () => ({ getDb: () => db.pool }));

const { GET: redirectRoute } = await import("@/app/r/[id]/route");
const { GET: mediaRoute } = await import("@/app/media/[id]/route");

const IMAGE_ID = "5bc93110-e6c0-4033-b4a1-51d2c8f367d3";
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /r/[id]", () => {
  const click = () =>
    redirectRoute(
      new Request("http://localhost/r/b1", {
        headers: { referer: "https://instagram.com/", "user-agent": "x".repeat(900) },
      }),
      params("b1"),
    );

  it("registra o clique e redireciona para o destino", async () => {
    db = fakeDb([[{ id: "b1", destination_url: "https://www.xingyu.com.br/lunar" }], []]);
    const response = await click();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://www.xingyu.com.br/lunar");
    const [sql, values] = db.calls[1];
    expect(sql).toContain("INSERT INTO banner_clicks");
    expect(values![0]).toBe("b1");
    expect(values![2]).toBe("https://instagram.com/");
    expect((values![3] as string).length).toBe(500);
  });

  it("só redireciona banners ativos, não excluídos e dentro da janela", async () => {
    db = fakeDb([[{ id: "b1", destination_url: "https://x.com" }], []]);
    await click();
    const [sql, values] = db.calls[0];
    expect(sql).toContain("enabled = 1 AND deleted_at IS NULL");
    expect(sql).toContain("publish_at <= ?");
    expect(sql).toContain("unpublish_at > ?");
    expect(values![0]).toBe("b1");
  });

  it("404 quando o banner não existe ou não está no ar", async () => {
    db = fakeDb([[]]);
    expect((await click()).status).toBe(404);
    expect(db.calls).toHaveLength(1);
  });

  it("404 quando o banner não tem destino", async () => {
    db = fakeDb([[{ id: "b1", destination_url: null }]]);
    expect((await click()).status).toBe(404);
  });

  it("404 para destino com protocolo perigoso", async () => {
    db = fakeDb([[{ id: "b1", destination_url: "javascript:alert(1)" }]]);
    expect((await click()).status).toBe(404);
  });

  it("404 quando o banco falha na consulta", async () => {
    db = fakeDb([new Error("down")]);
    expect((await click()).status).toBe(404);
  });

  it("ainda redireciona se só o registro do clique falhar", async () => {
    db = fakeDb([[{ id: "b1", destination_url: "https://x.com/" }], new Error("insert failed")]);
    const response = await click();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://x.com/");
  });
});

describe("GET /media/[id]", () => {
  it("serve a imagem com tipo e cache corretos", async () => {
    db = fakeDb([[{ content_type: "image/png", data: Buffer.from([1, 2, 3]) }]]);
    const response = await mediaRoute(new Request("http://localhost"), params(IMAGE_ID));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(db.calls[0][1]).toEqual([IMAGE_ID]);
  });

  it.each(["abc", "../../etc/passwd", `${IMAGE_ID}' OR 1=1 --`])(
    "recusa id inválido %s sem consultar o banco",
    async (id) => {
      db = fakeDb();
      expect((await mediaRoute(new Request("http://localhost"), params(id))).status).toBe(404);
      expect(db.calls).toHaveLength(0);
    },
  );

  it("404 quando a imagem não existe", async () => {
    db = fakeDb([[]]);
    expect((await mediaRoute(new Request("http://localhost"), params(IMAGE_ID))).status).toBe(404);
  });

  it("404 quando o banco falha", async () => {
    db = fakeDb([new Error("down")]);
    expect((await mediaRoute(new Request("http://localhost"), params(IMAGE_ID))).status).toBe(404);
  });
});
