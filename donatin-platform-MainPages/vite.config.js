import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const detailPages = [
  "projects",
  "project",
  "items",
  "cart",
  "how",
  "receipt",
  "login",
  "menu",
  "homepage-intro",
  "operations",
  "feedback",
];

const detailInputs = Object.fromEntries(
  detailPages.map((page) => [
    `detail-${page}`,
    fileURLToPath(new URL(`./detail/${page}.html`, import.meta.url)),
  ]),
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        ...detailInputs,
      },
    },
  },
});
