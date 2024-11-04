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
import logUtil from "./util/log";

function setup() {
  const env = process.env.NODE_ENV || "development";
  const isDev = env === "development";
  if (!isDev) return;
  console.log(logUtil.logColor("Red"), "##########################");
  console.log(logUtil.logColor("Red"), "前端团队 开发工具 启动！\n\n\n");
  console.log(logUtil.logColor("Red"), "FE组提醒您\n");
  console.log(logUtil.logColor("Red"), "代码千万行\n");
  console.log(logUtil.logColor("Red"), "注释第一行\n");
  console.log(logUtil.logColor("Red"), "命名不规范\n");
  console.log(logUtil.logColor("Red"), "同事两行泪\n");
  console.log(logUtil.logColor("Red"), "##########################");
}

setup();

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
