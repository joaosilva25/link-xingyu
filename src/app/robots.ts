import type { MetadataRoute } from "next";

// Rotas do painel ficam fora daqui para não serem divulgadas; elas usam noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
  };
}
