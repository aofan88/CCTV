import { proxyBackendRequest } from '../cloudflare/proxy'
import { getApiBases, injectRuntimeConfig } from '../cloudflare/runtime-config'

interface PagesContext {
  request: Request
  env: { API_BASE?: string, PROXY_BACKEND?: string, PROXY_WEBSOCKET?: string }
  next: () => Promise<Response>
}

function isProxyEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true'
}

export async function onRequest(context: PagesContext): Promise<Response> {
  if (isProxyEnabled(context.env.PROXY_BACKEND)) {
    const proxyResponse = await proxyBackendRequest(context.request, getApiBases(context.env.API_BASE)[0])
    if (proxyResponse)
      return proxyResponse
  }

  const assetResponse = await context.next()
  return injectRuntimeConfig(context.request, assetResponse, context.env)
}
