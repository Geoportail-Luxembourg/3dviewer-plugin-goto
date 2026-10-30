# @geoportallux/lux-3dviewer-plugin-goto

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

Adds a "Go to" list of export links to the 3dviewer navbar. Clicking a link
opens a new tab with a URL built from the current map state (camera position,
LUREF coordinates, elevation, view bbox, active layer ids, locale).

## Plugin configuration

The plugin is configured in the app's `app.config.json` under its plugin
entry. Both keys are optional; when omitted, the bundled defaults apply.

### `exportLinks`

Overrides or extends the bundled link list (`src/config-export-url.json`).
Entries are matched by `labelKey`:

- a configured entry with a bundled `labelKey` **replaces** the bundled entry
  entirely;
- a configured entry with an unknown `labelKey` is **appended**;
- an entry with `"visible": false` hides the matching bundled link.

```jsonc
{
  "name": "@geoportallux/lux-3dviewer-plugin-goto",
  "entry": "plugins/@geoportallux/lux-3dviewer-plugin-goto/index.js",
  "exportLinks": [
    {
      "labelKey": "Internal tool",
      "tooltipKey": "Internal tool",
      "icon": "mdi-tools",
      "useLocationInfoCoords": true,
      "url": "https://internal.example?x={LUREF_X}&y={LUREF_Y}",
    },
    { "labelKey": "Minecraft", "visible": false },
  ],
}
```

Supported URL tokens: `{LUREF_X}`, `{LUREF_Y}`, `{LON}`, `{LAT}`,
`{ELEVATION}`, `{LANG}`, `{BBOX}`, `{BBOX_GEOJSON}`, `{LAYER_IDS}`,
`{LAYER_IDS_SPACES}`, `{DYNAMIC_PARAMETER_DATA}`.

### `i18n`

Adds or overrides translations for link titles (`labelKey`) and tooltips
(`tooltipKey`). Keys are the raw label/tooltip strings; the plugin namespace
(`lux3dviewerPluginGoto`) is applied automatically. Locales not provided keep
the bundled translations.

```jsonc
{
  "i18n": {
    "fr": { "Lidar": "Lidar (fr)", "Internal tool": "Outil interne" },
    "en": { "Internal tool": "Internal tool" },
  },
}
```

## Notes

- Links restricted by `userType` / `userRoles` (e.g. Cyclomédia, Generic
  export) are only visible when the `@geoportallux/lux-3dviewer-plugin-auth`
  plugin reports a matching user.
- Coordinates come from the current camera view; the `useLocationInfoCoords`
  flag of the bundled config is not evaluated.
