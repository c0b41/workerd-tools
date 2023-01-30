const { WorkerdConfig } = require('@c0b41/workerd-config')

let config = new WorkerdConfig()

config.Service({
    name: 'internet',
    network: {
        allow: ['public', 'private', 'local', 'network'],
    }
})

config.Service({
    name: 'main',
    worker: {
        compatibilityDate: '2022-09-17',
        globalOutbound: 'internet',
        modules: [
            {
                name: 'worker.js',
                esModule: true,
                embed: 'sample/worker.js'
            }
        ],
    }
})

config.Socket({
    name: 'https',
    address: '*:8080',
    service: 'main'
})

module.exports = config