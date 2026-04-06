import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cria o adaptador para ler as regras clássicas do Next.js
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Aplica as regras do Next.js e TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Suas regras de pastas ignoradas
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];

export default eslintConfig;
