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

import { CredentialsStorageService } from '#src-core/services/CredentialsStorageService'

/**
 * Encode UTF-8 → base64 comme le service.
 * @param {string} value - Chaîne source.
 * @returns {string} Base64.
 */
function encodeUtf8(value: string): string {
  const bytes: Uint8Array = new TextEncoder().encode(value)
  let binary: string = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

describe('CredentialsStorageService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    CredentialsStorageService.configure('com.metria.app.dev')
  })

  it('persiste les identifiants encodés sous l’identifiant configuré', async (): Promise<void> => {
    mkdirMock.mockResolvedValue(undefined)
    writeTextFileMock.mockResolvedValue(undefined)

    await CredentialsStorageService.save('ada@metria.app', 'secret')

    expect(mkdirMock).toHaveBeenCalledWith('com.metria.app.dev', expect.any(Object))
    expect(writeTextFileMock).toHaveBeenCalledTimes(1)

    const [path, encoded]: [string, string] = writeTextFileMock.mock.calls[0] as [string, string]
    expect(path).toBe('com.metria.app.dev/saved_credentials.dat')

    const binary: string = atob(encoded)
    const bytes: Uint8Array = new Uint8Array(binary.length)

    for (let index: number = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    expect(JSON.parse(new TextDecoder().decode(bytes))).toEqual({
      email: 'ada@metria.app',
      password: 'secret',
      autoLogin: true,
    })
  })

  it('charge les identifiants quand le fichier existe', async (): Promise<void> => {
    existsMock.mockResolvedValue(true)
    readTextFileMock.mockResolvedValue(
      encodeUtf8(JSON.stringify({ email: 'ada@metria.app', password: 'secret', autoLogin: true })),
    )

    await expect(CredentialsStorageService.load()).resolves.toEqual({
      email: 'ada@metria.app',
      password: 'secret',
      autoLogin: true,
    })
  })

  it('retourne null si le fichier est absent', async (): Promise<void> => {
    existsMock.mockResolvedValue(false)

    await expect(CredentialsStorageService.load()).resolves.toBeNull()
  })

  it('désactive autoLogin sans supprimer le fichier', async (): Promise<void> => {
    existsMock.mockResolvedValue(true)
    readTextFileMock.mockResolvedValue(
      encodeUtf8(JSON.stringify({ email: 'ada@metria.app', password: 'secret', autoLogin: true })),
    )
    writeTextFileMock.mockResolvedValue(undefined)

    await CredentialsStorageService.disableAutoLogin()

    const encoded: string = writeTextFileMock.mock.calls[0]?.[1] as string
    const binary: string = atob(encoded)
    const bytes: Uint8Array = new Uint8Array(binary.length)

    for (let index: number = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    expect(JSON.parse(new TextDecoder().decode(bytes))).toEqual({
      email: 'ada@metria.app',
      password: 'secret',
      autoLogin: false,
    })
  })

  it('supprime le fichier de credentials lorsqu’il existe', async (): Promise<void> => {
    existsMock.mockResolvedValue(true)
    removeMock.mockResolvedValue(undefined)

    await CredentialsStorageService.clear()

    expect(removeMock).toHaveBeenCalledWith('com.metria.app.dev/saved_credentials.dat', expect.any(Object))
  })

  it('no-op disableAutoLogin si aucun fichier', async (): Promise<void> => {
    existsMock.mockResolvedValue(false)

    await CredentialsStorageService.disableAutoLogin()

    expect(writeTextFileMock).not.toHaveBeenCalled()
  })

  it('ignore clear si exists lève une erreur', async (): Promise<void> => {
    existsMock.mockRejectedValue(new Error('missing dir'))

    await expect(CredentialsStorageService.clear()).resolves.toBeUndefined()
  })

  it('conserve l’identifiant si configure reçoit une chaîne vide', async (): Promise<void> => {
    CredentialsStorageService.configure('com.metria.app')
    CredentialsStorageService.configure('   ')

    mkdirMock.mockResolvedValue(undefined)
    writeTextFileMock.mockResolvedValue(undefined)

    await CredentialsStorageService.save('a@b.c', 'x')

    expect(writeTextFileMock.mock.calls[0]?.[0]).toBe('com.metria.app/saved_credentials.dat')
  })
})
