# @geoportallux/lux-3dviewer-plugin-goto

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

Adds a "Go to" list of export links to the 3dviewer navbar. Clicking a link
opens a new tab with a URL built from the current map state (camera position,
LUREF coordinates, elevation, view bbox, active layer ids, locale).

## Plugin configuration

The export links are configured in the app's `app.config.json` (or module
config) under the plugin entry. The plugin registers nothing when `exportLinks`
is missing.

```jsonc
{
  "name": "@geoportallux/lux-3dviewer-plugin-goto",
  "entry": "plugins/@geoportallux/lux-3dviewer-plugin-goto/index.js",
  "exportLinks": [
    {
      "labelKey": "Lidar",
      "tooltipKey": "Explore point cloud data",
      "icon": "mdi-image-filter-hdr-outline",
      "url": "https://lidar.geoportail.lu?COORD_X={LUREF_X}&COORD_Y={LUREF_Y}&COORD_Z={ELEVATION}",
    },
    {
      "labelKey": "Generic export",
      "icon": "$vcsExport",
      "url": "https://fmeflow.geoportail.lu/fmeserver/apps/Geoportal-Exporter?dynamicParameterData={DYNAMIC_PARAMETER_DATA}",
      "userType": ["etat"],
    },
  ],
}
```

| Field                    | Description                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `labelKey`               | Item title. An i18n key if the app translates it, otherwise the displayed text.                         |
| `tooltipKey`             | Optional tooltip, same resolution as `labelKey`.                                                        |
| `icon`                   | Optional; `mdi-*` names or `$vcs*` aliases.                                                             |
| `url`                    | Target URL, may contain the tokens below.                                                               |
| `userType` / `userRoles` | Optional restriction; the link is only shown when the auth plugin reports a matching user type or role. |

Supported URL tokens: `{LUREF_X}`, `{LUREF_Y}`, `{LON}`, `{LAT}`,
`{ELEVATION}`, `{LANG}`, `{BBOX}`, `{BBOX_GEOJSON}`, `{LAYER_IDS}`,
`{LAYER_IDS_SPACES}`, `{DYNAMIC_PARAMETER_DATA}`.

## Translations

Link titles and tooltips are resolved through the app's i18n collection, so
their translations belong to the app configuration, alongside the links
themselves. The plugin only ships the "Go to" button title
(`lux3dviewerPluginGoto.goTo`).

## Notes

- Coordinates come from the current camera view.
- Restricted links (e.g. Cyclomédia, Generic export) require the
  `@geoportallux/lux-3dviewer-plugin-auth` plugin; without a matching user
  they stay hidden.
