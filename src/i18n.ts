export const I18N_NAMESPACE = 'lux3dviewerPluginGoto';

export function i18nKey(key: string): string {
  return `${I18N_NAMESPACE}.${key}`;
}

/* eslint-disable @typescript-eslint/naming-convention */
const baseMessages = {
  'Generic export': 'Generic export',
  Lidar: 'LiDAR',
  ACT2BIM: 'ACT2BIM',
  Minecraft: 'Minecraft',
  'Lien vers Cyclomédia': 'Cyclomedia',
  'Ouvrir streetView': 'Street View',
};

export const goToTranslations: Record<string, object> = {
  en: {
    [I18N_NAMESPACE]: {
      ...baseMessages,
      '3D Print': '3D Print',
      'Go to': 'Go to',
      'Generate a 3D printable model': 'Generate a 3D printable model',
      'Explore point cloud data': 'Explore point cloud data',
      'Export 3D Model into BIM formats': 'Export 3D Model into BIM formats',
      'Export 3D Model to Minecraft': 'Export 3D Model to Minecraft',
      'Open Street View': 'Open Street View',
    },
  },
  fr: {
    [I18N_NAMESPACE]: {
      ...baseMessages,
      '3D Print': 'Impression 3D',
      'Go to': 'Aller vers',
      'Generate a 3D printable model': 'Générer un modèle imprimable en 3D',
      'Explore point cloud data': 'Explorer les nuages de points',
      'Export 3D Model into BIM formats':
        'Exporter le modèle 3D en formats BIM',
      'Export 3D Model to Minecraft': 'Exporter le modèle 3D vers Minecraft',
      'Open Street View': 'Ouvrir Street View',
    },
  },
  de: {
    [I18N_NAMESPACE]: {
      ...baseMessages,
      '3D Print': '3D Druck',
      'Go to': 'Gehe zu',
      'Generate a 3D printable model': 'Ein 3D-druckbares Modell erstellen',
      'Explore point cloud data': 'Punktwolken erkunden',
      'Export 3D Model into BIM formats':
        '3D Modell in BIM Formate konvertieren',
      'Export 3D Model to Minecraft': '3D Modell für Minecraft konvertieren',
      'Open Street View': 'Street View öffnen',
    },
  },
  lb: {
    [I18N_NAMESPACE]: {
      ...baseMessages,
      '3D Print': '3D Print',
      'Go to': 'Géi op',
      'Generate a 3D printable model': 'En 3D-dréckbare Modell erstellen',
      'Explore point cloud data': 'Punktwolleken ukucken',
      'Export 3D Model into BIM formats':
        '3D Modell an BIM Formater ëmwandelen',
      'Export 3D Model to Minecraft': '3D Modell a Minecraft konvertieren',
      'Open Street View': 'Street View opmaachen',
    },
  },
};
/* eslint-enable @typescript-eslint/naming-convention */
