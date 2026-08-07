import { BaseDirectory, exists, mkdir, readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs'

/**
 * Données persistées sur le disque pour la feature "Rester connecté".
 */
export type StoredCredentials = {
  email: string
  password: string
  autoLogin: boolean
}

/**
 * Service de persistance des identifiants sur le système de fichiers OS.
 * Les données sont encodées en base64 (UTF-8) avant écriture : ce n'est pas un chiffrement
 * (lisible après décodage). Objectif : éviter le plaintext brut dans le fichier uniquement ;
 * un stockage sécurisé (keychain OS) pourra remplacer ce mécanisme plus tard.
 *
 * L'identifiant de l'application doit être injecté via configure() au démarrage
 * (plugin Nuxt credentials-storage.client.ts) pour que le chemin du fichier
 * soit résolu selon l'environnement courant.
 *
 * Chemin résolu :
 * Windows : %APPDATA%\{identifier}\saved_credentials.dat
 * macOS   : ~/Library/Application Support/{identifier}/saved_credentials.dat
 * Linux   : ~/.local/share/{identifier}/saved_credentials.dat
 */
export class CredentialsStorageService {
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
   * Retourne le chemin du fichier de credentials relatif à BaseDirectory.Data.
   * @returns {string} Chemin relatif du fichier.
   */
  private static get credentialsFile(): string {
    return `${this._identifier}/saved_credentials.dat`
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
   * Encode et écrit les identifiants dans le fichier Data avec autoLogin activé.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @returns {Promise<void>}
   */
  public static async save(email: string, password: string): Promise<void> {
    await this.ensureDirectory()

    const data: StoredCredentials = { email, password, autoLogin: true }
    const encoded: string = this.encode(JSON.stringify(data))

    await writeTextFile(this.credentialsFile, encoded, { baseDir: BaseDirectory.Data })
  }

  /**
   * Lit et décode les identifiants depuis le fichier Data.
   * @returns {Promise<StoredCredentials | null>} Les identifiants ou null si le fichier n'existe pas.
   */
  public static async load(): Promise<StoredCredentials | null> {
    try {
      const fileExists: boolean = await exists(this.credentialsFile, { baseDir: BaseDirectory.Data })

      if (!fileExists) {
        return null
      }

      const encoded: string = await readTextFile(this.credentialsFile, { baseDir: BaseDirectory.Data })
      return JSON.parse(this.decode(encoded)) as StoredCredentials
    } catch {
      return null
    }
  }

  /**
   * Désactive l'auto-connexion sans supprimer les identifiants.
   * Appelé après une déconnexion manuelle pour pré-remplir le formulaire sans se connecter auto.
   * @returns {Promise<void>}
   */
  public static async disableAutoLogin(): Promise<void> {
    const stored: StoredCredentials | null = await this.load()

    if (!stored) {
      return
    }

    const updated: StoredCredentials = { ...stored, autoLogin: false }
    const encoded: string = this.encode(JSON.stringify(updated))

    await writeTextFile(this.credentialsFile, encoded, { baseDir: BaseDirectory.Data })
  }

  /**
   * Supprime le fichier de credentials (décocher "Rester connecté").
   * @returns {Promise<void>}
   */
  public static async clear(): Promise<void> {
    try {
      const fileExists: boolean = await exists(this.credentialsFile, { baseDir: BaseDirectory.Data })

      if (fileExists) {
        await remove(this.credentialsFile, { baseDir: BaseDirectory.Data })
      }
    } catch {
      // Dossier absent — rien à supprimer.
    }
  }
}
