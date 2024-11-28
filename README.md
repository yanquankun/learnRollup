# learnRollup

learn rollup.js and a simple project  
**`为了方便直观地看到每个bundle的对应关系，本项目中所有的bundle entry均不采用fs统一读取，而是直接配置在各config中`**

**适合简单的 SPA 或 MPA 项目**：Rollup 可以构建体积小的单页面应用（SPA）或多页面应用（MPA），特别是一些无复杂依赖的项目。如果项目的依赖较少、配置要求不复杂，Rollup 可以作为一个轻量的打包工具。

**不适合大型复杂的前端项目**：对于依赖复杂、需要 HMR（热更新）、CSS 预处理、代码分割等高级功能的大型前端项目（如 Vue、React 项目），Rollup 的插件生态目前还不如 Webpack 或 Vite 完善。在这类场景下，Webpack 和 Vite 更能满足需求。

**开发工具的打包**：Rollup 非常适合构建 CLI 工具、辅助库或其他开发工具，因为它可以生成简洁的打包

### pre start

```shell
pnpm install
```

### start & watch

##### 采用三种构建方式，分别对应：

1.针对 rollup 为 ts 的 config.ts 配置文件 2.针对 rollup 为 config.js 配置文件 3.针对 rollup 采用手动调用的方式进行构建

`typescript`

```shell
pnpm buildts
```

`javascript`

```shell
pnpm build
```

`Node`

```shell
pnpm buildfun
```

### build

`typescript`

1. `amd`

```shell
pnpm amdts
```

2. `cjs`

```shell
pnpm cjsts
```

3. `iife`

```shell
pnpm iifets
```

4. `es`

```shell
pnpm ests
```

5. `umd`

```shell
pnpm umdts
```

`javascript`

1. `amd`

```shell
pnpm amd
```

2. `cjs`

```shell
pnpm cjs
```

3. `iife`

```shell
pnpm iife
```

4. `es`

```shell
pnpm es
```

5. `umd`

```shell
pnpm umd
```

##### 构建web项目

1. `入口为js方式【该方式无法对html文件做hot】，打开http://localhost:3300浏览项目`

```shell
pnpm buildhtml
```

2. `入口为html方式，打开http://localhost:3300浏览项目`

```shell
pnpm buildhtml2
```

##### 构建插件

1. `构建html-rollup-plugin插件，该插件用于替换打包后html中的js和css资源，运行如下命令，将在/plugin/html-rollup-plugin/目录里生成该插件`

```shell
pnpm buildplugin
```

