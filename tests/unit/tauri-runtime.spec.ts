import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isTauriRuntime } from '#src-core/utils/tauri-runtime'

describe('isTauriRuntime', (): void => {
  beforeEach((): void => {
    vi.stubGlobal('window', globalThis as unknown as Window & typeof globalThis)
  })

  afterEach((): void => {
    Reflect.deleteProperty(globalThis as object, '__TAURI_INTERNALS__')
    vi.unstubAllGlobals()
  })

  it('retourne false hors shell Tauri', (): void => {
    expect(isTauriRuntime()).toBe(false)
  })

  it('retourne true lorsque __TAURI_INTERNALS__ est présent', (): void => {
    Object.defineProperty(globalThis, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true,
    })

    expect(isTauriRuntime()).toBe(true)
  })
})
