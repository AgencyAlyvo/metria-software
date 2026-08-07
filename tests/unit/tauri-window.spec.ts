import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const {
  getCurrentWindowMock,
  setDecorationsMock,
  setResizableMock,
  setMinSizeMock,
  setSizeMock,
  centerMock,
  maximizeMock,
  unmaximizeMock,
  isMaximizedMock,
  LogicalSizeMock,
}: {
  getCurrentWindowMock: Mock
  setDecorationsMock: Mock
  setResizableMock: Mock
  setMinSizeMock: Mock
  setSizeMock: Mock
  centerMock: Mock
  maximizeMock: Mock
  unmaximizeMock: Mock
  isMaximizedMock: Mock
  LogicalSizeMock: Mock
} = vi.hoisted(
  (): {
    getCurrentWindowMock: Mock
    setDecorationsMock: Mock
    setResizableMock: Mock
    setMinSizeMock: Mock
    setSizeMock: Mock
    centerMock: Mock
    maximizeMock: Mock
    unmaximizeMock: Mock
    isMaximizedMock: Mock
    LogicalSizeMock: Mock
  } => {
    return {
      getCurrentWindowMock: vi.fn(),
      setDecorationsMock: vi.fn(),
      setResizableMock: vi.fn(),
      setMinSizeMock: vi.fn(),
      setSizeMock: vi.fn(),
      centerMock: vi.fn(),
      maximizeMock: vi.fn(),
      unmaximizeMock: vi.fn(),
      isMaximizedMock: vi.fn(),
      LogicalSizeMock: vi.fn(function LogicalSize(
        this: { width: number; height: number },
        width: number,
        height: number,
      ) {
        this.width = width
        this.height = height
      }),
    }
  },
)

vi.mock('@tauri-apps/api/dpi', (): Record<string, unknown> => {
  return {
    LogicalSize: LogicalSizeMock,
  }
})

vi.mock('@tauri-apps/api/window', (): Record<string, unknown> => {
  return {
    /**
     * Mock getCurrentWindow.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    getCurrentWindow: (...args: unknown[]): unknown => getCurrentWindowMock(...args),
  }
})

import { TauriWindowService } from '#src-core/services/TauriWindowService'

describe('TauriWindowService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    getCurrentWindowMock.mockReturnValue({
      setDecorations: setDecorationsMock,
      setResizable: setResizableMock,
      setMinSize: setMinSizeMock,
      setSize: setSizeMock,
      center: centerMock,
      maximize: maximizeMock,
      unmaximize: unmaximizeMock,
      isMaximized: isMaximizedMock,
    })
    setDecorationsMock.mockResolvedValue(undefined)
    setResizableMock.mockResolvedValue(undefined)
    setMinSizeMock.mockResolvedValue(undefined)
    setSizeMock.mockResolvedValue(undefined)
    centerMock.mockResolvedValue(undefined)
    maximizeMock.mockResolvedValue(undefined)
    unmaximizeMock.mockResolvedValue(undefined)
    isMaximizedMock.mockResolvedValue(false)
  })

  it('configure la fenêtre update 290×380 non redimensionnable', async (): Promise<void> => {
    await TauriWindowService.configureUpdateWindow()

    expect(setDecorationsMock).toHaveBeenCalledWith(false)
    expect(setResizableMock).toHaveBeenCalledWith(false)
    expect(setSizeMock).toHaveBeenCalled()
    expect(LogicalSizeMock).toHaveBeenCalledWith(290, 380)
    expect(centerMock).toHaveBeenCalled()
    expect(maximizeMock).not.toHaveBeenCalled()
  })

  it('configure la fenêtre login 400×595 non redimensionnable', async (): Promise<void> => {
    await TauriWindowService.configureLoginWindow(true)

    expect(setDecorationsMock).toHaveBeenCalledWith(false)
    expect(setResizableMock).toHaveBeenCalledWith(false)
    expect(setSizeMock).toHaveBeenCalled()
    expect(LogicalSizeMock).toHaveBeenCalledWith(400, 595)
    expect(centerMock).toHaveBeenCalled()
  })

  it('ne recentre pas la fenêtre login si center=false', async (): Promise<void> => {
    await TauriWindowService.configureLoginWindow(false)

    expect(centerMock).not.toHaveBeenCalled()
  })

  it('configure la fenêtre principale 1280×720 maximisée', async (): Promise<void> => {
    await TauriWindowService.configureMainWindow()

    expect(setResizableMock).toHaveBeenCalledWith(true)
    expect(LogicalSizeMock).toHaveBeenCalledWith(1280, 720)
    expect(maximizeMock).toHaveBeenCalled()
  })

  it('unmaximize si la fenêtre était maximisée pour le login', async (): Promise<void> => {
    isMaximizedMock.mockResolvedValue(true)

    await TauriWindowService.configureLoginWindow(true)

    expect(unmaximizeMock).toHaveBeenCalled()
    expect(maximizeMock).not.toHaveBeenCalled()
  })
})
