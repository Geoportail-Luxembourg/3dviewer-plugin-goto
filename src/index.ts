import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import { registerContent } from './goTo';
import { goToTranslations } from './i18n';
import { resolveExportLinks, type PluginConfig } from './config';

type PluginState = object;

type GoToPlugin = VcsPlugin<PluginConfig, PluginState>;

export default function plugin(pluginConfig: PluginConfig = {}): GoToPlugin {
  const exportLinks = resolveExportLinks(pluginConfig);
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
    i18n: goToTranslations,
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
      return pluginConfig.exportLinks
        ? { exportLinks: pluginConfig.exportLinks }
        : {};
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
