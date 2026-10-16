import { reactive } from 'vue';
import { type VcsUiApp, ButtonLocation } from '@vcmap/ui';
import { createToggleAction, VcsList } from '@vcmap/ui';
import config from '../config.json';
import { exportLinks } from './config-export-url.json';
import { getBaseParams, interpolateUrl } from './export-url';

export const goToOptions = {
  name: 'Go to',
  title: 'Go to',
  icon: '$vcsLogout',
};

export function registerContent(app: VcsUiApp): void {
  const items = exportLinks.map((link) =>
    reactive({
      title: link.labelKey,
      ...(link.icon ? { icon: link.icon } : {}),
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
    }),
  );

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
}
