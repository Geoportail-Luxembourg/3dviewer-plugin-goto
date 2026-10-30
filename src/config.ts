import bundledExportLinks from './config-export-url.json';
import type { ExportLink } from './export-url.model';

export type PluginConfig = {
  exportLinks?: ExportLink[];
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
