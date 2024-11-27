const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeAttributeQuotes: true,
  minifyCSS: true,
  minifyJS: true,
};

const html = ({ title = "", compress = false }) => {
  return {
    name: "html-rollup-plugin",
    async writeBundle(outputOptions, bundle) {
      let htmlTpl = fs.readFileSync("./html/index.html", "utf-8");

      if (compress) {
        htmlTpl = await minify(htmlTpl, minifyOptions);
      }

      if (title)
        htmlTpl = htmlTpl.replace(
          /<title>.*<\/title>/,
          `<title>${title}</title>`
        );

      fs.writeFileSync(path.join("dist/", "index.html"), htmlTpl);
    },
  };
};

module.exports = html;
