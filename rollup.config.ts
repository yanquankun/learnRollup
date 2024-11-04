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
logUtil.setup();

const commonConfig = {
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
};

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
    watch: {
      ...commonConfig.watch,
    },
  },
  {
    input: "bundleA/index.js",
    output: {
      file: "dist/bundleA.js",
      format: "es",
      sourcemap: true,
    },
    watch: {
      ...commonConfig.watch,
    },
  },
];

export default config;
