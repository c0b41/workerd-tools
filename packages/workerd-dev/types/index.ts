export interface ServerOptions {
  dist?: string
  config?: string
  inspector?: InspectorOptions
  workerd?: WorkerdOptions
  worker?: WorkersOptions
}

export type WorkerdOptions = {
  pwd?: string
  bin?: string
  verbose?: boolean
  args?: string[]
  logs?: boolean
}

export type WorkersOptions = {
  logs?: boolean
  prettyErrors?: boolean
  autoReload?: boolean
}

export type ServerOptionsLoggin = {
  workerd: boolean
  worker: boolean
}

export interface InspectorOptions {
  port?: number
  excludes?: RegExp
}

export interface InspectorSocketOptions {
  port: number
  name: string
}
