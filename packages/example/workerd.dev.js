const { WorkerdDevServer } = require('@c0b41/workerd-dev')

/** @type { import("@c0b41/workerd-dev").WorkerdDevServer } */
new WorkerdDevServer({
    dist: './src/worker/**.*',
    config: './workerd.config.js',
    workerd: {
        bin: 'workerd',
        verbose: true,
        logs: true
    },
    worker: {
        logs: true,
        autoReload: true,
    },
    inspector: {
        port: 9229,
    }
})