import { join } from 'path'
import { WorkerdConfig, Service, Extension, ExtensionModule, Binding, Wrapped } from '@c0b41/workerd-config'

export interface SupabaseOptions {
  name: string
  supabaseUrl: string
  supabaseKey: string
  auth?: {}
  db?: {
    schema?: string
  }
  global?: {
    headers: Record<string, string>
  }
}

export default (options: SupabaseOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    if (!options.name || !options.supabaseKey || !options.supabaseUrl) {
      throw new Error(`name, supabaseKey, supabaseUrl, required! `)
    }

    if (!service?.worker) {
      // only run for worker services
      return
    }

    // Supabase lib for workerd
    // TODO: check already exist maybe?
    let extension = new Extension()
    let extensionModule = new ExtensionModule()
    extensionModule.setName('c0b41:supabase')
    extensionModule.setInternal(true)
    extensionModule.setPath(join(__dirname, 'plugins/supabase/index.esm.js'))
    extension.setModules(extensionModule)

    instance.setExtensions(extension)

    // Wrapped stuff for supabase namespace
    let wrappedSupabase = new Wrapped()
    wrappedSupabase.setModuleName('c0b41:supabase')

    if (options.supabaseUrl) {
      let supabaseUrl = new Binding()
      supabaseUrl.setName('supabaseUrl')
      supabaseUrl.setText(options.supabaseUrl)
      wrappedSupabase.setInnerBindings(supabaseUrl)
    }

    if (options.supabaseKey) {
      let supabasekey = new Binding()
      supabasekey.setName('supabaseKey')
      supabasekey.setText(options.supabaseKey)
      wrappedSupabase.setInnerBindings(supabasekey)
    }

    if (options.auth || options.db || options.global) {
      let bindingOptions = Object.assign(
        {},
        {
          auth: options.auth,
        },
        {
          db: options.db,
        },
        {
          global: options.global,
        }
      )

      let supabaseOptions = new Binding()
      supabaseOptions.setName('options')
      supabaseOptions.setJson(JSON.stringify(bindingOptions))
      wrappedSupabase.setInnerBindings(supabaseOptions)
    }

    // Wrapped Binding
    let extensionWrapped = new Binding()
    extensionWrapped.setName(options.name)
    extensionWrapped.setWrapped(wrappedSupabase)

    // Put supabase namespace to service extension <=> worker
    service.worker.setBindings(extensionWrapped)
  }
}
