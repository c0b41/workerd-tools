const { build } = require("esbuild");
const { dependencies } = require('../package.json')
const { Generator } = require('npm-dts');

const isDev = process.env.NODE_ENV !== 'production'

const sharedConfig = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    external: Object.keys(dependencies),
};

if (isDev) {
    build({
        ...sharedConfig,
        format: 'cjs',
        platform: 'node',
        target: ['node16'],
        outfile: "dist/index.js",
        watch: true,
        minify: false,
        sourcemap: true
    });
} else {

    new Generator({
        entry: 'src/index.ts',
        output: 'dist/index.d.ts',
    }).generate();

    build({
        ...sharedConfig,
        platform: 'node', // for CJS
        outfile: "dist/index.js",
    });

    build({
        ...sharedConfig,
        outfile: "dist/index.esm.js",
        platform: 'neutral', // for ESM
        format: "esm"
    });
}