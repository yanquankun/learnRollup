// rollup.config.ts
/**
 * @type {import('rollup').RollupOptions}
 */
/**
 * @link https://www.rollupjs.com/command-line-interface/#command-line-flags
 */

const logUtil = require("./util/log");
const pkg = require("./package.json");
const terser = require("@rollup/plugin-terser");
const env = process.env.NODE_ENV || "development";
const isDev = env === "development";
const del = require("rollup-plugin-delete");
const path = require("path");
const fs = require("fs");

const html = require("./plugin/html-rollup-plugin/html-rollup-plugin");
const copy = require("rollup-plugin-copy");
const styles = require("rollup-plugin-styles");
const devServer = require("rollup-plugin-dev-server");
const livereload = require("rollup-plugin-livereload");
//====== start ======
// 与 Webpack 和 Browserify 等其他打包程序不同，Rollup 默认不会识别node_modules中的依赖
// resolve 识别node_modules中的依赖
const resolve = require("@rollup/plugin-node-resolve");
// commonjs 转换未提供esm的依赖为cjs
const commonjs = require("@rollup/plugin-commonjs");
//====== end ======

logUtil.setup();

const devsPlugins = [
  devServer({
    port: 3300,
    open: true,
    contentBase: "dist",
  }),
  livereload({
    watch: ["dist", "html/index.html"],
  }),
];

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
    include: "html/**",
  },
  plugins: [terser(), resolve()],
};

const getEntries = function () {
  const entrysFilePath = path.join(__dirname, "html/js");
  const entrysFileList = fs.readdirSync(entrysFilePath);
  return entrysFileList.map((fileName) => path.join("html/js", fileName));
};

module.exports = {
  external: commonConfig.external,
  input: getEntries(),
  output: {
    dir: "dist",
    format: "es",
    sourcemap: isDev,
    entryFileNames: isDev ? "entry/[name].js" : "entry/[name]-entry.[hash].js",
    chunkFileNames: isDev
      ? "vender/[name].js"
      : "vender/[name]-vender.[hash].js",
    assetFileNames: (assetInfo) => {
      if (assetInfo.name.indexOf("css") > -1) {
        return isDev ? "css/[name][extname]" : "css/[name]-[hash][extname]";
      }
      return isDev ? "assets/[name][extname]" : "assets/[name]-[hash][extname]";
    },
    manualChunks: (id, moduleInfo) => {
      if (id.includes("/common/common")) {
        return "vendor";
      }
    },
  },
  watch: {
    ...commonConfig.watch,
  },
  plugins: [
    commonjs(),
    del({ targets: "dist/*", runOnce: true }),
    // 抽取js中加载的样式文件
    styles({
      mode: ["extract", "styles.css"],
      minimize: true,
      url: {
        inline: false,
        // 图片资源的路径前缀
        publicPath: "/assets/",
      },
    }),
    // 需要在js中引用的才能收集到，该场景下不合适
    // url({
    //   include: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
    //   limit: 0,
    //   inline: false,
    //   fileName: isDev
    //     ? "images/1[name][extname]"
    //     : "images/1[name]-[hash][extname]",
    //   destDir: "dist",
    // }),
    html({
      title: "测试",
      compress: true,
      template: path.join(__dirname, "/html/index.html"),
    }),
  ].concat(commonConfig.plugins, isDev ? devsPlugins : []),
};
