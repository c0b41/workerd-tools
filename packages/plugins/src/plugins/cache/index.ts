export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url)
    const request = new Request(req, {
      method: req.method === 'PURGE' ? 'DELETE' : req.method,
    })
    // workerd using old http methods, fastify dosen't support other methods

    const PluginPath = env.PLUGIN_PATH ? env.PLUGIN_PATH : ''
    url.pathname = `${PluginPath}/${env.PLUGIN}/${encodeURIComponent(request.url)}`
    if (env.CACHE_ID !== undefined) {
      request.headers.set('plugin-cache-id', env.CACHE_ID)
    }
    return env.SERVICE.fetch(url, request)
  },
}
