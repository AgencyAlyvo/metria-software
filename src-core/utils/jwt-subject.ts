/**
 * Décode un segment JWT base64url en UTF-8.
 * @param {string} segment - Segment base64url.
 * @returns {string} Texte décodé.
 */
function decodeBase64Url(segment: string): string {
  const normalized: string = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padLength: number = (4 - (normalized.length % 4)) % 4
  const padded: string = normalized + '='.repeat(padLength)

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8')
  }

  return decodeURIComponent(
    Array.from(atob(padded), (char: string): string => {
      return `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`
    }).join(''),
  )
}

/**
 * Lit le claim `sub` d'un JWT sans vérification (affichage client uniquement).
 * @param {string | undefined} token - JWT bearer.
 * @returns {string | undefined} Subject UUID ou undefined.
 */
export function readJwtSubject(token: string | undefined): string | undefined {
  if (!token) {
    return undefined
  }

  const parts: string[] = token.split('.')
  const payloadSegment: string | undefined = parts[1]

  if (!payloadSegment) {
    return undefined
  }

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(payloadSegment))

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      typeof (payload as { sub: unknown }).sub === 'string'
    ) {
      return (payload as { sub: string }).sub
    }

    return undefined
  } catch {
    return undefined
  }
}
