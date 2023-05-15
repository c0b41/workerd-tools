import {
  WorkerdConfig,
  Service,
  Extension,
  ExtensionModule,
  Wrapped,
  Binding,
} from '@c0b41/workerd-config'
import { join } from 'path'

// @ https://node-postgres.com/apis/client
type PostgresConnectionOptions = {
  user?: string
  password?: string
  host?: string
  database?: string
  port?: number
  connectionString?: string
  ssl?: boolean
  types?: any
  statement_timeout?: number
  query_timeout?: number
  application_name?: string
  connectionTimeoutMillis?: number
  idle_in_transaction_session_timeout?: number
}

export interface PostgresSqlOptions {
  name: string
  config: PostgresConnectionOptions
}

export default (options: PostgresSqlOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let minCompatibilityDate = '2023-05-12'
    if (!options.name || !options.config) {
      throw new Error(`name, config, required!`)
    }

    if (!service?.worker) {
      // only run for worker services
      return
    }

    // pg lib for workerd
    // TODO: check already exist maybe?
    let extension = new Extension()
    let extensionModule = new ExtensionModule()
    extensionModule.setName('c0b41:pg')
    extensionModule.setInternal(true)
    extensionModule.setPath(join(__dirname, 'plugins/postgres_sql/index.esm.js'))
    extension.setModules(extensionModule)

    instance.setExtensions(extension)

    // Wrapped stuff for pg namespace
    let wrappedPg = new Wrapped()
    wrappedPg.setModuleName('c0b41:pg')

    if (options.config) {
      let pgOptions = new Binding()
      pgOptions.setName('options')
      pgOptions.setJson(JSON.stringify(options.config))
      wrappedPg.setInnerBindings(pgOptions)
    }

    // Wrapped Binding
    let extensionWrapped = new Binding()
    extensionWrapped.setName(options.name)
    extensionWrapped.setWrapped(wrappedPg)

    // node compact support for pg module
    service.worker.setcompatibilityDate(minCompatibilityDate)
    service.worker.setcompatibilityFlags('nodejs_compat')

    // Put pg namespace to service extension <=> worker
    service.worker.setBindings(extensionWrapped)
  }
}
