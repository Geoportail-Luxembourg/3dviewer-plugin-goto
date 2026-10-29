export const AUTH_PLUGIN_NAME = '@geoportallux/lux-3dviewer-plugin-auth';

export type AuthUser = {
  login: string;
  role?: string;
  typeUtilisateur?: string;
};

export type AuthPlugin = {
  readonly userState: { user: AuthUser | null };
};
