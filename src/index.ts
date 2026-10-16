import type { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import { registerContent } from './goTo';

type PluginConfig = object;
type PluginState = object;

type MyPlugin = VcsPlugin<PluginConfig, PluginState>;

/* eslint-disable @typescript-eslint/naming-convention */
const goToMessages = {
  Lidar: 'LiDAR',
  ACT2BIM: 'ACT2BIM',
  Minecraft: 'Minecraft',
  'Lien vers Cyclomédia': 'Cyclomedia',
  'Ouvrir streetView': 'Street View',
};

const goToTranslations: Record<string, object> = {
  en: { ...goToMessages, 'Go to': 'Go to' },
  fr: { ...goToMessages, 'Go to': 'Aller vers' },
  de: { ...goToMessages, 'Go to': 'Gehe zu' },
  lb: { ...goToMessages, 'Go to': 'Géi op' },
};
/* eslint-enable @typescript-eslint/naming-convention */

export default function plugin(
  config: PluginConfig,
  baseUrl: string,
): MyPlugin {
  // eslint-disable-next-line no-console
  console.log(config, baseUrl);
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
    initialize(): Promise<void> {
      return Promise.resolve();
    },
    onVcsAppMounted(vcsUiApp: VcsUiApp): void {
      registerContent(vcsUiApp);
    },
    /**
     * should return all default values of the configuration
     */
    getDefaultOptions(): PluginConfig {
      return {};
    },
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): PluginConfig {
      // eslint-disable-next-line no-console
      console.log('Called when serializing this plugin instance');
      return {};
    },
    /**
     * should return the plugins state
     * @param {boolean} forUrl
     * @returns {PluginState}
     */
    getState(forUrl?: boolean): PluginState {
      // eslint-disable-next-line no-console
      console.log('Called when collecting state, e.g. for create link', forUrl);
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
      // eslint-disable-next-line no-console
      console.log('hook to cleanup');
    },
  };
}
