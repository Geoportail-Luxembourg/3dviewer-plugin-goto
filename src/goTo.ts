import { reactive, watch, type WatchStopHandle } from 'vue';
import {
  type VcsUiApp,
  ButtonLocation,
  createToggleAction,
  VcsList,
  type VcsListItem,
} from '@vcmap/ui';
import config from '../config.json';
import { exportLinks } from './config-export-url.json';
import { getAuthPlugin, getAuthUser, isLinkVisible } from './auth';
import { getBaseParams, interpolateUrl } from './export-url';
import type { ExportLink } from './export-url.model';

export const goToOptions = {
  name: 'Go to',
  title: 'Go to',
  icon: '$vcsLogout',
};

export function registerContent(app: VcsUiApp): () => void {
  const links = exportLinks as ExportLink[];
  const items = reactive<VcsListItem[]>([]);

  function createItem(link: ExportLink): VcsListItem {
    return {
      name: link.labelKey,
      title: link.labelKey,
      ...(link.icon ? { icon: link.icon } : {}),
      ...(link.tooltipKey ? { tooltip: link.tooltipKey } : {}),
      clickedCallbacks: [
        async (event: PointerEvent): Promise<void> => {
          event.preventDefault();
          const params = await getBaseParams(app);
          if (!params) {
            return;
          }
          window.open(interpolateUrl(link.url, params), '_blank');
        },
      ],
    };
  }

  function rebuildItems(): void {
    const user = getAuthUser(app);
    items.splice(
      0,
      items.length,
      ...links.filter((link) => isLinkVisible(link, user)).map(createItem),
    );
  }

  let stopUserWatch: WatchStopHandle | undefined;

  function bindUserWatch(): void {
    stopUserWatch?.();
    const authPlugin = getAuthPlugin(app);
    stopUserWatch = watch(
      () => authPlugin?.userState.user,
      () => {
        rebuildItems();
      },
    );
  }

  bindUserWatch();
  rebuildItems();
  const unbindPluginListeners = [
    app.plugins.added.addEventListener(() => {
      bindUserWatch();
      rebuildItems();
    }),
    app.plugins.removed.addEventListener(() => {
      bindUserWatch();
      rebuildItems();
    }),
  ];

  const { action } = createToggleAction(
    {
      name: goToOptions.name,
      title: goToOptions.title,
      icon: goToOptions.icon,
    },
    {
      id: config.name,
      props: {
        items,
        selectable: true,
        singleSelect: true,
      },
      state: {
        headerTitle: goToOptions.name,
        headerIcon: goToOptions.icon,
      },
      position: {
        top: 0,
        left: 322,
      },
      component: VcsList,
    },
    app.windowManager,
    config.name,
  );

  app.navbarManager.add(
    { id: 'goto', action },
    config.name,
    ButtonLocation.CONTENT,
    { desktop: true, tablet: true, mobile: true },
  );

  return () => {
    stopUserWatch?.();
    unbindPluginListeners.forEach((unbind) => {
      unbind();
    });
  };
}
