import type { LocalizedString } from "./types";
import type { Entity as PcEntity, Script as PcScript } from "playcanvas";
import i18n from "i18next";

export function getEntityScript<TScript extends PcScript>(
  entity: PcEntity,
  scriptName: string
): TScript {
  return entity.script?.get(scriptName) as unknown as TScript;
}

/**
 * Get the localized string for the current language
 */
export function getLocalizedString(localizedString: LocalizedString): string {
  const currentLanguage = i18n.language;
  return (
    localizedString[currentLanguage as keyof LocalizedString] ||
    localizedString.en
  );
}
