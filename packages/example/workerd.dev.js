const { WorkerdDevServer } = require('./dist')

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