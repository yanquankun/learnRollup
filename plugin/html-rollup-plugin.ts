import fs from "fs";
import { minify } from "html-minifier-terser";
import type { OutputOptions, OutputAsset, OutputChunk } from "rollup";
import path from "path";

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeAttributeQuotes: false,
  minifyCSS: true,
  minifyJS: true,
};

export interface IHtmlPluginOptions {
  template: string;
  templateFileName?: string;
  publicPath?: string;
  compress?: boolean;
  title?: string;
}

const isAbsolutePath = (str: string) => path.isAbsolute(str);

const html = (opts: IHtmlPluginOptions) => {
  const {
    title = "",
    compress = false,
    publicPath = "",
    template = "",
    templateFileName = "index.html",
  } = opts;

  return {
    name: "html-rollup-plugin",

    async writeBundle(
      outputOptions: OutputOptions,
      bundle: { [fileName: string]: OutputAsset | OutputChunk }
    ) {
      if (!outputOptions.dir) {
        throw Error("your output config must set dir!");
      }

      if (!template || typeof template !== "string") {
        throw Error("you must set template as a string or absolute path!");
      }

      let htmlTpl: string = template;
      if (isAbsolutePath(template)) {
        try {
          htmlTpl = fs.readFileSync(template, "utf-8");
        } catch (error) {
          throw Error(`${template} path cant find!`);
        }
      }

      if (title)
        htmlTpl = htmlTpl.replace(
          /<title>.*<\/title>/,
          `<title>${title}</title>`
        );

      const cssFiles = Object.keys(bundle).filter((file) =>
        file.endsWith(".css")
      );
      const jsFiles = Object.keys(bundle).filter((file) =>
        file.endsWith(".js")
      );

      // 替换 CSS 部分
      const cssDepContent = cssFiles
        .map(
          (file) =>
            `<link rel="stylesheet" href="${
              publicPath ? path.join(publicPath, file) : file
            }" />`
        )
        .join("\n");
      cssDepContent.length &&
        (htmlTpl = htmlTpl.replace(
          /<!--cssdep-->[\s\S]*?<!--cssdep-->/g,
          cssDepContent
        ));

      // 替换 JS 部分
      const jsDepContent = jsFiles
        .map(
          (file) =>
            `<script type="module" defer src="${
              publicPath ? path.join(publicPath, file) : file
            }"></script>`
        )
        .join("\n");
      jsDepContent.length &&
        (htmlTpl = htmlTpl.replace(
          /<!--jsdep-->[\s\S]*?<!--jsdep-->/g,
          jsDepContent
        ));

      if (compress) {
        htmlTpl = await minify(htmlTpl, minifyOptions);
      }

      fs.writeFileSync(path.join(outputOptions.dir, templateFileName), htmlTpl);
    },
  };
};

export default html;
