const { WorkerdDevServer } = require('@c0b41/workerd-dev')

new WorkerdDevServer({
    dist: './src/worker/**.*',
    config: './workerd.config.js',
    workerd: {
        verbose: true,
        logs: true
    },
    worker: {
        logs: true,
        autoReload: true
    },
    inspector: {
        port: 9229
    },
})