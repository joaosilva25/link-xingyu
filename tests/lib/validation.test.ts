import { describe, expect, it } from "vitest";
import { bannerSchema } from "@/lib/validation";

const valid = {
  internal_name: "Coleção Lunar",
  destination_url: "https://www.xingyu.com.br",
  alt_text: "Banner",
  enabled: true,
  open_new_tab: true,
  publish_at: "",
  unpublish_at: "",
};

const firstError = (input: Record<string, unknown>) => {
  const result = bannerSchema.safeParse(input);
  return result.success ? null : result.error.issues[0]?.message;
};

describe("bannerSchema", () => {
  it("aceita um banner válido", () => {
    expect(bannerSchema.safeParse(valid).success).toBe(true);
  });

  it("aceita destino vazio", () => {
    expect(bannerSchema.safeParse({ ...valid, destination_url: "" }).success).toBe(true);
  });

  it("exige nome com ao menos 2 caracteres", () => {
    expect(firstError({ ...valid, internal_name: " a " })).toBe("Informe o nome interno.");
  });

  it.each(["javascript:alert(1)", "ftp://x.com", "xingyu.com.br", "data:text/html,oi"])(
    "recusa destino %s",
    (destination_url) => {
      expect(firstError({ ...valid, destination_url })).toBe("Use uma URL com http:// ou https://.");
    },
  );

  it("limita o texto alternativo a 180 caracteres", () => {
    expect(firstError({ ...valid, alt_text: "x".repeat(181) })).toBe("Use até 180 caracteres.");
  });

  it("exige saída depois da entrada", () => {
    expect(
      firstError({ ...valid, publish_at: "2026-10-02T10:00", unpublish_at: "2026-10-01T10:00" }),
    ).toBe("A data de encerramento precisa ser posterior à data de publicação.");
  });

  it("aceita janela válida", () => {
    expect(
      bannerSchema.safeParse({
        ...valid,
        publish_at: "2026-10-01T10:00",
        unpublish_at: "2026-10-02T10:00",
      }).success,
    ).toBe(true);
  });
});
