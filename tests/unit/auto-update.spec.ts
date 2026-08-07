import { describe, expect, it } from 'vitest'

import { applyDownloadProgress, createDownloadProgressState, shouldCheckForUpdates } from '#src-core/utils/auto-update'
import type { DownloadProgressState } from '#src-core/utils/auto-update'

describe('shouldCheckForUpdates', (): void => {
  it('saute la vérification en development (correctif vs prospectresearch)', (): void => {
    expect(shouldCheckForUpdates('development')).toBe(false)
  })

  it('vérifie les mises à jour en staging', (): void => {
    expect(shouldCheckForUpdates('staging')).toBe(true)
  })

  it('vérifie les mises à jour en production', (): void => {
    expect(shouldCheckForUpdates('production')).toBe(true)
  })

  it('saute pour un env inconnu ou vide', (): void => {
    expect(shouldCheckForUpdates('')).toBe(false)
    expect(shouldCheckForUpdates('local')).toBe(false)
  })
})

describe('applyDownloadProgress', (): void => {
  it('initialise le téléchargement sur Started', (): void => {
    const state: DownloadProgressState = createDownloadProgressState()

    const next: DownloadProgressState = applyDownloadProgress(state, {
      event: 'Started',
      data: { contentLength: 1000 },
    })

    expect(next.statusDownload).toBe('Download started...')
    expect(next.contentLength).toBe(1000)
    expect(next.downloadedBytes).toBe(0)
    expect(next.progressPercentage).toBe(0)
  })

  it('calcule le pourcentage sur Progress', (): void => {
    const state: DownloadProgressState = {
      ...createDownloadProgressState(),
      contentLength: 1000,
      downloadedBytes: 0,
    }

    const next: DownloadProgressState = applyDownloadProgress(state, {
      event: 'Progress',
      data: { chunkLength: 250 },
    })

    expect(next.downloadedBytes).toBe(250)
    expect(next.progressPercentage).toBe(25)
    expect(next.statusDownload).toContain('25.00')
  })

  it('reste indéterminé si Progress sans contentLength', (): void => {
    const state: DownloadProgressState = createDownloadProgressState()

    const next: DownloadProgressState = applyDownloadProgress(state, {
      event: 'Progress',
      data: { chunkLength: 128 },
    })

    expect(next.downloadedBytes).toBe(128)
    expect(next.statusDownload).toBe('Download in progress...')
    expect(next.progressPercentage).toBe(0)
  })

  it('termine à 100% sur Finished', (): void => {
    const state: DownloadProgressState = {
      ...createDownloadProgressState(),
      contentLength: 1000,
      downloadedBytes: 1000,
    }

    const next: DownloadProgressState = applyDownloadProgress(state, {
      event: 'Finished',
    })

    expect(next.progressPercentage).toBe(100)
    expect(next.statusDownload).toBe('Download completed.')
  })
})
