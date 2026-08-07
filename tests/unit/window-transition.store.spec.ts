import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useWindowTransitionStore } from '#src-nuxt/app/stores/windowTransition.store'

describe('useWindowTransitionStore', (): void => {
  beforeEach((): void => {
    setActivePinia(createPinia())
  })

  it('bascule isLoading via setLoading', (): void => {
    const store: ReturnType<typeof useWindowTransitionStore> = useWindowTransitionStore()

    expect(store.isLoading).toBe(false)
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })
})
