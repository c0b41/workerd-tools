interface ServerOptions {
  dist?: string
  config?: string
  pwd?: string
  inspector?: InspectorOptions
  verbose?: boolean
  logs: ServerOptionsLoggin
}

interface ServerOptionsLoggin {
  workerd: boolean
  worker: boolean
}

interface InspectorOptions {
  port: number
  excludes: string[]
}
