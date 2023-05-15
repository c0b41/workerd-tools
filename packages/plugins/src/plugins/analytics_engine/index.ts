export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url)
    const request = new Request(req)
    const PluginPath = env.PLUGIN_PATH ? env.PLUGIN_PATH : ''
    url.pathname = `${PluginPath}/${env.PLUGIN}/${encodeURIComponent(request.url)}`
    if (env.DATASET_ID !== undefined) {
      request.headers.set('dataset-id', env.DATASET_ID)
    }
    return env.SERVICE.fetch(url, request)
  },
}
