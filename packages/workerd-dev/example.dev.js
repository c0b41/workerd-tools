const { WorkerdDevServer } = require('./dist')

new WorkerdDevServer({
    dist: './sample/**.*',
    config: './workerd.config.js',
    workerd: {
        //pwd: './sample',
        bin: 'workerd',
        verbose: true,
        logs: true
    },
    worker: {
        logs: true,
        autoReload: false,
        prettyErrors: true
    },
    inspector: {
        port: 9229
    },
})