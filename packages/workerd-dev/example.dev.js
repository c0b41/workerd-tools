const { WorkerdDevServer } = require('./dist')

new WorkerdDevServer({
    dist: './sample/**.*',
    config: './workerd.config.js',
    workerd: {
        //pwd: './sample',
        //bin: './'
        verbose: true,
        logs: true
    },
    worker: {
        logs: true
    },
    inspector: {
        port: 9229,
        excludes: ['loop']
    },
})