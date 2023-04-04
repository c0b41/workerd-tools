const { WorkerdConfig } = require('@c0b41/workerd-config')

/** @type { import("@c0b41/workerd-config").WorkerdConfig } */
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
                type: 'esModule',
                path: 'src/worker/worker.js'
            }
        ],
        bindings: [
            {
                name: 'test',
                type: 'text',
                content: 'hi'
            },
            {
                name: 'test2',
                type: 'json',
                content: JSON.stringify({ foo: 'bar' })
            }
        ]
    }
})

config.Socket({
    name: 'https',
    address: '*:8080',
    service: {
        name: 'main'
    }
})

module.exports = config