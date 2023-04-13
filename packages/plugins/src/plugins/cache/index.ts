export default {
  async fetch(req, env, ctx) {
    const request = new Request(req)
    const url = new URL(req.url)
    const PluginPath = env.PLUGIN_PATH ? env.PLUGIN_PATH : ''
    url.pathname = `${PluginPath}/${env.PLUGIN}/${encodeURIComponent(request.url)}`
    if (env.CACHE_ID !== undefined) request.headers.set('plugin-cache-id', env.CACHE_ID)

    return env.SERVICE.fetch(url, request)
  },
}
