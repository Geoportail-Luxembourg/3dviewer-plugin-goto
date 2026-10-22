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
  BBOX: string;
  BBOX_GEOJSON: string;
  LAYER_IDS: string;
  LAYER_IDS_SPACES: string;
  DYNAMIC_PARAMETER_DATA: string;
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
  const groundHeight =
    cameraPosition[2] - distance * Math.sin(-pitch * (Math.PI / 180));
  return Number.isFinite(groundHeight) ? groundHeight : null;
}

type SceneCapableMap = VcsMap & {
  getScene(): { camera: { computeViewRectangle(): unknown } } | undefined;
};

type GeoRectangle = {
  west: number;
  south: number;
  east: number;
  north: number;
};

const RADIANS_TO_DEGREES = 180 / Math.PI;
const METERS_PER_DEGREE_LAT = 111320;

function getBboxFromScene(map: VcsMap): number[] | null {
  if (!('getScene' in map)) {
    return null;
  }
  const rectangle = (map as SceneCapableMap)
    .getScene()
    ?.camera.computeViewRectangle() as GeoRectangle | undefined;
  if (!rectangle) {
    return null;
  }
  return [
    rectangle.west * RADIANS_TO_DEGREES,
    rectangle.south * RADIANS_TO_DEGREES,
    rectangle.east * RADIANS_TO_DEGREES,
    rectangle.north * RADIANS_TO_DEGREES,
  ];
}

function getBboxFromViewpoint(
  viewpoint: Viewpoint,
  lon: number,
  lat: number,
): number[] {
  const halfSizeMeters =
    typeof viewpoint.distance === 'number' &&
    Number.isFinite(viewpoint.distance)
      ? viewpoint.distance
      : 1000;
  const dLat = halfSizeMeters / METERS_PER_DEGREE_LAT;
  const dLon = dLat / Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat];
}

function buildBboxGeoJson(bbox: number[]): string {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [minLon, minLat],
              [maxLon, minLat],
              [maxLon, maxLat],
              [minLon, maxLat],
              [minLon, minLat],
            ],
          ],
        },
      },
    ],
  });
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
    .map((layer) => layer.name);
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
