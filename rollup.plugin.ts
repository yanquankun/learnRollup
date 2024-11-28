import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "node:fs";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const env = process.env.NODE_ENV || "development";
const isDev = env === "development";

export default {
  external: Object.keys(pkg.dependencies),
  input: "plugin/html-rollup-plugin.ts",
  output: {
    dir: "plugin/html-rollup-plugin/",
    entryFileNames: "[name].js",
    format: "cjs",
    sourcemap: isDev,
  },
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
  plugins: [
    resolve(),
    commonjs(),
    del({ targets: "dist/*", runOnce: true }),
    json(),
    typescript(),
    terser(),
  ],
  onwarn(warning: { code: string }, warn: (warning: { code: string }) => void) {
    if (warning.code === "CIRCULAR_DEPENDENCY") {
      return; // 忽略循环依赖警告
    }
    warn(warning); // 对其他警告进行正常处理
  },
};
