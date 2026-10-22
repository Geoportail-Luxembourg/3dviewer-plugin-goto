import type { VcsMap, Viewpoint } from '@vcmap/core';

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

export function getBboxFromScene(map: VcsMap): number[] | null {
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

export function getBboxFromViewpoint(
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

export function buildBboxGeoJson(bbox: number[]): string {
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
