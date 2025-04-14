/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Scott Knick (sknick)

************************************************************************ */

/**
 * Indigo dark color theme
 */
qx.Theme.define("qx.theme.indigo.ColorDark", {
  colors: {
    // main
    "background": "#333333",
    "dark-blue": "#323335",
    "light-background": "#444444",
    "font": "#dddddd",

    "highlight": "#eeeeee",
    "highlight-shade": "#dddddd",

    // backgrounds
    "background-selected": "#666666",
    "background-selected-disabled": "#777777",
    "background-selected-dark": "#333333",
    "background-disabled": "#444444",
    "background-disabled-checked": "#bbbbbb",
    "background-pane": "#333333",

    // tabview
    "tabview-unselected": "#aaaaaa",
    "tabview-button-border": "#444444",
    "tabview-label-active-disabled": "#d9d9d9",

    // text colors
    "link": "#ffffff",

    // scrollbar
    "scrollbar-bright": "#555555",
    "scrollbar-dark": "#333333",

    // form
    "button": "#444444",
    "button-border": "#666666",
    "button-border-hovered": "#939393",
    "invalid": "#d44a56",
    "button-box-bright": "#555555",
    "button-box-dark": "#444444",
    "button-box-bright-pressed": "#333333",
    "button-box-dark-pressed": "#222222",
    "border-lead": "#888888",

    // window
    "window-border": "#444444",
    "window-border-inner": "#666666",

    // group box
    "white-box-border": "#444444",

    // shadows
    "shadow": qx.core.Environment.get("css.rgba")
    ? "rgba(0, 0, 0, 0.4)"
    : "#666666",

    // borders
    "border-main": "#444444",
    "border-light": "#666666",
    "border-light-shadow": "#555555",

    // separator
    "border-separator": "#808080",

    // text
    "text": "#dddddd",
    "text-disabled": "#666666",
    "text-selected": "#ffffff",
    "text-placeholder": "#cbc8cd",

    // tooltip
    "tooltip": "#666666",
    "tooltip-text": "#dddddd",

    // table
    "table-header": "#f2f2f2",
    "table-focus-indicator": "#eeeeee",

    // used in table code
    "table-header-cell": "#ebeadb",
    "table-row-background-focused-selected": "#666666",
    "table-row-background-focused": "#444444",
    "table-row-background-selected": "#666666",
    "table-row-background-even": "#333333",
    "table-row-background-odd": "#333333",
    "table-row-selected": "#eeeeee",
    "table-row": "#eeeeee",
    "table-row-line": "#555555",
    "table-column-line": "#555555",

    // used in progressive code
    "progressive-table-header": "#ebeadb",
    "progressive-table-row-background-even": "#333333",
    "progressive-table-row-background-odd": "#333333",
    "progressive-progressbar-background": "gray",
    "progressive-progressbar-indicator-done": "#cccccc",
    "progressive-progressbar-indicator-undone": "#ffffff",
    "progressive-progressbar-percent-background": "gray",
    "progressive-progressbar-percent-text": "#ffffff"
  }
});
