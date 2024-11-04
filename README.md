# learnRollup

learn rollup.js and a simple project  
`为了方便直观地看到每个bundle的对应关系，本项目中所有的bundle entry均不采用fs统一读取，而是直接配置在各config中`

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
