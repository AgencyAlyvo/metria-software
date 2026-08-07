import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

import { isTauriRuntime } from '#src-core/utils/tauri-runtime'

/**
 * Retourne l'implémentation fetch adaptée à l'environnement.
 * Dans Tauri : fetch du plugin HTTP (réseau côté Rust, pas de CORS).
 * En navigateur (dev web) : fetch natif.
 * @returns {typeof globalThis.fetch} Implémentation fetch.
 */
export function resolveFetch(): typeof globalThis.fetch {
  if (isTauriRuntime()) {
    return tauriFetch as typeof globalThis.fetch
  }

  return globalThis.fetch.bind(globalThis)
}

/**
 * Extrait un message d'erreur lisible d'une réponse HTTP en échec.
 * @param {Response} response - Réponse HTTP non-ok.
 * @returns {Promise<string>} Message d'erreur.
 */
export async function extractHttpError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()

    if (typeof payload === 'object' && payload !== null) {
      const record: Record<string, unknown> = payload as Record<string, unknown>
      const error: unknown = record.error

      if (typeof error === 'object' && error !== null) {
        const message: unknown = (error as Record<string, unknown>).message

        if (typeof message === 'string' && message.length > 0) {
          return message
        }
      }

      if (typeof record.err_msg === 'string' && record.err_msg.length > 0) {
        return record.err_msg
      }

      if (typeof record.message === 'string' && record.message.length > 0) {
        return record.message
      }
    }
  } catch {
    // Corps non JSON — on retombe sur le statut HTTP.
  }

  return `HTTP ${response.status}`
}
