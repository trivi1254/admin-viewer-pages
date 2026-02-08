import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path"; // Si aquí sale error, es por falta de @types/node

export default defineConfig({
  base: "/admin-viewer-pages/",   // ← MUY IMPORTANTE (nombre del repositorio)
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Esto conecta tus carpetas con el símbolo @
    },
  },
});