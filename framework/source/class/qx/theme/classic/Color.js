/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Windows classic color theme
 */
qx.Theme.define("qx.theme.classic.Color",
{
  colors :
  {
    "background" : "#EBE9ED",
    "background-light" : "#F3F0F5",
    "light-background" : "#EBE9ED", // compatibility
    "background-focused" : "#F3F8FD",
    "background-focused-inner" : "#DBEAF9",
    "background-disabled" : "#F4F4F4",
    "background-selected" : "#3E6CA8",
    "background-field" : "white",
    "background-pane" : "#FAFBFE",
    "background-invalid" : "#FFE0E0",

    "border-lead" : "#888888",

    "border-light" : "white",
    "border-light-shadow" : "#DCDFE4",
    "border-dark-shadow" : "#A7A6AA",
    "border-dark" : "#85878C",

    // alias for compatibility reasons
    "border-main" : "#85878C",

    "border-focused-light" : "#BCCEE5",
    "border-focused-light-shadow" : "#A5BDDE",
    "border-focused-dark-shadow" : "#7CA0CF",
    "border-focused-dark" : "#3E6CA8",

    "border-separator" : "#808080",

    // shadows
    "shadow" : qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#666666",

    "invalid" : "#990000",
    "border-focused-invalid" : "#FF9999",

    "text" : "black",
    "text-disabled" : "#A7A6AA",
    "text-selected" : "white",
    "text-focused" : "#3E5B97",
    "text-placeholder" : "#CBC8CD",

    "tooltip" : "#FFFFE1",
    "tooltip-text" : "black",
    "tooltip-invalid" : "#C82C2C",

    "button" : "#EBE9ED",
    "button-hovered" : "#F6F5F7",
    "button-abandoned" : "#F9F8E9",
    "button-checked" : "#F3F0F5",

    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption-text" : [ 255, 255, 255 ],
    "window-active-caption" : [ 51, 94, 168 ],
    "window-inactive-caption" : [ 111, 161, 217 ],

    "date-chooser" : "white",
    "date-chooser-title" : [ 116, 116, 116 ],
    "date-chooser-selected" : [ 52, 52, 52 ],

    "effect" : [ 254, 200, 60 ],
    "table-pane" : "white",
    "table-header" : [ 242, 242, 242 ],
    "table-header-border" : [ 214, 213, 217 ],
    "table-header-cell" : [ 235, 234, 219 ],
    "table-header-cell-hover" : [ 255, 255, 255 ],
    "table-focus-indicator" : [ 179, 217, 255 ],
    "table-row-background-focused-selected" : [ 90, 138, 211 ],
    "table-row-background-focused" : [ 221, 238, 255 ],
    "table-row-background-selected" : [ 51, 94, 168 ],
    "table-row-background-even" : [ 250, 248, 243 ],
    "table-row-background-odd" : [ 255, 255, 255 ],
    "table-row-selected" : [ 255, 255, 255 ],
    "table-row" : [ 0, 0, 0],
    "table-row-line" : "#EEE",
    "table-column-line" : "#EEE",

    "progressive-table-header" : "#AAAAAA",

    "progressive-table-row-background-even" : [ 250, 248, 243 ],
    "progressive-table-row-background-odd"  : [ 255, 255, 255 ],

    "progressive-progressbar-background"         : "gray",
    "progressive-progressbar-indicator-done"     : "#CCCCCC",
    "progressive-progressbar-indicator-undone"   : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text"       : "white"
  }
});
