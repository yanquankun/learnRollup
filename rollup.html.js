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
const { createHash } = require("crypto");
const less = require("less");

const hash = require("rollup-plugin-hash");
const html = require("./plugin/html-rollup-plugin");
const postcss = require("rollup-plugin-postcss");
const copy = require("rollup-plugin-copy");
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

    entryFileNames: "js/[name]-entry.[hash].js",
    chunkFileNames: "js/[name]-vender.[hash].js",
    assetFileNames: "assets/[name].[hash][extname]",
  },
  watch: {
    ...commonConfig.watch,
  },
  plugins: [
    commonjs(),
    del({ targets: "dist/*", runOnce: true }),
    // less({
    //   include: ["html/css/*"],
    //   output: "dist/css/[name].[hash].css",
    // }),
    copy({
      targets: [
        {
          src: "html/css/**/*",
          dest: "dist/css",
          rename: (name, extension, fullPath) => {
            const hash = createHash("md5")
              .update(fs.readFileSync(path.resolve(fullPath)))
              .digest("hex")
              .slice(0, 8);
            return `${name}-${hash}.css`;
          },
          transform: async (contents, filename) => {
            if (filename.includes(".less")) {
              const result = await less.render(contents.toString(), {
                filename,
              });
              return result.css;
            }
            return contents;
          },
        },
      ],
      hook: "generateBundle",
    }),
    // hash(),
    // postcss({
    //   // inject: true,
    //   extract: (chunk) => `dist/css/${chunk.name}-[hash].css`,
    //   minimize: true,
    //   extensions: [".css", ".less"],
    // }),
    hash({
      dest: "dist",
      replace: true,
    }),
    html({ title: "测试", compress: true, cssResourcePath: "css" }),
  ].concat(commonConfig.plugins),
};
