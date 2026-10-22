export type BaseParams = {
  LUREF_X: number;
  LUREF_Y: number;
  LON: number;
  LAT: number;
  ELEVATION: number;
  LANG: string;
  BBOX: string;
  BBOX_GEOJSON: string;
  LAYER_IDS: string;
  LAYER_IDS_SPACES: string;
  DYNAMIC_PARAMETER_DATA: string;
};

export type ExportLink = {
  labelKey: string;
  icon?: string;
  useLocationInfoCoords: boolean;
  url: string;
  userType?: string[];
  userRoles?: string[];
};
