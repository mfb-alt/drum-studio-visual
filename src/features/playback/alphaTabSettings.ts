import type * as AlphaTab from "@coderline/alphatab";

export const ALPHATAB_SOUNDFONT_URL = "/soundfont/sonivox.sf2";

export function createAlphaTabSettings(alphaTab: typeof AlphaTab): AlphaTab.Settings {
  const settings = new alphaTab.Settings();
  settings.core.fontDirectory = "/font/";
  settings.player.enablePlayer = true;
  settings.player.soundFont = ALPHATAB_SOUNDFONT_URL;
  return settings;
}
