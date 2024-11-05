// rollup.fun.js
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

const rollup = require("rollup");
const logUtil = require("./util/log");
const pkg = require("./package.json");
logUtil.setup();

const commonConfig = {
  // 需要排除在 bundle 外部的模块
  external: Object.keys(pkg.dependencies),
  watch: {
    skipWrite: false,
    exclude: ["node_modules/**"],
    clearScreen: false,
  },
};

const config = [
  {
    external: commonConfig.external,
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
    external: commonConfig.external,
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

const write = function (res, outputConfig = {}) {
  return new Promise((resolve, reject) => {
    try {
      resolve(res.write(outputConfig));
    } catch (err) {
      reject(err);
    }
  });
};

let watcher = null;

const startWatch = () => {
  // 初始构建
  config.forEach((config) => {
    rollup.rollup(config).then(
      (res) => {
        if (res) {
          if (Array.isArray(config.output)) {
            config.output.forEach((outputConfig) => {
              write(res, outputConfig).then(
                () =>
                  console.log(
                    `${logUtil.logColor("Green")} ✔ ${
                      config.input
                    } bundle构建成功`
                  ),
                (err) =>
                  console.log(
                    `${logUtil.logColor("Green")} × ${
                      config.input
                    } output config error: ${err}`
                  )
              );
            });
          } else
            write(res, config.output).then(
              () =>
                console.log(
                  `${logUtil.logColor("Green")} ✔ ${
                    config.input
                  } bundle构建成功`
                ),
              (err) =>
                console.log(
                  `${logUtil.logColor("Green")} × ${
                    config.input
                  } output config error: ${err}`
                )
            );
        }
      },
      (err) =>
        console.log(
          `${logUtil.logColor("Green")} × ${
            config.input
          } input config error: ${err}`
        )
    );
  });

  // 只需要一个watch实例即可，所以统一监听所有的config
  // 监听文件变更
  const watcher = rollup.watch(config);
  // 是否初次构建
  let isFirstBuild = true;
  const cwd = process.cwd();

  watcher.on("event", (event) => {
    if (event.code === "END") {
      isFirstBuild = false;
      console.log(
        `${logUtil.logColor("White")} [${logUtil
          .currentTime()
          .replace(/\//g, "-")}] waiting for changes...`
      );
    }
    if (!isFirstBuild && event.code === "BUNDLE_END") {
      let { input, output } = event;
      console.log(
        `${logUtil.logColor("Green")} bundles ${input} → ${JSON.stringify(
          output
        ).replaceAll(cwd, "")}`
      );
    }

    // event.code 可以是以下之一：
    //   START        - 监视器正在（重新）启动
    //   BUNDLE_START - 单次打包
    //                  * 如果存在，event.input 将是输入选项对象
    //                  * event.output 包含生成的输出的 "file"
    //                      或 "dir" 选项值的数组
    //   BUNDLE_END   - 完成打包
    //                  * 如果存在，event.input 将是输入选项对象
    //                  * event.output 包含生成的输出的 "file"
    //                      或 "dir" 选项值的数组
    //                  * event.duration 是构建持续时间（以毫秒为单位）
    //                  * event.result 包含 bundle 对象，
    //                      可以通过调用 bundle.generate
    //                      或 bundle.write 来生成其他输出。
    //                      当使用 watch.skipWrite 选项时，这尤其重要。
    //                  生成输出后，你应该调用 "event.result.close()"，
    //                  或者如果你不生成输出，也应该调用。
    //                  这将允许插件通过
    //                  "closeBundle" 钩子清理资源。
    //   END          - 完成所有产物的构建
    //   ERROR        - 在打包时遇到错误
    //                  * event.error 包含抛出的错误
    //                  * 对于构建错误，event.result 为 null，
    //                      对于输出生成错误，它包含 bundle 对象。
    //                      与 "BUNDLE_END" 一样，如果存在，
    //                      你应该在完成后调用 "event.result.close()"。
    // 如果从事件处理程序返回一个 Promise，则 Rollup
    // 将等待 Promise 解析后再继续。
  });

  // 这将确保在每次运行后正确关闭打包
  watcher.on("event", ({ result }) => {
    if (result) {
      result.close();
    }
  });

  // 此外，你可以挂钩以下内容。
  // 同样，返回 Promise 以使 Rollup 在该阶段等待：
  watcher.on("change", (id, { event }) => {
    /* 更改了一个文件 */
    // console.log(logUtil.logColor("Blue"), id, event);
  });

  watcher.on("restart", () => {
    /* 新触发了一次运行 */
  });

  watcher.on("close", () => {
    isFirstBuild = true;
    console.log(logUtil.logColor("Cyan") + `rollup watcher close!`);
  });

  return watcher;
};

const closeWatch = () => {
  // 停止监听
  watcher && watcher.close();
};

watcher = startWatch();

// setTimeout(() => {
//   closeWatch();
// }, 3000);
