const { devServer } = require('./dist')


let runtime = new devServer({
    dist: './sample/**.*',
    config: './sample/config.capnp',
    //pwd: './sample',
    verbose: true,
    inspectorPort: 9229
})