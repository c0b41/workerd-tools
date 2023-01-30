interface ServerOptions {
  dist?: string
  config?: string
  inspector?: InspectorOptions
  workerd?: WorkerdOptions
  worker?: WorkersOptions
}

type WorkerdOptions = {
  pwd?: string
  bin?: string
  verbose?: boolean
  args?: string[]
  logs?: boolean
}

type WorkersOptions = {
  logs?: boolean
  prettyErrors?: boolean
  autoReload?: boolean
}

type ServerOptionsLoggin = {
  workerd: boolean
  worker: boolean
}

interface InspectorOptions {
  port?: number
  excludes?: RegExp[]
}

interface InspectorSocketOptions {
  port: number
  name: string
}
