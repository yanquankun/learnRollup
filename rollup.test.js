// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
/**
 * @link https://www.rollupjs.com/command-line-interface/#command-line-flags
 */

function setup() {
  const env = process.env.NODE_ENV || "development";
  const isDev = env === "development";
  if (!isDev) return;
  const Black = "\x1b[30m";
  const Red = "\x1b[31m";
  const Green = "\x1b[32m";
  const Yellow = "\x1b[33m";
  const Blue = "\x1b[34m";
  const Magenta = "\x1b[35m";
  const Cyan = "\x1b[36m";
  const White = "\x1b[37m";

  console.log(Red, "##########################");
  console.log(Red, "前端团队 开发工具 启动！\n\n\n");

  console.log(Red, "FE组提醒您\n");
  console.log(Red, "代码千万行\n");
  console.log(Red, "注释第一行\n");
  console.log(Red, "命名不规范\n");
  console.log(Red, "同事两行泪\n");

  console.log(Red, "##########################");
}

setup();

const commonConfig = {
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
};

module.exports = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.js",
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
