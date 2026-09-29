import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "server/**",
    "api/**",
    "lib/**",
    "dist/**",
    "src/App.tsx",
    "src/main.tsx",
    "src/hooks/**",
    "src/config/**",
    "src/legacy/**",
  ]),
]);

export default eslintConfig;
