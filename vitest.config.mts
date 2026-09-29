import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^.+\.(png|jpe?g|webp|svg)$/, replacement: path("./tests/mocks/image.ts") },
      { find: "server-only", replacement: path("./tests/mocks/empty.ts") },
      { find: /^@\//, replacement: `${path("./src")}/` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**",
        "src/proxy.ts",
        "src/app/admin/actions.ts",
        "src/app/login/actions.ts",
        "src/app/r/**",
        "src/app/media/**",
        "src/components/Card.tsx",
        "src/components/Links.tsx",
        "src/components/brand-mark.tsx",
      ],
      exclude: ["src/lib/admin-preview-*.ts"],
    },
  },
});
