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
//====== start ======
// 与 Webpack 和 Browserify 等其他打包程序不同，Rollup 默认不会识别node_modules中的依赖
// resolve 识别node_modules中的依赖
const resolve = require("@rollup/plugin-node-resolve");
// commonjs 转换未提供esm的依赖为cjs
const commonjs = require("@rollup/plugin-commonjs");
//====== end ======

logUtil.setup();

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
  plugins: [terser(), resolve()],
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
      sourcemap: isDev,
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [del({ targets: "dist/*", runOnce: true })].concat(
      commonConfig.plugins
    ),
  },
  {
    // 需要排除在 bundle 外部的模块，对于lodash，我们需要打包在bundle内
    // 这个特性帮我们避免了内部bundle太过冗长的问题
    // 通过该声明，外部依赖会保持require或import的导入方式，我们需要声明给外界你要先引入该依赖
    external: ["tslib"],
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
      sourcemap: isDev,
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
        // 对于lodash，通过构建工具，我们仍可以通过import方式引入
        // 原因是（Webpack、Rollup）会使用插件（如 @rollup/plugin-commonjs、Webpack 的内置 CommonJS 兼容功能）将 CommonJS 模块转换为 ESM 格式
        if (id.includes("/lodash.js")) {
          return "lodash";
        }
        // 剩余依赖打包进third_party模块
        if (id.includes("node_modules")) {
          return "third_party";
        }
      },
    },
    watch: {
      ...commonConfig.watch,
    },
    plugins: [commonjs()].concat(commonConfig.plugins),
  },
];

module.exports = baseConfig;
