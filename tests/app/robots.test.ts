import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  it("não divulga as rotas do painel e do login", () => {
    const text = JSON.stringify(robots());
    expect(text).not.toMatch(/gestao|acesso|admin|login/);
  });
});
