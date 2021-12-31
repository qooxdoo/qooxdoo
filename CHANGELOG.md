# v6.0.2
Bug fixed version with this fixes:
- https://github.com/qooxdoo/qooxdoo/pull/10211
- https://github.com/qooxdoo/qooxdoo/pull/10206
- https://github.com/qooxdoo/qooxdoo/pull/10205
- https://github.com/qooxdoo/qooxdoo/pull/10203

# v6.0.0

## New Compiler

- New Javascript-based compiler: Previous versions of Qooxdoo used
a Python v2 based tool called the Generator (./generate.py); the
generator is still supported in Qooxdoo v6 but is deprecated and
will be removed completely for Qooxdoo v7. Legacy documentation can
be found here: https://archive.qooxdoo.org/5.0.2/ . To migrate, see
https://qooxdoo.org/documentation/#/development/compiler/migration .

## Breaking changes

- `qx.ui.core.scroll.AbstractScrollArea`: The width and height are now fix. 
    To reenable dynamic growing, the width or height can be set to null. |

- `qx.bom.Cookie`: Previous versions of qooxoo use `escape()` and `unescape()`
functions. Since those functions are deprecated, then now qooxdoo use
`encodeURIComponent()` and `decodeURIComponent()` functions. This may
break some cookies. There are no issues with special characters like
`~!@#$%^&*(){}[]=:/,;?+\'"\\` but some unicode characters like `äëíöü`
(etc) are encoded different by `escape()` and `encodeURIComponent()`,
so you must take care of this change if you use unicode characters.
Also, by default cookies are created with `SameSite=Strict`, whereas
previously they were created without `SameSite` unless you specified
it explicitly; recent browsers block cookies without `SameSite`, so
in most cases this will save you from having to make changes to your
code.

- `qx.bom.client.Css`: Removed obsolete IE-Feature check
methods `getFilterGradient` and `getFilterTextShadow`. If used
in production code, consider them as being a `false` value.

- `qx.core.Environment`: Removed obsolete IE-Feature keys
`"css.gradient.filter"` and `"css.textShadow.filter"`. If used
in production code, consider them as being a `false` value.

- `qx.ui.splitpane.Splitter`: New Property `knobVisible` toggles

visibility of the splitter's button. Property `visible` toggles
visibility of the whole splitte widget (no change from v5.0.x).

- `qx.ui.table.cellrenderer.AbstractImage`: change vertical alignment from top to middle.

- `qx.ui.basic.Image` adds a new scaling feature to preserve the size ratio of the image (ie scaling without stretching); if you enable scaling, the ratio is now preserved by default - if you actually want to stretch an image, you will have to set the image's `forceRatio` setting to `disabled`

