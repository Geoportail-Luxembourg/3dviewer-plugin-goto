import type { VcsUiApp } from '@vcmap/ui';
import type { VcsMap, Viewpoint } from '@vcmap/core';
import type { Coordinate } from 'ol/coordinate.js';
import proj4 from 'proj4';

export type BaseParams = {
  LUREF_X: number;
  LUREF_Y: number;
  LON: number;
  LAT: number;
  ELEVATION: number;
  LANG: string;
};

const PROJECTION_WGS84 = 'EPSG:4326';
const PROJECTION_LUX = 'EPSG:2169';
const PROJECTION_MERCATOR = 'EPSG:3857';

const DEFAULT_ELEVATION = 300;

let projectionInitialized = false;

function initProjection(): void {
  if (projectionInitialized) {
    return;
  }
  proj4.defs(
    PROJECTION_LUX,
    '+proj=tmerc +lat_0=49.83333333333334 +lon_0=6.166666666666667 ' +
      '+k=1 +x_0=80000 +y_0=100000 +ellps=intl ' +
      '+towgs84=-189.681,18.3463,-42.7695,-0.33746,-3.09264,2.53861,0.4598 ' +
      '+units=m +no_defs',
  );
  projectionInitialized = true;
}

export function interpolateUrl(
  url: string,
  params: Record<string, number | string>,
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, encodeURIComponent(value)),
    url,
  );
}

type TerrainCapableMap = VcsMap & {
  getHeightFromTerrain(positions: Coordinate[]): Promise<Coordinate[]>;
};

function getElevationFromTerrain(
  map: VcsMap,
  lon: number,
  lat: number,
): Promise<number | null> {
  if (!('getHeightFromTerrain' in map)) {
    return Promise.resolve(null);
  }
  const terrainMap = map as TerrainCapableMap;
  const mercator = proj4(PROJECTION_WGS84, PROJECTION_MERCATOR, [lon, lat]);
  const position: Coordinate = [mercator[0], mercator[1], 0];
  return terrainMap
    .getHeightFromTerrain([position])
    .then(() => (position[2] > 0 ? position[2] : null))
    .catch(() => null);
}

function getElevationFromCamera(viewpoint: Viewpoint): number | null {
  const { cameraPosition, distance, pitch } = viewpoint;
  if (!cameraPosition || !Number.isFinite(cameraPosition[2])) {
    return null;
  }
  if (
    typeof distance !== 'number' ||
    !Number.isFinite(distance) ||
    typeof pitch !== 'number' ||
    !Number.isFinite(pitch)
  ) {
    return null;
  }
  // vertical component of the camera-to-target vector: pitch -90° (nadir)
  // puts the full distance on the height axis, pitch 0° puts none of it
  const groundHeight = cameraPosition[2] - distance * Math.sin(-pitch * (Math.PI / 180));
  return Number.isFinite(groundHeight) ? groundHeight : null;
}

export async function getBaseParams(
  app: VcsUiApp,
): Promise<BaseParams | null> {
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
  return {
    LUREF_X: Math.round(luref[0]),
    LUREF_Y: Math.round(luref[1]),
    LON: lon,
    LAT: lat,
    ELEVATION: Math.round(elevation),
    LANG: app.locale,
  };
}
