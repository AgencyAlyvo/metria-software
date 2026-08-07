/**
 * Indique si l'application tourne dans le shell Tauri.
 * @returns {boolean} True lorsque l'API interne Tauri est disponible.
 */
export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}
