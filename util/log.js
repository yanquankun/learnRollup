const colorMap = {
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
};

module.exports = {
  logColor: (color) => colorMap[color],
  setup: () => {
    const env = process.env.NODE_ENV || "development";
    const isDev = env === "development";
    if (!isDev) return;
    console.log(colorMap["Red"], "##########################");
    console.log(colorMap["Red"], "前端团队 开发工具 启动！\n\n\n");
    console.log(colorMap["Red"], "FE组提醒您\n");
    console.log(colorMap["Red"], "代码千万行\n");
    console.log(colorMap["Red"], "注释第一行\n");
    console.log(colorMap["Red"], "命名不规范\n");
    console.log(colorMap["Red"], "同事两行泪\n");
    console.log(colorMap["Red"], "##########################");
  },
  currentTime: () => new Date().toLocaleString(),
};
