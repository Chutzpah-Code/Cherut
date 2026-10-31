import { LifeArea } from '@/lib/api/services/lifeAreas';

type PresetsTranslator = (key: string) => string;

// Preset life areas are translated live from their stable `presetSlug` via
// `tPresets` (scoped to the `lifeAreas.presets` namespace) rather than a
// literal string stored in Firestore, so the label follows the current
// locale. Renaming one sets `nameOverridden`, which switches the name (never
// the description — presets can only be renamed) to the literal stored value.
export function getLifeAreaDisplayName(area: LifeArea, tPresets: PresetsTranslator): string {
  if (area.isSystemPreset && !area.nameOverridden && area.presetSlug) {
    return tPresets(`${area.presetSlug}.name`);
  }
  return area.name;
}

export function getLifeAreaDisplayDescription(area: LifeArea, tPresets: PresetsTranslator): string | undefined {
  if (area.isSystemPreset && area.presetSlug) {
    return tPresets(`${area.presetSlug}.description`);
  }
  return area.description;
}
