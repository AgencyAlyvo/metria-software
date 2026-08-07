import { describe, expect, it } from 'vitest'

import { readJwtSubject } from '#src-core/utils/jwt-subject'

describe('readJwtSubject', (): void => {
  it('lit le claim sub d’un JWT non vérifié', (): void => {
    const header: string = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload: string = Buffer.from(JSON.stringify({ sub: '11111111-1111-1111-1111-111111111111' })).toString(
      'base64url',
    )
    const token: string = `${header}.${payload}.sig`

    expect(readJwtSubject(token)).toBe('11111111-1111-1111-1111-111111111111')
  })

  it('retourne undefined si le token est invalide', (): void => {
    expect(readJwtSubject(undefined)).toBeUndefined()
    expect(readJwtSubject('not-a-jwt')).toBeUndefined()
    expect(readJwtSubject('a.%%%invalid%%%.c')).toBeUndefined()
  })

  it('retourne undefined si le payload n’a pas de sub string', (): void => {
    const header: string = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const payload: string = Buffer.from(JSON.stringify({ role: 'user' })).toString('base64url')
    expect(readJwtSubject(`${header}.${payload}.sig`)).toBeUndefined()
  })

  it('décode via atob quand Buffer est absent', (): void => {
    const originalBuffer: typeof Buffer | undefined = globalThis.Buffer
    // @ts-expect-error force browser path
    delete globalThis.Buffer

    try {
      const header: string = btoa(JSON.stringify({ alg: 'none' }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
      const payload: string = btoa(JSON.stringify({ sub: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
      expect(readJwtSubject(`${header}.${payload}.sig`)).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    } finally {
      globalThis.Buffer = originalBuffer as typeof Buffer
    }
  })
})
