import type { VcsUiApp } from '@vcmap/ui';
import proj4 from 'proj4';
import {
  buildBboxGeoJson,
  getBboxFromScene,
  getBboxFromViewpoint,
} from './bbox';
import {
  DEFAULT_ELEVATION,
  getElevationFromCamera,
  getElevationFromTerrain,
} from './elevation';
import { initProjection, PROJECTION_LUX, PROJECTION_WGS84 } from './projection';
import type { BaseParams } from './export-url.model';

export function interpolateUrl(
  url: string,
  params: Record<string, number | string>,
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, encodeURIComponent(value)),
    url,
  );
}

function buildDynamicParameterData(
  layerIds: string,
  bboxGeoJson: string,
): string {
  return JSON.stringify([
    {
      name: 'layers',
      defaultValue: layerIds,
    },
    {
      name: 'GEOJSON',
      defaultValue: bboxGeoJson,
    },
  ]);
}

function getActiveLayerIds(app: VcsUiApp): string[] {
  return [...app.layers]
    .filter((layer) => layer.active)
    .map((layer) => layer.properties.luxId as string | undefined)
    .filter((id) => id !== undefined);
}

export async function getBaseParams(app: VcsUiApp): Promise<BaseParams | null> {
  const map = app.maps.activeMap;
  if (!map) {
    return null;
  }
  let viewpoint;
  try {
    viewpoint = await map.getViewpoint();
  } catch {
    return null;
  }
  const position = viewpoint?.groundPosition ?? viewpoint?.cameraPosition;
  if (!position) {
    return null;
  }
  initProjection();
  const [lon, lat] = position;
  const luref = proj4(PROJECTION_WGS84, PROJECTION_LUX, [lon, lat]);
  const elevation =
    (await getElevationFromTerrain(map, lon, lat)) ??
    (viewpoint ? getElevationFromCamera(viewpoint) : null) ??
    DEFAULT_ELEVATION;
  const bbox = viewpoint
    ? (getBboxFromScene(map) ?? getBboxFromViewpoint(viewpoint, lon, lat))
    : [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01];
  const bboxGeoJson = buildBboxGeoJson(bbox);
  const layerIds = getActiveLayerIds(app);
  return {
    LUREF_X: Math.round(luref[0]),
    LUREF_Y: Math.round(luref[1]),
    LON: lon,
    LAT: lat,
    ELEVATION: Math.round(elevation),
    LANG: app.locale,
    BBOX: bbox.join(','),
    BBOX_GEOJSON: bboxGeoJson,
    LAYER_IDS: layerIds.join(','),
    LAYER_IDS_SPACES: layerIds.join(' '),
    DYNAMIC_PARAMETER_DATA: buildDynamicParameterData(
      layerIds.join(' '),
      bboxGeoJson,
    ),
  };
}
