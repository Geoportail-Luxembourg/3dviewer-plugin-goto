import proj4 from 'proj4';

export const PROJECTION_WGS84 = 'EPSG:4326';
export const PROJECTION_LUX = 'EPSG:2169';
export const PROJECTION_MERCATOR = 'EPSG:3857';

let projectionInitialized = false;

export function initProjection(): void {
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
