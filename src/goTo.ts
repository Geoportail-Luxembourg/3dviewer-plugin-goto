import { reactive, watch, type WatchStopHandle } from 'vue';
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

const AUTH_PLUGIN_NAME = '@geoportallux/lux-3dviewer-plugin-auth';

type AuthUser = {
  login: string;
  role?: string;
  typeUtilisateur?: string;
  typeUtisilisateur?: string;
};

type AuthPlugin = {
  readonly userState: { user: AuthUser | null };
};

type ExportLink = {
  labelKey: string;
  icon?: string;
  useLocationInfoCoords: boolean;
  url: string;
  userType?: string[];
  userRoles?: string[];
};

type GoToListItem = {
  title: string;
  icon?: string;
  clickedCallbacks: Array<(event: PointerEvent) => Promise<void>>;
};

function isLinkVisible(link: ExportLink, user: AuthUser | null): boolean {
  const hasRestriction = !!(link.userType?.length || link.userRoles?.length);
  if (!hasRestriction) {
    return true;
  }
  if (!user) {
    return false;
  }
  const userType = user.typeUtilisateur ?? user.typeUtisilisateur;
  const userRole = user.role;

  return (
    (!!userType && !!link.userType?.includes(userType)) ||
    (!!userRole && !!link.userRoles?.includes(userRole))
  );
}

function getAuthPlugin(app: VcsUiApp): AuthPlugin | undefined {
  return app.plugins.getByKey(AUTH_PLUGIN_NAME) as AuthPlugin | undefined;
}

function getAuthUser(app: VcsUiApp): AuthUser | null {
  return getAuthPlugin(app)?.userState.user ?? null;
}

export function registerContent(app: VcsUiApp): () => void {
  const links = exportLinks as ExportLink[];
  const items = reactive<GoToListItem[]>([]);

  function createItem(link: ExportLink): GoToListItem {
    return reactive({
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
    });
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
