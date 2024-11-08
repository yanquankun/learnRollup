// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
/**
 * @link https://www.rollupjs.com/command-line-interface/#command-line-flags
 */
// rollup.config.js
// ---cut-start---
/** @type {import('rollup').RollupOptionsFunction} */
// ---cut-end---

/**
 * rollup.config.js
 * 如果你想异步创建配置文件，Rollup 也可以处理解析为对象或数组的 Promise
 * @code
 *    import fetch from 'node-fetch';
 *    export default fetch('/some-remote-service-which-returns-actual-config');
 * @code
 *    export default Promise.all([fetch('get-config-1'), fetch('get-config-2')]);
 */

import logUtil from "./util/log";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "node:fs";
// import { fileURLToPath } from "node:url";
import type { RenderedChunk } from "rollup";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
//====== start ======
// 与 Webpack 和 Browserify 等其他打包程序不同，Rollup 默认不会识别node_modules中的依赖
// resolve 识别node_modules中的依赖
import resolve from "@rollup/plugin-node-resolve";
// commonjs 转换未提供esm的依赖为cjs
import commonjs from "@rollup/plugin-commonjs";
//====== end ======

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const env = process.env.NODE_ENV || "development";
const isDev = env === "development";

logUtil.setup();

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
  plugins: [json(), typescript(), terser(), resolve()],
};

const baseConfig = [
  {
    external: commonConfig.external,
    input: "src/index.ts",
    output: {
      // file: "dist/src/index.js",
      dir: "dist/src",
      // 入口文件名，不包含后缀，使用file时不生效
      entryFileNames: isDev ? "[name].js" : "[name].[hash].js",
      format: "es",
      sourcemap: true,
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [del({ targets: "dist/*", runOnce: true })].concat(
      commonConfig.plugins as any[]
    ),
  },
  {
    // 需要排除在 bundle 外部的模块，对于lodash，我们需要打包在bundle内
    // 这个特性帮我们避免了内部bundle太过冗长的问题
    // 通过该声明，外部依赖会保持require或import的导入方式，我们需要声明给外界你要先引入该依赖
    external: ["tslib"],
    input: "bundleA/index.ts",
    output: {
      // 单文件打包使用file
      // file: "dist/bundleA.js",
      // 使用splitChunk后，使用dir
      dir: "dist/bundleA",
      entryFileNames: isDev ? "[name].js" : "[name].[hash].js",
      // chunk的文件名，如果在manualChunks也进行了设置，则会使用chunkFileNames的name加上manualChunks的name命名
      chunkFileNames: isDev ? "[name].js" : "[name].[hash].js",
      format: "es",
      sourcemap: true,
      // 添加bundle头部信息
      banner: (chunk: RenderedChunk) => {
        return `/* bundle version ${pkg.version} */`;
      },
      manualChunks: (
        id: string,
        moduleInfo: { getModuleInfo: any; getModuleIds: any }
      ) => {
        const { getModuleInfo, getModuleIds } = moduleInfo;
        // 对common进行单独分包
        if (id.includes("/common/common")) {
          return "vendor";
        }
        // 对于lodash，通过构建工具，我们仍可以通过import方式引入
        // 原因是（Webpack、Rollup）会使用插件（如 @rollup/plugin-commonjs、Webpack 的内置 CommonJS 兼容功能）将 CommonJS 模块转换为 ESM 格式
        if (id.includes("/lodash.js")) {
          return "lodash";
        }
      },
    },
    watch: {
      ...commonConfig.watch,
    },
    // commonjs plugin：一些库会暴露出 ES 模块，你可以直接导入它们，但是目前，大多数 NPM 上的包都以 CommonJS 模块的方式暴露。在这种情况下，我们需要在 Rollup 处理它们之前将 CommonJS 转换为 ES2015
    plugins: [commonjs()].concat(commonConfig.plugins as any),
  },
];

export default baseConfig;
