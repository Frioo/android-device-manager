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
      "@lib": path.join(root, "src/lib"),
      "@js": path.join(root, "src/lib/js"),
      "@routes": path.join(root, "src/routes"),
      "@assets": path.join(root, "src/assets"),
      "@styles": path.join(root, "src/styles"),
    },
  },
  plugins: [
    svelteSVG({
      svgoConfig: {}, // See https://github.com/svg/svgo#configuration
    }),
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: mode === mode.dev,
      }),
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ["src/theme/", "node_modules/"],
      },
    },
  },
}));
