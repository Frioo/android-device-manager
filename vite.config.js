import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import svelteSVG from "vite-plugin-svelte-svg";
import sveltePreprocess from "svelte-preprocess";
import path from "path";

const mode = Object.freeze({
  dev: "development",
  prod: "production",
});

const root = process.cwd();

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  root: root,
  resolve: {
    alias: {
      "@lib": path.resolve(root, "src", "lib"),
      "@js": path.resolve(root, "src", "lib", "js"),
      "@routes": path.resolve(root, "src", "routes"),
      "@assets": path.resolve(root, "src", "assets"),
      "@styles": path.resolve(root, "src", "styles"),
    },
    extensions: [".mjs", ".js", ".ts", ".tsx", ".json", ".scss", ".css"],
  },
  plugins: [
    svelteSVG({
      svgoConfig: {}, // See https://github.com/svg/svgo#configuration
    }),
    svelte({
      compilerOptions: {
        accessors: true,
      },
      preprocess: sveltePreprocess({
        sourceMap: mode === mode.dev,
      }),
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ["src/theme", "node_modules", "src/styles"],
      },
    },
  },
}));
