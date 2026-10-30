import { describe, it, expect } from 'vitest';
import bundledExportLinks from '../src/config-export-url.json';
import { resolveExportLinks } from '../src/config.js';
import type { ExportLink } from '../src/export-url.model.js';

const bundled = bundledExportLinks.exportLinks as ExportLink[];
const bundledLidar = bundled.find((link) => link.labelKey === 'Lidar');

describe('resolveExportLinks', () => {
  it('returns the bundled links when no exportLinks are configured', () => {
    expect(resolveExportLinks()).toEqual(bundled);
  });

  it('returns the bundled links when exportLinks is undefined', () => {
    expect(resolveExportLinks({})).toEqual(resolveExportLinks());
  });

  it('overrides a single bundled link and keeps the rest', () => {
    const links = resolveExportLinks({
      exportLinks: [
        {
          labelKey: 'Lidar',
          tooltipKey: 'Custom lidar tooltip',
          useLocationInfoCoords: true,
          url: 'https://custom-lidar.example?x={LUREF_X}&y={LUREF_Y}',
        },
      ],
    });
    const lidar = links.find((link) => link.labelKey === 'Lidar');
    expect(lidar?.url).toBe(
      'https://custom-lidar.example?x={LUREF_X}&y={LUREF_Y}',
    );
    expect(lidar?.tooltipKey).toBe('Custom lidar tooltip');
    expect(lidar?.icon).toBeUndefined();
    expect(links.length).toBe(bundled.length);
    expect(links.some((link) => link.labelKey === 'ACT2BIM')).toBe(true);
  });

  it('appends links with an unknown labelKey after the bundled links', () => {
    const links = resolveExportLinks({
      exportLinks: [
        {
          labelKey: 'Internal tool',
          tooltipKey: 'Internal',
          useLocationInfoCoords: true,
          url: 'https://internal.example?x={LUREF_X}',
        },
      ],
    });
    expect(links.length).toBe(bundled.length + 1);
    expect(links[links.length - 1].labelKey).toBe('Internal tool');
    expect(links.slice(0, -1)).toEqual(bundled);
  });

  it('hides a bundled link when the override sets visible false', () => {
    const links = resolveExportLinks({
      exportLinks: [
        { labelKey: 'Lidar', tooltipKey: '', visible: false, url: '' },
      ],
    });
    expect(links.find((link) => link.labelKey === 'Lidar')?.visible).toBe(
      false,
    );
  });

  it('preserves the bundled order for overridden links', () => {
    const links = resolveExportLinks({
      exportLinks: [bundledLidar],
    });
    expect(links).toEqual(bundled);
  });

  it('replaces all fields of the matching bundled link', () => {
    const links = resolveExportLinks({
      exportLinks: [
        {
          labelKey: 'Lidar',
          tooltipKey: 'Only a url matters',
          useLocationInfoCoords: true,
          url: 'https://replaced.example',
        },
      ],
    });
    const lidar = links.find((link) => link.labelKey === 'Lidar');
    expect(lidar?.url).toBe('https://replaced.example');
    expect(lidar?.icon).toBeUndefined();
    expect(links).toContainEqual(bundled.find((l) => l.labelKey === 'ACT2BIM'));
  });
});
