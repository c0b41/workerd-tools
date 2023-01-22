interface ServerOptions {
  dist?: string
  config?: string
  pwd?: string
  bin?: string
  inspector?: InspectorOptions
  verbose?: boolean
  logs: ServerOptionsLoggin
}

type ServerOptionsLoggin = {
  workerd: boolean
  worker: boolean
}

interface InspectorOptions {
  port?: number
  excludes?: string[]
}

interface InspectorSocketOptions {
  port: number
  name: string
}
