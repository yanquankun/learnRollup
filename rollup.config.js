// rollup.config.ts
/**
 * @type {import('rollup').RollupOptions}
 */
/**
 * @link https://www.rollupjs.com/command-line-interface/#command-line-flags
 */

/**
 * rollup.config.js
 * 如果你想异步创建配置文件，Rollup 也可以处理解析为对象或数组的 Promise
 * @code
 *    import fetch from 'node-fetch';
 *    export default fetch('/some-remote-service-which-returns-actual-config');
 * @code
 *    export default Promise.all([fetch('get-config-1'), fetch('get-config-2')]);
 */

const logUtil = require("./util/log");
const pkg = require("./package.json");
const terser = require("@rollup/plugin-terser");
const env = process.env.NODE_ENV || "development";
const isDev = env === "development";
const del = require("rollup-plugin-delete");

logUtil.setup();

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
  plugins: [terser()],
};

const baseConfig = [
  {
    external: commonConfig.external,
    input: "src/index.js",
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
      commonConfig.plugins
    ),
  },
  {
    external: commonConfig.external,
    input: "bundleA/index.js",
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
      banner: (chunk) => {
        return `/* bundle version ${pkg.version} */`;
      },
      manualChunks: (id, moduleInfo) => {
        const { getModuleInfo, getModuleIds } = moduleInfo;
        // 对common进行单独分包
        if (id.includes("/common/common")) {
          return "vendor";
        }
      },
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [].concat(commonConfig.plugins),
  },
];

module.exports = baseConfig;
