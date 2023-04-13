const { build } = require("esbuild");
const { dependencies } = require('../package.json')
const { Generator } = require('npm-dts');

const isDev = process.env.NODE_ENV !== 'production'
const external = [...Object.keys(dependencies)]

const sharedConfig = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    external: external,
    platform: 'node',
    target: ['node16'],
}

const typesConfig = {
    entry: 'src/index.ts',
    output: 'dist/index.d.ts',
    force: false,
    tsc: '--extendedDiagnostics',
    logLevel: 'debug'
}

new Generator(typesConfig, true, true).generate()

if (isDev) {
    build({
        ...sharedConfig,
        outfile: 'dist/index.js',
        format: 'cjs',
        watch: true,
        minify: false,
        logLevel: 'info'
    });
} else {
    build({
        ...sharedConfig,
        sourcemap: false,
        outfile: "dist/index.js",
    });

    build({
        ...sharedConfig,
        sourcemap: false,
        outfile: "dist/index.esm.js",
        format: "esm"
    });
}