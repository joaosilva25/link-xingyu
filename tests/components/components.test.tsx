// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Card from "@/components/Card";
import Links from "@/components/Links";
import { BrandMark } from "@/components/brand-mark";
import type { Banner } from "@/types/banner";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

const banner = (overrides: Partial<Banner>): Banner => ({
  id: "b1",
  internal_name: "Coleção Lunar",
  image_url: "/media/img-1",
  image_path: "img-1",
  destination_url: "https://www.xingyu.com.br",
  alt_text: "Lunar",
  sort_order: 0,
  enabled: true,
  publish_at: null,
  unpublish_at: null,
  open_new_tab: true,
  created_at: "",
  updated_at: "",
  deleted_at: null,
  ...overrides,
});

describe("BrandMark", () => {
  it("mostra o logo da Xingyu, sem o placeholder", () => {
    render(<BrandMark />);
    const logo = screen.getByRole("img", { name: "Xingyu" });
    expect(logo.getAttribute("src")).toBe("/test-image.png");
    expect(logo.getAttribute("width")).toBe("72");
    expect(document.body.textContent).not.toContain("LOGO ORIGINAL");
  });

  it("versão compacta é menor e mantém a proporção", () => {
    render(<BrandMark compact />);
    const logo = screen.getByRole("img", { name: "Xingyu" });
    expect(logo.getAttribute("width")).toBe("46");
    expect(logo.getAttribute("height")).toBe(String(Math.round((46 * 420) / 520)));
  });
});

describe("Card", () => {
  it("com link vira âncora em nova aba", () => {
    render(<Card imageSrc="/a.png" link="https://x.com" label="Ir" />);
    const link = screen.getByRole("link", { name: "Ir" });
    expect(link.getAttribute("href")).toBe("https://x.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.style.backgroundImage).toContain("/a.png");
  });

  it("mostra imagem cujo caminho tem espaços (ex.: BANNER 10.png)", () => {
    render(<Card imageSrc="/_next/static/media/BANNER 10.abc.png" id="falar-com-consultora" />);
    expect(screen.getByRole("button").style.backgroundImage).toBe(
      'url("/_next/static/media/BANNER 10.abc.png")',
    );
  });

  it("respeita abrir na mesma aba", () => {
    render(<Card imageSrc="/a.png" link="/r/1" newTab={false} label="Ir" />);
    const link = screen.getByRole("link", { name: "Ir" });
    expect(link.getAttribute("target")).toBeNull();
    expect(link.getAttribute("rel")).toBeNull();
  });

  it("sem link e com id vira botão acessível do popup", () => {
    render(<Card imageSrc="/a.png" id="falar-com-consultora" />);
    const button = screen.getByRole("button");
    expect(button.id).toBe("falar-com-consultora");
    expect(button.getAttribute("tabindex")).toBe("0");
  });

  it("Enter e espaço abrem o popup pelo teclado; outras teclas não", () => {
    render(<Card imageSrc="/a.png" id="falar-com-consultora" />);
    const button = screen.getByRole("button");
    let clicks = 0;
    button.addEventListener("click", () => clicks++);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(button, { key: "a" });
    expect(clicks).toBe(2);
  });

  it("card decorativo sem id nem link não reage ao teclado", () => {
    render(<Card imageSrc="/a.png" label="Arte" />);
    const card = screen.getByLabelText("Arte");
    expect(card.getAttribute("role")).toBeNull();
    let clicks = 0;
    card.addEventListener("click", () => clicks++);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(clicks).toBe(0);
  });
});

describe("Links", () => {
  it("usa os banners do painel com link rastreado /r/[id] e o card da consultora no fim", () => {
    render(
      <Links
        banners={[
          banner({}),
          banner({ id: "b2", internal_name: "Sem destino", destination_url: null, alt_text: null }),
          banner({ id: "b3", internal_name: "Mesma aba", open_new_tab: false, alt_text: null }),
        ]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/r/b1", "/r/b3"]);
    expect(links[1].getAttribute("target")).toBeNull();
    expect(screen.getByLabelText("Sem destino").tagName).toBe("DIV");
    const cards = document.querySelectorAll("#links > div > *");
    expect(cards[cards.length - 1].id).toBe("falar-com-consultora");
  });

  it("com o painel vazio mostra só o card da consultora", () => {
    render(<Links banners={[]} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByRole("button").id).toBe("falar-com-consultora");
  });

  it("sem banco configurado usa os banners fixos atuais, com a Lunar primeiro", () => {
    render(<Links />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toHaveLength(4);
    expect(hrefs[0]).toContain("colecao-lunar");
    expect(hrefs[1]).toContain("ab.xingyujewelry.com.br");
    expect(hrefs[2]).toBe("https://www.xingyu.com.br");
    expect(hrefs[3]).toBe("https://vip.xingyujewelry.com.br/");
  });

  it("carrega o script do popup de consultoras uma única vez", () => {
    const { unmount } = render(<Links banners={[]} />);
    unmount();
    render(<Links banners={[]} />);
    const scripts = document.querySelectorAll('script[src="/xingyu-consultoras/embed/xingyu-popup.js"]');
    expect(scripts).toHaveLength(1);
    const script = scripts[0] as HTMLScriptElement;
    expect(script.dataset.trigger).toBe("#falar-com-consultora");
    expect(script.dataset.apiUrl).toBe("/xingyu-consultoras");
    expect(document.getElementById("xingyu-consultant-popup-center")).not.toBeNull();
  });
});
