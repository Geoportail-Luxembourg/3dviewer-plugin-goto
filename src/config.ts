import bundledExportLinks from './config-export-url.json';
import { goToTranslations, I18N_NAMESPACE } from './i18n';
import type { ExportLink } from './export-url.model';

export type PluginConfig = {
  exportLinks?: ExportLink[];
  i18n?: Record<string, Record<string, string>>;
};

export function resolveExportLinks(
  pluginConfig: PluginConfig = {},
): ExportLink[] {
  const overrides = pluginConfig.exportLinks;
  if (!overrides) {
    return [...bundledExportLinks.exportLinks];
  }
  const overrideMap = new Map(overrides.map((link) => [link.labelKey, link]));
  const merged = bundledExportLinks.exportLinks.map(
    (link) => overrideMap.get(link.labelKey) ?? link,
  );
  const appended = overrides.filter(
    (link) =>
      !bundledExportLinks.exportLinks.some(
        (bundled) => bundled.labelKey === link.labelKey,
      ),
  );
  return [...merged, ...appended];
}

export function resolveI18n(
  pluginConfig: PluginConfig = {},
): Record<string, object> {
  const configI18n = pluginConfig.i18n;
  if (!configI18n) {
    return goToTranslations;
  }
  const locales = [
    ...new Set([...Object.keys(goToTranslations), ...Object.keys(configI18n)]),
  ];
  return Object.fromEntries(
    locales.map((locale) => {
      const bundledMessages = (
        goToTranslations[locale] as Record<string, object> | undefined
      )?.[I18N_NAMESPACE] as Record<string, string> | undefined;
      return [
        locale,
        {
          [I18N_NAMESPACE]: { ...bundledMessages, ...configI18n[locale] },
        },
      ];
    }),
  );
}
