import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeDb, redirectMock } from "../helpers";

let db = fakeDb();
const requireAdminSession = vi.fn(async () => {});
const clearAdminSession = vi.fn(async () => {});
const revalidatePath = vi.fn();

vi.mock("@/lib/db", () => ({ getDb: () => db.pool }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminSession, clearAdminSession }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const actions = await import("@/app/gestao-7k2q/actions");

const IMAGE = new File([new Uint8Array([137, 80, 78, 71])], "arte.png", { type: "image/png" });

function bannerForm(fields: Record<string, string | File> = {}) {
  const data = new FormData();
  const defaults: Record<string, string | File> = {
    internal_name: "Coleção Lunar",
    destination_url: "https://www.xingyu.com.br",
    alt_text: "Lunar",
    enabled: "on",
    open_new_tab: "on",
    publish_at: "",
    unpublish_at: "",
    ...fields,
  };
  for (const [key, value] of Object.entries(defaults)) data.set(key, value);
  return data;
}

const sqlOf = () => db.calls.map(([sql]) => sql);

beforeEach(() => {
  requireAdminSession.mockReset();
  revalidatePath.mockClear();
  redirectMock.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("proteção das ações", () => {
  it.each([
    ["saveBanner", () => actions.saveBanner(bannerForm({ image: IMAGE }))],
    ["toggleBanner", () => actions.toggleBanner("id", true)],
    ["duplicateBanner", () => actions.duplicateBanner("id")],
    ["deleteBanner", () => actions.deleteBanner("id")],
    ["reorderBanners", () => actions.reorderBanners(["a", "b"])],
  ])("%s não toca no banco sem sessão", async (_name, run) => {
    db = fakeDb();
    requireAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT:/acesso-7k2q"));
    await expect(run()).rejects.toThrow("NEXT_REDIRECT:/acesso-7k2q");
    expect(db.calls).toHaveLength(0);
  });
});

describe("saveBanner", () => {
  it("cria banner com imagem salva no banco e redireciona", async () => {
    db = fakeDb([[], [{ last: 3 }], []]);
    await expect(actions.saveBanner(bannerForm({ image: IMAGE }))).rejects.toMatchObject({
      url: "/gestao-7k2q/banners?saved=created",
    });

    const [imageSql, imageParams] = db.calls[0];
    expect(imageSql).toContain("INSERT INTO banner_images");
    expect(imageParams![1]).toBe("image/png");
    expect(Buffer.isBuffer(imageParams![2])).toBe(true);

    const [insertSql, insertParams] = db.calls[2];
    expect(insertSql).toContain("INSERT INTO banners");
    expect(insertParams).toEqual([
      expect.any(String),
      "Coleção Lunar",
      `/media/${imageParams![0]}`,
      imageParams![0],
      "https://www.xingyu.com.br",
      "Lunar",
      true,
      true,
      null,
      null,
      4,
      expect.any(Date),
      expect.any(Date),
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/gestao-7k2q/banners");
  });

  it("primeiro banner recebe ordem 0", async () => {
    db = fakeDb([[], [{ last: null }], []]);
    await expect(actions.saveBanner(bannerForm({ image: IMAGE }))).rejects.toMatchObject({
      url: "/gestao-7k2q/banners?saved=created",
    });
    expect(db.calls[2][1]![10]).toBe(0);
  });

  it("converte datas do formulário do horário de São Paulo para UTC", async () => {
    db = fakeDb([[], [{ last: 0 }], []]);
    await expect(
      actions.saveBanner(
        bannerForm({ image: IMAGE, publish_at: "2026-10-01T09:00", unpublish_at: "2026-10-02T21:30" }),
      ),
    ).rejects.toMatchObject({ url: "/gestao-7k2q/banners?saved=created" });
    const params = db.calls[2][1]!;
    expect((params[8] as Date).toISOString()).toBe("2026-10-01T12:00:00.000Z");
    expect((params[9] as Date).toISOString()).toBe("2026-10-03T00:30:00.000Z");
  });

  it("exige imagem ao criar", async () => {
    db = fakeDb();
    await expect(actions.saveBanner(bannerForm())).rejects.toThrow("Selecione uma imagem.");
    expect(db.calls).toHaveLength(0);
  });

  it("recusa imagem acima de 8 MB", async () => {
    db = fakeDb();
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "grande.png", { type: "image/png" });
    await expect(actions.saveBanner(bannerForm({ image: big }))).rejects.toThrow(
      "A imagem deve ter no máximo 8 MB.",
    );
    expect(db.calls).toHaveLength(0);
  });

  it("recusa formato de imagem não suportado", async () => {
    db = fakeDb();
    const svg = new File(["<svg/>"], "x.svg", { type: "image/svg+xml" });
    await expect(actions.saveBanner(bannerForm({ image: svg }))).rejects.toThrow(
      "Envie PNG, JPG, WEBP ou AVIF.",
    );
    expect(db.calls).toHaveLength(0);
  });

  it("recusa campos inválidos antes de gravar", async () => {
    db = fakeDb();
    await expect(
      actions.saveBanner(bannerForm({ image: IMAGE, destination_url: "javascript:alert(1)" })),
    ).rejects.toThrow("Use uma URL com http:// ou https://.");
    expect(db.calls).toHaveLength(0);
  });

  it("informa falha no envio da imagem", async () => {
    db = fakeDb([new Error("packet too large")]);
    await expect(actions.saveBanner(bannerForm({ image: IMAGE }))).rejects.toThrow(
      "Não foi possível enviar a imagem. Tente novamente.",
    );
  });

  it("remove a imagem enviada se a gravação do banner falhar", async () => {
    db = fakeDb([[], [{ last: 0 }], new Error("duplicate"), []]);
    await expect(actions.saveBanner(bannerForm({ image: IMAGE }))).rejects.toThrow(
      "Não foi possível criar o banner. Tente novamente.",
    );
    const imageId = db.calls[0][1]![0];
    expect(db.calls[3]).toEqual(["DELETE FROM banner_images WHERE id = ?", [imageId]]);
  });

  it("atualiza mantendo a imagem existente", async () => {
    db = fakeDb([[]]);
    await expect(
      actions.saveBanner(
        bannerForm({ id: "b1", existing_image_url: "/media/old", existing_image_path: "old" }),
      ),
    ).rejects.toMatchObject({ url: "/gestao-7k2q/banners?saved=updated" });
    expect(db.calls).toHaveLength(1);
    const [sql, params] = db.calls[0];
    expect(sql).toContain("UPDATE banners SET");
    expect(params!.slice(1, 3)).toEqual(["/media/old", "old"]);
    expect(params!.at(-1)).toBe("b1");
  });

  it("ao trocar a imagem apaga a antiga quando nenhum outro banner a usa", async () => {
    db = fakeDb([[], [], [{ total: 0 }], []]);
    await expect(
      actions.saveBanner(
        bannerForm({ id: "b1", existing_image_url: "/media/old", existing_image_path: "old", image: IMAGE }),
      ),
    ).rejects.toMatchObject({ url: "/gestao-7k2q/banners?saved=updated" });
    expect(db.calls[2][1]).toEqual(["old", "b1"]);
    expect(db.calls[3]).toEqual(["DELETE FROM banner_images WHERE id = ?", ["old"]]);
  });

  it("ao trocar a imagem preserva a antiga se uma cópia ainda a usa", async () => {
    db = fakeDb([[], [], [{ total: 1 }]]);
    await expect(
      actions.saveBanner(
        bannerForm({ id: "b1", existing_image_url: "/media/old", existing_image_path: "old", image: IMAGE }),
      ),
    ).rejects.toMatchObject({ url: "/gestao-7k2q/banners?saved=updated" });
    expect(sqlOf().some((sql) => sql.startsWith("DELETE"))).toBe(false);
  });

  it("informa falha ao salvar alterações", async () => {
    db = fakeDb([new Error("down")]);
    await expect(
      actions.saveBanner(bannerForm({ id: "b1", existing_image_url: "/media/old" })),
    ).rejects.toThrow("Não foi possível salvar as alterações. Tente novamente.");
  });
});

describe("toggleBanner", () => {
  it("ativa/desativa e atualiza as páginas", async () => {
    db = fakeDb([[]]);
    await actions.toggleBanner("b1", false);
    expect(db.calls[0][0]).toContain("UPDATE banners SET enabled = ?");
    expect(db.calls[0][1]).toEqual([false, expect.any(Date), "b1"]);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("traduz erro do banco", async () => {
    db = fakeDb([new Error("down")]);
    await expect(actions.toggleBanner("b1", true)).rejects.toThrow(
      "Não foi possível alterar o banner. Tente novamente.",
    );
  });
});

describe("duplicateBanner", () => {
  it("cria cópia desativada no fim da lista, reaproveitando a imagem", async () => {
    db = fakeDb([
      [{ internal_name: "Lunar", image_url: "/media/i", image_path: "i", destination_url: "https://x.com", alt_text: null, publish_at: null, unpublish_at: null, open_new_tab: 1 }],
      [{ last: 2 }],
      [],
    ]);
    await actions.duplicateBanner("b1");
    const [sql, params] = db.calls[2];
    expect(sql).toContain("VALUES (?, ?, ?, ?, ?, ?, 0,");
    expect(params!.slice(1, 4)).toEqual(["Lunar — cópia", "/media/i", "i"]);
    expect(params![9]).toBe(3);
  });

  it("falha se o banner não existe", async () => {
    db = fakeDb([[]]);
    await expect(actions.duplicateBanner("x")).rejects.toThrow("Banner não encontrado.");
  });

  it("traduz erro ao inserir a cópia", async () => {
    db = fakeDb([[{ internal_name: "L" }], [{ last: 0 }], new Error("down")]);
    await expect(actions.duplicateBanner("b1")).rejects.toThrow("Não foi possível duplicar o banner.");
  });
});

describe("deleteBanner", () => {
  it("faz exclusão lógica e desativa", async () => {
    db = fakeDb([[]]);
    await actions.deleteBanner("b1");
    expect(db.calls[0][0]).toContain("SET deleted_at = ?, enabled = 0");
    expect(db.calls[0][1]![2]).toBe("b1");
  });

  it("traduz erro do banco", async () => {
    db = fakeDb([new Error("down")]);
    await expect(actions.deleteBanner("b1")).rejects.toThrow("Não foi possível excluir o banner.");
  });
});

describe("reorderBanners", () => {
  it("grava a nova ordem numa transação", async () => {
    db = fakeDb([{ affectedRows: 1 } as never, { affectedRows: 1 } as never]);
    await actions.reorderBanners(["b", "a"]);
    expect(db.connection.beginTransaction).toHaveBeenCalled();
    expect(db.calls.map(([, params]) => [params![0], params![2]])).toEqual([
      [0, "b"],
      [1, "a"],
    ]);
    expect(db.connection.commit).toHaveBeenCalled();
    expect(db.connection.release).toHaveBeenCalled();
  });

  it("desfaz tudo se algum banner não existir", async () => {
    db = fakeDb([{ affectedRows: 1 } as never, { affectedRows: 0 } as never]);
    await expect(actions.reorderBanners(["a", "sumiu"])).rejects.toThrow(
      "Não foi possível salvar a nova ordem.",
    );
    expect(db.connection.rollback).toHaveBeenCalled();
    expect(db.connection.commit).not.toHaveBeenCalled();
    expect(db.connection.release).toHaveBeenCalled();
  });

  it.each([[[]], [["a", "a"]]])("recusa ordem inválida %j", async (ids) => {
    db = fakeDb();
    await expect(actions.reorderBanners(ids)).rejects.toThrow("A ordem enviada é inválida.");
    expect(db.pool.getConnection).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("limpa a sessão e volta para o login", async () => {
    await expect(actions.logout()).rejects.toMatchObject({ url: "/acesso-7k2q" });
    expect(clearAdminSession).toHaveBeenCalled();
  });
});
