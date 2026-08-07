import { BaseDirectory, exists, mkdir, readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs'

import type { AppSettings } from '#src-core/types/domain/settings.types'
import { DEFAULT_SETTINGS } from '#src-core/types/domain/settings.types'

/**
 * Service de persistance des réglages sur le système de fichiers OS (aucun backend).
 * Les données sont encodées en base64 avant écriture pour éviter le stockage en clair.
 *
 * L'identifiant de l'application doit être injecté via configure() au démarrage
 * (plugin Nuxt settings-storage.client.ts) pour que le chemin du fichier
 * soit résolu selon l'environnement courant.
 *
 * Chemin résolu :
 * Windows : %APPDATA%\{identifier}\settings.dat
 * macOS   : ~/Library/Application Support/{identifier}/settings.dat
 * Linux   : ~/.local/share/{identifier}/settings.dat
 */
export class SettingsStorageService {
  /**
   * Identifiant de l'application injecté par le plugin au démarrage.
   * Détermine le sous-dossier de stockage dans BaseDirectory.Data.
   */
  private static _identifier: string = 'com.metria.app'

  /**
   * Configure l'identifiant de l'application.
   * Doit être appelé une seule fois au démarrage via le plugin Nuxt.
   * @param {string} identifier - Identifiant bundle de l'application.
   * @returns {void}
   */
  public static configure(identifier: string): void {
    if (identifier.trim().length > 0) {
      this._identifier = identifier.trim()
    }
  }

  /**
   * Retourne le chemin du fichier de réglages relatif à BaseDirectory.Data.
   * @returns {string} Chemin relatif du fichier.
   */
  private static get settingsFile(): string {
    return `${this._identifier}/settings.dat`
  }

  /**
   * Encode une chaîne UTF-8 en base64 (sans dépendre du charset latin1 de btoa).
   * @param {string} value - Chaîne à encoder.
   * @returns {string} Chaîne base64.
   */
  private static encode(value: string): string {
    const bytes: Uint8Array = new TextEncoder().encode(value)
    let binary: string = ''

    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }

    return btoa(binary)
  }

  /**
   * Décode une chaîne base64 vers UTF-8.
   * @param {string} value - Chaîne base64.
   * @returns {string} Chaîne décodée.
   */
  private static decode(value: string): string {
    const binary: string = atob(value)
    const bytes: Uint8Array = new Uint8Array(binary.length)

    for (let index: number = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    return new TextDecoder().decode(bytes)
  }

  /**
   * Crée le dossier de l'application dans Data s'il n'existe pas encore.
   * Nécessaire au premier lancement avant toute lecture ou écriture.
   * @returns {Promise<void>}
   */
  private static async ensureDirectory(): Promise<void> {
    await mkdir(this._identifier, { baseDir: BaseDirectory.Data, recursive: true })
  }

  /**
   * Encode et écrit les réglages dans le fichier Data.
   * @param {AppSettings} settings - Réglages complets à persister.
   * @returns {Promise<void>}
   */
  public static async save(settings: AppSettings): Promise<void> {
    await this.ensureDirectory()

    const encoded: string = this.encode(JSON.stringify(settings))

    await writeTextFile(this.settingsFile, encoded, { baseDir: BaseDirectory.Data })
  }

  /**
   * Lit et décode les réglages depuis le fichier Data, complétés par les défauts.
   * @returns {Promise<AppSettings | null>} Les réglages ou null si le fichier n'existe pas.
   */
  public static async load(): Promise<AppSettings | null> {
    try {
      const fileExists: boolean = await exists(this.settingsFile, { baseDir: BaseDirectory.Data })

      if (!fileExists) {
        return null
      }

      const encoded: string = await readTextFile(this.settingsFile, { baseDir: BaseDirectory.Data })
      const parsed: Partial<AppSettings> = JSON.parse(this.decode(encoded)) as Partial<AppSettings>

      return { ...DEFAULT_SETTINGS, ...parsed }
    } catch {
      return null
    }
  }

  /**
   * Supprime le fichier de réglages (réinitialisation complète).
   * @returns {Promise<void>}
   */
  public static async clear(): Promise<void> {
    try {
      const fileExists: boolean = await exists(this.settingsFile, { baseDir: BaseDirectory.Data })

      if (fileExists) {
        await remove(this.settingsFile, { baseDir: BaseDirectory.Data })
      }
    } catch {
      // Dossier absent — rien à supprimer.
    }
  }
}
