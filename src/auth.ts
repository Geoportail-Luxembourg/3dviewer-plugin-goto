import type { VcsUiApp } from '@vcmap/ui';
import { AUTH_PLUGIN_NAME, type AuthPlugin, type AuthUser } from './auth.model';
import type { ExportLink } from './export-url.model';

export function getAuthPlugin(app: VcsUiApp): AuthPlugin | undefined {
  return app.plugins.getByKey(AUTH_PLUGIN_NAME) as AuthPlugin | undefined;
}

export function getAuthUser(app: VcsUiApp): AuthUser | null {
  return getAuthPlugin(app)?.userState.user ?? null;
}

export function isLinkVisible(
  link: ExportLink,
  user: AuthUser | null,
): boolean {
  const hasRestriction = !!(link.userType?.length || link.userRoles?.length);
  if (!hasRestriction) {
    return true;
  }
  if (!user) {
    return false;
  }
  const userType = user.typeUtilisateur;
  const userRole = user.role;

  return (
    (!!userType && !!link.userType?.includes(userType)) ||
    (!!userRole && !!link.userRoles?.includes(userRole))
  );
}
