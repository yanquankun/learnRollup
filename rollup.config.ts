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
import { fileURLToPath } from "node:url";
import type { RenderedChunk } from "rollup";
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
logUtil.setup();

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
  plugins: [json(), typescript()],
};

const config = [
  {
    external: [
      ...commonConfig.external,
      fileURLToPath(new URL("common/common.ts", import.meta.url)),
    ],
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [].concat(commonConfig.plugins as any),
  },
  {
    external: commonConfig.external,
    input: "bundleA/index.ts",
    output: {
      file: "dist/bundleA.js",
      format: "es",
      sourcemap: true,
      // 添加bundle头部信息
      banner: (chunk: RenderedChunk) => {
        return `/* bundle version ${pkg.version} */`;
      },
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [].concat(commonConfig.plugins as any),
  },
];

export default config;
