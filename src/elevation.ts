import type { VcsMap, Viewpoint } from '@vcmap/core';
import type { Coordinate } from 'ol/coordinate.js';
import proj4 from 'proj4';
import { PROJECTION_MERCATOR, PROJECTION_WGS84 } from './projection';

export const DEFAULT_ELEVATION = 300;

type TerrainCapableMap = VcsMap & {
  getHeightFromTerrain(positions: Coordinate[]): Promise<Coordinate[]>;
};

export async function getElevationFromTerrain(
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
  try {
    await terrainMap.getHeightFromTerrain([position]);
    return position[2] > 0 ? position[2] : null;
  } catch {
    return null;
  }
}

export function getElevationFromCamera(viewpoint: Viewpoint): number | null {
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
