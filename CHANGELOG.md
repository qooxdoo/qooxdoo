# HEAD

## Breaking changes

* [qx.bom.Cookie] Previous versions of qooxoo use `escape()` and `unescape()` functions. Since those functions are deprecated, then now qooxdoo use `encodeURIComponent()` and `decodeURIComponent()` functions. This may break some cookies. There are no issues with special characters like `~!@#$%^&*(){}[]=:/,;?+\'"\\` but some unicode characters like `äëíöü` (etc) are encoded different by `escape()` and `encodeURIComponent()`, so you must take care of this change if you use unicode characters.

* [qx.bom.client.Css] Removed obsolete IE-Feature check methods `getFilterGradient` and `getFilterTextShadow`. If used in production code, consider them as being a `false` value.

* [qx.core.Environment] Removed obsolete IE-Feature keys `"css.gradient.filter"` and `"css.textShadow.filter"`. If used in production code, consider them as being a `false` value.

* [qx.ui.splitpane.Splitter] New Property `knobVisible` toggles visibility of the splitter's button. Property `visible` toggles visibility of the whole splitte widget (no change from v5.0.x).
