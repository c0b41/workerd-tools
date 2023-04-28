const { WorkerdConfig } = require('@c0b41/workerd-config')
const { Supabase } = require('@c0b41/workerd-plugins')

/** @type { import("@c0b41/workerd-config").WorkerdConfig } */
let config = new WorkerdConfig()

config.Extension({
    modules: [
        {
            name: 'foo:bar',
            path: 'src/worker/extensions/int-test.js',
            internal: true
        },
        {
            name: 'foo:pub',
            path: 'src/worker/extensions/test.js',
            internal: true
        }
    ]
})

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
            },
            {
                name: 'foooo',
                wrapped: {
                    moduleName: 'foo:pub',
                    entrypoint: 'Yolo',
                    innerBindings: [
                        {
                            name: 'bar',
                            type: 'text',
                            content: 'foo'
                        }
                    ]
                }
            }
        ],
        plugins: [
            Supabase({ xxx: false })
        ]
    }
})

config.Socket({
    name: 'https:main',
    address: '*:8080',
    service: {
        name: 'main'
    }
})

module.exports = config