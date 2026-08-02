import { proxyBackendRequest } from './proxy'
import { getApiBases, injectRuntimeConfig } from './runtime-config'

interface Env {
  API_BASE?: string
  PROXY_BACKEND?: string
  PROXY_WEBSOCKET?: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

function isProxyEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true'
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (isProxyEnabled(env.PROXY_BACKEND)) {
      const proxyResponse = await proxyBackendRequest(request, getApiBases(env.API_BASE)[0])
      if (proxyResponse)
        return proxyResponse
    }

    const assetResponse = await env.ASSETS.fetch(request)
    return injectRuntimeConfig(request, assetResponse, env)
  },
}
