export const I18N_NAMESPACE = 'lux3dviewerPluginGoto';

export function i18nKey(key: string): string {
  return `${I18N_NAMESPACE}.${key}`;
}

export const goToTranslations: Record<string, object> = {
  en: { [I18N_NAMESPACE]: { goTo: 'Go to' } },
  fr: { [I18N_NAMESPACE]: { goTo: 'Aller vers' } },
  de: { [I18N_NAMESPACE]: { goTo: 'Gehe zu' } },
  lb: { [I18N_NAMESPACE]: { goTo: 'Géi op' } },
};
