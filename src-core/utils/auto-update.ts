/**
 * Événement de progression compatible avec `@tauri-apps/plugin-updater`.
 */
export type DownloadProgressEvent =
  | { event: 'Started'; data: { contentLength?: number } }
  | { event: 'Progress'; data: { chunkLength: number } }
  | { event: 'Finished' }

/**
 * État mutable de progression d'un téléchargement d'update.
 */
export type DownloadProgressState = {
  statusDownload: string
  contentLength: number | undefined
  downloadedBytes: number
  progressPercentage: number
}

/**
 * Indique si l'écran update doit interroger le serveur de mises à jour.
 * Correctif vs prospectresearch : check en prod/staging, skip en development.
 * @param {string | undefined} appEnv - Valeur de `NUXT_PUBLIC_NODE_ENV`.
 * @returns {boolean} true si un check updater doit être lancé.
 */
export const shouldCheckForUpdates: (appEnv: string | undefined) => boolean = (appEnv: string | undefined): boolean => {
  return appEnv === 'production' || appEnv === 'staging'
}

/**
 * Crée un état de progression initial.
 * @returns {DownloadProgressState} État vide.
 */
export const createDownloadProgressState: () => DownloadProgressState = (): DownloadProgressState => {
  return {
    statusDownload: '',
    contentLength: undefined,
    downloadedBytes: 0,
    progressPercentage: 0,
  }
}

/**
 * Applique un événement de téléchargement updater à l'état d'affichage.
 * @param {DownloadProgressState} state - État courant.
 * @param {DownloadProgressEvent} downloadEvent - Événement plugin updater.
 * @returns {DownloadProgressState} Nouvel état (immutable).
 */
export const applyDownloadProgress: (
  state: DownloadProgressState,
  downloadEvent: DownloadProgressEvent,
) => DownloadProgressState = (
  state: DownloadProgressState,
  downloadEvent: DownloadProgressEvent,
): DownloadProgressState => {
  switch (downloadEvent.event) {
    case 'Started':
      return {
        statusDownload: 'Download started...',
        contentLength: downloadEvent.data.contentLength,
        downloadedBytes: 0,
        progressPercentage: 0,
      }
    case 'Progress': {
      const downloadedBytes: number = state.downloadedBytes + downloadEvent.data.chunkLength

      if (!state.contentLength) {
        return {
          ...state,
          downloadedBytes,
          statusDownload: 'Download in progress...',
        }
      }

      const progressPercentage: number = Math.min((downloadedBytes / state.contentLength) * 100, 100)

      return {
        ...state,
        downloadedBytes,
        progressPercentage,
        statusDownload: `Download progress: ${progressPercentage.toFixed(2)}%`,
      }
    }
    case 'Finished':
      return {
        ...state,
        progressPercentage: 100,
        statusDownload: 'Download completed.',
      }
  }
}
