/** Placeholder settings model, kept isolated for future persistence. */
export interface StudioSettings {
  masterVolume: number;
  showPadLabels: boolean;
}

export const DEFAULT_SETTINGS: StudioSettings = {
  masterVolume: 0.8,
  showPadLabels: true,
};