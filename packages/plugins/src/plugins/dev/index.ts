const LIVE_RELOAD = `<script defer type="application/javascript">
(function () {
  var url = new URL("http://localhost:1337");
  function reload() { location.reload(); }
  function connect(reconnected) {
    var ws = new WebSocket(url);
    if (reconnected) ws.onopen = reload;
    ws.onclose = function(e) {
      e.code === 1012 ? reload() : e.code === 1000 || e.code === 1001 || setTimeout(connect, 1000, true);
    }
  }
  connect();
})();
</script>`

async function handleEvent(req, env, ctx) {
  const request = new Request(req)
  try {
    let response = await env.SERVICE.fetch(request)

    if (
      env.SERVICE_RELOAD &&
      response.headers.get('Content-Type')?.toLowerCase().includes('text/html')
    ) {
      const headers = new Headers(response.headers)
      const contentLength = parseInt(headers.get('content-length'))
      if (!isNaN(contentLength)) {
        headers.set('content-length', contentLength + LIVE_RELOAD.byteLength)
      }

      const { readable, writable } = new IdentityTransformStream()
      ctx.waitUntil(
        (async () => {
          await response.body?.pipeTo(writable, { preventClose: true })
          const writer = writable.getWriter()
          await writer.write(LIVE_RELOAD)
          await writer.close()
        })()
      )

      return new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return response
  } catch (e) {
    let template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Error P</title>
</head>
<body>
    <pre>${e.stack}</pre>
</body>
</html>`
    return new Response(template, {
      status: 500,
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    })
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleEvent(request, env, ctx)
  },
}
