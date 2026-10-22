/* eslint-disable @typescript-eslint/naming-convention */
const goToMessages = {
  Lidar: 'LiDAR',
  ACT2BIM: 'ACT2BIM',
  Minecraft: 'Minecraft',
  'Lien vers Cyclomédia': 'Cyclomedia',
  'Ouvrir streetView': 'Street View',
};

export const goToTranslations: Record<string, object> = {
  en: { ...goToMessages, 'Go to': 'Go to' },
  fr: { ...goToMessages, 'Go to': 'Aller vers' },
  de: { ...goToMessages, 'Go to': 'Gehe zu' },
  lb: { ...goToMessages, 'Go to': 'Géi op' },
};
/* eslint-enable @typescript-eslint/naming-convention */
