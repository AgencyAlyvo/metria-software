/**
 * Réglages persistés génériques de l'application (fichier local utilisateur).
 * Les préférences métier (auth, IA, etc.) arriveront dans les slices suivantes.
 */
export interface AppSettings {
  /** Locale d'affichage. */
  locale: string
}

/**
 * Valeurs par défaut des réglages.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  locale: 'fr',
}
