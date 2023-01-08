
const config: any = {
  "services": [
    {
      "name": "core:loopback",
      "external": {
        "http": {}
      }
    },
    {
      "name": "core:entry",
      "worker": {
        "serviceWorkerScript": "addEventListener(\"fetch\", (event) => {\n  const request = new Request(event.request, {\n    cf: CF_BLOB\n  })\n  const probe = event.request.headers.get(\"MF-Probe\");\n  if (probe !== null) {\n    const probeMin = parseInt(probe);\n    const status = MINIFLARE_VERSION >= probeMin ? 204 : 412;\n    return event.respondWith(new Response(null, { status }));\n  }\n\n  if (globalThis.MINIFLARE_USER !== undefined) {\n    event.respondWith(MINIFLARE_USER.fetch(request).catch((err) => new Response(err.stack)));\n  } else {\n    event.respondWith(new Response(\"No script! 😠\", { status: 404 }));\n  }\n});",
        "compatibilityDate": "2022-09-01",
        "bindings": [
          {
            "name": "MINIFLARE_VERSION",
            "json": "1"
          },
          {
            "name": "CF_BLOB",
            "json": "{\"clientTcpRtt\":11,\"longitude\":\"28.92520\",\"latitude\":\"41.02470\",\"tlsCipher\":\"AEAD-AES256-GCM-SHA384\",\"continent\":\"AS\",\"asn\":12735,\"clientAcceptEncoding\":\"br, gzip, deflate\",\"country\":\"TR\",\"tlsClientAuth\":{\"certIssuerDNLegacy\":\"\",\"certIssuerSKI\":\"\",\"certSubjectDNRFC2253\":\"\",\"certSubjectDNLegacy\":\"\",\"certFingerprintSHA256\":\"\",\"certNotBefore\":\"\",\"certSKI\":\"\",\"certSerial\":\"\",\"certIssuerDN\":\"\",\"certVerified\":\"NONE\",\"certNotAfter\":\"\",\"certSubjectDN\":\"\",\"certPresented\":\"0\",\"certRevoked\":\"0\",\"certIssuerSerial\":\"\",\"certIssuerDNRFC2253\":\"\",\"certFingerprintSHA1\":\"\"},\"tlsExportedAuthenticator\":{\"clientFinished\":\"69a8a61a6f56bc44b75cee3f3d75ec6898d6c3974e48129834cb21de52005745d91a265fd6c9aa12b1b98c10fd51ac7a\",\"clientHandshake\":\"49d9a61f7fc8e337c57ae805f0dba5366e4e676d815cffab3717802f623004f97ebcb617395c80b806b7d29a7c290cdf\",\"serverHandshake\":\"cd8353187be479e68c3cad5efa6bc5ed7806ad993ced51ea0e2281392959e4080349daa5bedb79bb79ee7312bc85c526\",\"serverFinished\":\"ea147ed7ad011da997f9941ab07203c99eb45d245705c037b7068cc045525511bf5b276d0673fd54e7dcce393866d1f9\"},\"tlsVersion\":\"TLSv1.3\",\"colo\":\"IST\",\"timezone\":\"Europe/Istanbul\",\"city\":\"Istanbul\",\"httpProtocol\":\"HTTP/1.1\",\"edgeRequestKeepAliveStatus\":1,\"requestPriority\":\"\",\"botManagement\":{\"corporateProxy\":false,\"staticResource\":false,\"verifiedBot\":false,\"score\":1},\"clientTrustScore\":1,\"region\":\"Istanbul\",\"regionCode\":\"34\",\"asOrganization\":\"TurkNet\",\"postalCode\":\"34010\"}"
          },
          {
            "name": "MINIFLARE_USER",
            "service": {
              "name": "core:user:"
            }
          }
        ]
      }
    },
    {
      "name": "core:user:",
      "worker": {
        "modules": [
          {
            "name": "<script>",
            "esModule": "export default {\n        async fetch(request, env, context) {\n            await caches.open(\"test2\");\n           return new Response(\"Hello Minifla22re!\")\n        },\n    }"
          }
        ],
        "compatibilityDate": "2000-01-01",
        "bindings": [
          {
            "name": "name",
            "kvNamespace": {
              "name": "kv:ns:TEST_NAMESPACE1"
            }
          }
        ],
        "durableObjectNamespaces": [],
        "durableObjectStorage": {}
      }
    },
    {
      "name": "kv:ns:TEST_NAMESPACE1",
      "worker": {
        "serviceWorkerScript": "addEventListener(\"fetch\", (event) => {\n  let request = event.request;\n  const url = new URL(request.url);\n  url.pathname = `/${MINIFLARE_PLUGIN}/${MINIFLARE_NAMESPACE}${url.pathname}`;\n  if (globalThis.MINIFLARE_PERSIST !== undefined) {\n    request = new Request(request);\n    request.headers.set(\"MF-Persist\", MINIFLARE_PERSIST);\n  }\n  event.respondWith(MINIFLARE_LOOPBACK.fetch(url, request));\n});",
        "compatibilityDate": "2022-09-01",
        "bindings": [
          {
            "name": "MINIFLARE_PERSIST",
            "text": "\"./data\""
          },
          {
            "name": "MINIFLARE_PLUGIN",
            "text": "kv"
          },
          {
            "name": "MINIFLARE_NAMESPACE",
            "text": "TEST_NAMESPACE1"
          },
          {
            "name": "MINIFLARE_LOOPBACK",
            "service": {
              "name": "core:loopback"
            }
          }
        ]
      }
    }
  ],
  "sockets": [
    {
      "name": "entry",
      "http": {},
      "service": {
        "name": "core:entry"
      }
    }
  ]
}

export default config