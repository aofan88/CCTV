export interface RuntimeConfigEnv {
  API_BASE?: string
  PROXY_BACKEND?: string
}

const AMPERSAND_REGEX = /&/g
const DOUBLE_QUOTE_REGEX = /"/g
const LESS_THAN_REGEX = /</g
const GREATER_THAN_REGEX = />/g
const API_BASE_META_REGEX = /<meta name="apiBase" content="[^"]*"\s*\/?>/
const WEBSOCKET_BASE_META_REGEX = /<meta name="webSocketBase" content="[^"]*"\s*\/?>/
const PROXY_BACKEND_META_REGEX = /<meta name="proxyBackend" content="[^"]*"\s*\/?>/

function enabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true'
}

function escapeHtml(value: string): string {
  return value
    .replace(AMPERSAND_REGEX, '&amp;')
    .replace(DOUBLE_QUOTE_REGEX, '&quot;')
    .replace(LESS_THAN_REGEX, '&lt;')
    .replace(GREATER_THAN_REGEX, '&gt;')
}

export function getApiBases(value: string | undefined): string[] {
  const bases = value?.split(',').map((item) => {
    try {
      const url = new URL(item.trim())
      return ['http:', 'https:'].includes(url.protocol) ? url.origin : ''
    }
    catch {
      return ''
    }
  }).filter(Boolean) ?? []

  return [...new Set(bases)]
}

export async function injectRuntimeConfig(
  request: Request,
  response: Response,
  env: RuntimeConfigEnv,
): Promise<Response> {
  if (request.method !== 'GET' || response.status !== 200 || !response.headers.get('content-type')?.toLowerCase().includes('text/html'))
    return response

  const apiBases = getApiBases(env.API_BASE)
  const proxyBackend = enabled(env.PROXY_BACKEND)
  const webSocketBases = proxyBackend ? apiBases.slice(0, 1) : apiBases
  const replacements: Array<[RegExp, string]> = [
    [API_BASE_META_REGEX, `<meta name="apiBase" content="${escapeHtml(apiBases.join(','))}" />`],
    [WEBSOCKET_BASE_META_REGEX, `<meta name="webSocketBase" content="${escapeHtml(webSocketBases.join(','))}" />`],
    [PROXY_BACKEND_META_REGEX, `<meta name="proxyBackend" content="${proxyBackend ? 'true' : 'false'}" />`],
  ]

  let html = await response.text()
  for (const [pattern, replacement] of replacements)
    html = html.replace(pattern, replacement)

  const headers = new Headers(response.headers)
  headers.delete('content-encoding')
  headers.delete('content-length')
  headers.delete('etag')

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
