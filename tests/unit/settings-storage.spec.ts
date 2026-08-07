import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const {
  existsMock,
  mkdirMock,
  readTextFileMock,
  writeTextFileMock,
  removeMock,
}: {
  existsMock: Mock
  mkdirMock: Mock
  readTextFileMock: Mock
  writeTextFileMock: Mock
  removeMock: Mock
} = vi.hoisted(
  (): {
    existsMock: Mock
    mkdirMock: Mock
    readTextFileMock: Mock
    writeTextFileMock: Mock
    removeMock: Mock
  } => {
    return {
      existsMock: vi.fn(),
      mkdirMock: vi.fn(),
      readTextFileMock: vi.fn(),
      writeTextFileMock: vi.fn(),
      removeMock: vi.fn(),
    }
  },
)

vi.mock('@tauri-apps/plugin-fs', (): Record<string, unknown> => {
  return {
    BaseDirectory: { Data: 1 },
    /**
     * Mock exists.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    exists: (...args: unknown[]): unknown => existsMock(...args),
    /**
     * Mock mkdir.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    mkdir: (...args: unknown[]): unknown => mkdirMock(...args),
    /**
     * Mock readTextFile.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    readTextFile: (...args: unknown[]): unknown => readTextFileMock(...args),
    /**
     * Mock writeTextFile.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    writeTextFile: (...args: unknown[]): unknown => writeTextFileMock(...args),
    /**
     * Mock remove.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    remove: (...args: unknown[]): unknown => removeMock(...args),
  }
})

import { SettingsStorageService } from '#src-core/services/SettingsStorageService'
import { DEFAULT_SETTINGS, type AppSettings } from '#src-core/types/domain/settings.types'

describe('SettingsStorageService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    SettingsStorageService.configure('com.metria.app.dev')
  })

  it('persiste les réglages encodés sous l’identifiant configuré', async (): Promise<void> => {
    mkdirMock.mockResolvedValue(undefined)
    writeTextFileMock.mockResolvedValue(undefined)

    const settings: AppSettings = { locale: 'en' }
    await SettingsStorageService.save(settings)

    expect(mkdirMock).toHaveBeenCalledWith('com.metria.app.dev', expect.any(Object))
    expect(writeTextFileMock).toHaveBeenCalledTimes(1)

    const [path, encoded]: [string, string] = writeTextFileMock.mock.calls[0] as [string, string]
    expect(path).toBe('com.metria.app.dev/settings.dat')
    expect(JSON.parse(atob(encoded))).toEqual(settings)
  })

  it('charge et fusionne avec les défauts', async (): Promise<void> => {
    existsMock.mockResolvedValue(true)
    const encoded: string = btoa(JSON.stringify({ locale: 'en' }))
    readTextFileMock.mockResolvedValue(encoded)

    const loaded: AppSettings | null = await SettingsStorageService.load()

    expect(loaded).toEqual({ ...DEFAULT_SETTINGS, locale: 'en' })
  })

  it('retourne null si le fichier est absent', async (): Promise<void> => {
    existsMock.mockResolvedValue(false)

    await expect(SettingsStorageService.load()).resolves.toBeNull()
  })

  it('retourne null si la lecture échoue', async (): Promise<void> => {
    existsMock.mockRejectedValue(new Error('io'))

    await expect(SettingsStorageService.load()).resolves.toBeNull()
  })

  it('supprime le fichier de réglages lorsqu’il existe', async (): Promise<void> => {
    existsMock.mockResolvedValue(true)
    removeMock.mockResolvedValue(undefined)

    await SettingsStorageService.clear()

    expect(removeMock).toHaveBeenCalledWith('com.metria.app.dev/settings.dat', expect.any(Object))
  })

  it('ignore clear si le fichier est absent', async (): Promise<void> => {
    existsMock.mockResolvedValue(false)

    await SettingsStorageService.clear()

    expect(removeMock).not.toHaveBeenCalled()
  })

  it('ignore clear si exists lève une erreur', async (): Promise<void> => {
    existsMock.mockRejectedValue(new Error('missing dir'))

    await expect(SettingsStorageService.clear()).resolves.toBeUndefined()
  })

  it('conserve l’identifiant si configure reçoit une chaîne vide', async (): Promise<void> => {
    SettingsStorageService.configure('com.metria.app')
    SettingsStorageService.configure('   ')

    mkdirMock.mockResolvedValue(undefined)
    writeTextFileMock.mockResolvedValue(undefined)

    await SettingsStorageService.save({ locale: 'fr' })

    expect(writeTextFileMock.mock.calls[0]?.[0]).toBe('com.metria.app/settings.dat')
  })
})
