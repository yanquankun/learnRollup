const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeAttributeQuotes: false,
  minifyCSS: true,
  minifyJS: true,
};

const makeHtmlAttributes = (attributes) => {
  if (!attributes) {
    return "";
  }

  const keys = Object.keys(attributes);
  return keys.reduce(
    (result, key) => (result += ` ${key}="${attributes[key]}"`),
    ""
  );
};

const getFiles = (bundle) => {
  const result = {};
  for (const file of Object.values(bundle)) {
    const { fileName } = file;
    const extension = path.extname(fileName).substring(1);

    result[extension] = (result[extension] || []).concat(file);
  }

  return result;
};

const getDefaultTemplate = async ({
  attributes,
  files,
  meta,
  publicPath,
  title,
}) => {
  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join("\n");

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join("\n");

  const metas = (meta || [])
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join("\n");

  return `
<!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <title>${title}</title>
    ${links}
  </head>
  <body>
    ${scripts}
  </body>
</html>`;
};

const replaceHtmlTemplate = (
  content,
  bundle,
  outputOptions,
  publicPath,
  cssResourcePath
) => {
  let styleLinks = [];
  if (cssResourcePath) {
    styleLinks = fs
      .readdirSync(path.join(outputOptions.dir, cssResourcePath))
      .map((cssPath) => path.join(publicPath, cssResourcePath, cssPath));
  }

  // 收集打包后生成的文件映射表
  const fileMap = {};
  for (const fileName in bundle) {
    const chunk = bundle[fileName];
    if (chunk.type === "asset" || chunk.type === "chunk") {
      const originalName = chunk.name || chunk.fileName;
      const originalExt = path.extname(chunk.facadeModuleId || "");
      fileMap[originalName + originalExt] = fileName;
    }
  }

  // 替换 <script> 和 <link> 中的路径
  content = content
    .replace(
      /(<link\s+[^>]*href=["'])([^"']+)(["'][^>]*>)/gi,
      (match, beforeHref, oldHref, afterHref) => {
        if (match.includes(".css") || match.includes(".less")) {
          if (styleLinks.length) {
            return `${beforeHref}${
              publicPath
                ? path.join(publicPath, styleLinks.shift())
                : styleLinks.shift()
            }${afterHref}`;
          }
          return match;
        }
        return match;
      }
    )
    .replace(
      /<(script)([^>]+?(src)=")([^"]+)"/g,
      (match, tag, prefix, attr, filePath) => {
        const fileName = path.basename(filePath);
        const hashedFile = fileMap[fileName];

        if (hashedFile) {
          return `<${tag}${prefix}${
            publicPath ? path.join(publicPath, hashedFile) : hashedFile
          }"`;
        }
        return match;
      }
    );

  return content;
};

const html = (opts) => {
  const {
    title = "",
    compress = false,
    publicPath = "./",
    cssResourcePath = "",
  } = opts;

  return {
    name: "html-rollup-plugin",
    async writeBundle(outputOptions, bundle) {
      let htmlTpl = fs.readFileSync("./html/index.html", "utf-8");

      if (compress) {
        htmlTpl = await minify(htmlTpl, minifyOptions);
      }

      htmlTpl = replaceHtmlTemplate(
        htmlTpl,
        bundle,
        outputOptions,
        publicPath,
        cssResourcePath
      );

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
