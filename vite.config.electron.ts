import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Note: Install these packages locally to use Electron:
// npm install -D electron electron-builder vite-plugin-electron vite-plugin-electron-renderer
// import electron from "vite-plugin-electron";
// import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uncomment when Electron packages are installed:
    /*
    electron([
      {
        entry: "electron/main.ts",
        onstart: (options) => {
          if (options.startup) {
            options.startup();
          }
        },
        vite: {
          build: {
            sourcemap: false,
            minify: process.env.NODE_ENV === "production",
            outDir: "dist-electron/main",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        vite: {
          build: {
            sourcemap: false,
            minify: process.env.NODE_ENV === "production",
            outDir: "dist-electron/preload",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
    renderer(),
    */
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // Important for Electron
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});