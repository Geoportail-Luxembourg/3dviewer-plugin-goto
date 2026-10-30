import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import { registerContent } from './goTo';
import { resolveExportLinks, resolveI18n, type PluginConfig } from './config';

type PluginState = object;

type GoToPlugin = VcsPlugin<PluginConfig, PluginState>;

export default function plugin(pluginConfig: PluginConfig = {}): GoToPlugin {
  const exportLinks = resolveExportLinks(pluginConfig);
  const i18n = resolveI18n(pluginConfig);
  let disposeContent: (() => void) | undefined;
  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    i18n,
    onVcsAppMounted(vcsUiApp: VcsUiApp): void {
      disposeContent = registerContent(vcsUiApp, exportLinks);
    },
    /**
     * should return all default values of the configuration
     */
    getDefaultOptions(): PluginConfig {
      return { exportLinks: resolveExportLinks() };
    },
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): PluginConfig {
      const json: PluginConfig = {};
      if (pluginConfig.exportLinks) {
        json.exportLinks = pluginConfig.exportLinks;
      }
      if (pluginConfig.i18n) {
        json.i18n = pluginConfig.i18n;
      }
      return json;
    },
    /**
     * should return the plugins state
     * @returns {PluginState}
     */
    getState(): PluginState {
      return {
        prop: '*',
      };
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [];
    },
    destroy(): void {
      disposeContent?.();
      disposeContent = undefined;
    },
  };
}
