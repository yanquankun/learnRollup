// rollup.config.ts
/**
 * @type {import('rollup').RollupOptions}
 */
/**
 * @link https://www.rollupjs.com/command-line-interface/#command-line-flags
 */

/**
 * 本配置 入口为web应用中的html文件
 * 同vite一样 观察rollup在html entry中的使用
 */

const logUtil = require("./util/log");
const pkg = require("./package.json");
const terser = require("@rollup/plugin-terser");
const path = require("path");
const fs = require("fs");
const del = require("rollup-plugin-delete");
const { rollupPluginHTML } = require("@web/rollup-plugin-html");
// const copy = require("rollup-plugin-copy");
const styles = require("rollup-plugin-styles");
const devServer = require("rollup-plugin-dev-server");
const livereload = require("rollup-plugin-livereload");
//====== start ======
// 与 Webpack 和 Browserify 等其他打包程序不同，Rollup 默认不会识别node_modules中的依赖
// resolve 识别node_modules中的依赖
const resolve = require("@rollup/plugin-node-resolve");
// commonjs 转换未提供esm的依赖为cjs
const commonjs = require("@rollup/plugin-commonjs");
const { includes } = require("lodash");
//====== end ======

const env = process.env.NODE_ENV || "development";
const isDev = env === "development";

logUtil.setup();

const devsPlugins = [
  devServer({
    port: 3300,
    open: true,
    contentBase: "dist",
  }),
  livereload({
    watch: ["dist", "htmlStatic/index.html"],
  }),
];

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
    include: "htmlStatic/**",
  },
  plugins: [terser(), resolve()],
};

module.exports = {
  external: commonConfig.external,
  input: ["htmlStatic/index.html"],
  output: {
    dir: "dist",
    format: "es",
    sourcemap: isDev,
    // type为module的将被视为entry文件
    entryFileNames: isDev ? "entry/[name].js" : "entry/[name]-entry.[hash].js",
    // 其他依赖均打入vender目录
    chunkFileNames: isDev
      ? "vender/[name].js"
      : "vender/[name]-vender.[hash].js",
    // 此配置会影响@web/rollup-plugin-html
    assetFileNames: (assetInfo) => {
      if (assetInfo.name.endsWith("css")) {
        return isDev ? "css/[name][extname]" : "css/[name]-[hash][extname]";
      }

      // 其他静态资源均会打包入assets目录
      // 路径不需要额外补充assets，默认该路径
      return isDev ? "[name][extname]" : "[name]-[hash][extname]";
    },
    // split chunk
    manualChunks: (id, moduleInfo) => {
      if (id.includes("/common/common")) {
        return "vendor";
      }
      return "third_party";
    },
  },
  watch: {
    ...commonConfig.watch,
  },
  plugins: [
    commonjs(),
    del({ targets: "dist/*", runOnce: true }),
    // 整合所有样式到一个文件
    styles({
      mode: ["extract", "styled.css"],
      less: {},
      minimize: true,
      // 解析css中的url路径
      url: {
        // 如果使用了assetFileNames，则需要指定此路径find pic
        publicPath: "../assets/",
      },
    }),
    // 支持html为入口
    // 该插件runtime before assetFileNames
    rollupPluginHTML({
      publicPath: "/",
      minify: true,
      bundleAssetsFromCss: true,
    }),
    // 注入最终生成的styled.css
    // 2.3版本@web/rollup-plugin-html不支持自动注入了
    {
      name: "inject-css",
      writeBundle(_, bundle) {
        const cssFiles = Object.values(bundle).filter(
          (file) => file.type === "asset" && file.fileName.endsWith(".css")
        );

        if (cssFiles.length) {
          const cssFileStr = cssFiles.reduce(
            (cssLinkStr, curCssFile) =>
              curCssFile.fileName &&
              (cssLinkStr += `<link rel="stylesheet" href="${curCssFile.fileName}"></link>`),
            ""
          );
          // 打开并读取 HTML 模板
          const htmlFilePath = path.resolve("dist/index.html");
          const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

          // 修改 HTML 内容，手动插入 CSS
          const updatedHtml = htmlContent.replace(
            "</head>",
            `${cssFileStr}</head>`
          );

          // 写回修改后的 HTML 内容
          fs.writeFileSync(htmlFilePath, updatedHtml);
        }
      },
    },
  ].concat(commonConfig.plugins, isDev ? devsPlugins : []),
};
