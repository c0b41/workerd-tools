const { build } = require("esbuild");
const { dependencies } = require('../../package.json')

const isDev = process.env.NODE_ENV !== 'production'
const external = Object.keys(dependencies)

const sharedConfig = {
    entryPoints: ["src/plugins/kv/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    external: external,
    format: 'esm',
    platform: 'browser',
    outfile: 'dist/plugins/kv/index.esm.js',
    tsconfig: './module.tsconfig.json',
}


if (isDev) {
    build({
        ...sharedConfig,
        watch: true,
        minify: false,
        sourcemap: true,
        logLevel: 'info'
    });
} else {
    build({
        ...sharedConfig,
        sourcemap: false
    });
}
