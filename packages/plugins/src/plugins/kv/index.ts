export default {
  async fetch(req, env, ctx) {
    let request = req
    const url = new URL(request.url)
    const PluginPath = env.PLUGIN_PATH ? env.PLUGIN_PATH : ''
    url.pathname = `${PluginPath}/${env.PLUGIN}/${env.NAMESPACE}${url.pathname}`
    return env.SERVICE.fetch(url, request)
  },
}
