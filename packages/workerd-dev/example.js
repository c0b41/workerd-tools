const { devServer } = require('./dist')


let runtime = new devServer({
    dist: './sample/**.*',
    config: './sample/config.capnp',
    //pwd: './sample',
    verbose: true,
    inspector: {
        port: 9229,
        excludes: ['loop']
    },
    logs: {
        workerd: false,
        worker: true
    }
})