/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tristan Koch (trkoch)

************************************************************************ */

/**
 * Indigo color theme
 */
qx.Theme.define("qx.theme.indigo.Color",
{
  colors :
  {
    // main
    "background" : "white",
    "dark-blue" : "#323335",
    "light-background" : "#F4F4F4",
    "font" : "#262626",


    "highlight" : "#3D72C9", // bright blue
    "highlight-shade" : "#5583D0", // bright blue

    // backgrounds
    "background-selected" : "#3D72C9",
    "background-selected-disabled" : "#CDCDCD",
    "background-selected-dark" : "#323335",
    "background-disabled" : "#F7F7F7",
    "background-disabled-checked" : "#BBBBBB",
    "background-pane" : "white",

    // tabview
    "tabview-unselected" : "#1866B5",
    "tabview-button-border" : "#134983",
    "tabview-label-active-disabled" : "#D9D9D9",

    // text colors
    "link" : "#24B",

    // scrollbar
    "scrollbar-bright" : "#F1F1F1",
    "scrollbar-dark" : "#EBEBEB",

    // form
    "button" : "#E8F0E3",
    "button-border" : "#BBB",
    "button-border-hovered" : "#939393",
    "invalid" : "#C00F00",
    "button-box-bright" : "#F9F9F9",
    "button-box-dark" : "#E3E3E3",
    "button-box-bright-pressed" : "#BABABA",
    "button-box-dark-pressed" : "#EBEBEB",
    "border-lead" : "#888888",

    // window
    "window-border" : "#dddddd",
    "window-border-inner" : "#F4F4F4",

    // group box
    "white-box-border" : "#dddddd",

    // shaddows
    "shadow" : qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#666666",

    // borders
    "border-main" : "#dddddd",
    "border-light" : "#B7B7B7",
    "border-light-shadow" : "#686868",

    // separator
    "border-separator" : "#808080",

    // text
    "text" : "#262626",
    "text-disabled" : "#A7A6AA",
    "text-selected" : "white",
    "text-placeholder" : "#CBC8CD",

    // tooltip
    "tooltip" : "#FE0",
    "tooltip-text" : "black",

    // table
    "table-header" : [ 242, 242, 242 ],
    "table-focus-indicator" : "#3D72C9",

    // used in table code
    "table-header-cell" : [ 235, 234, 219 ],
    "table-row-background-focused-selected" : "#3D72C9",
    "table-row-background-focused" : "#F4F4F4",
    "table-row-background-selected" : [ 51, 94, 168 ],
    "table-row-background-even" : "white",
    "table-row-background-odd" : "white",
    "table-row-selected" : [ 255, 255, 255 ],
    "table-row" : [ 0, 0, 0],
    "table-row-line" : "#EEE",
    "table-column-line" : "#EEE",

    // used in progressive code
    "progressive-table-header" : "#AAAAAA",
    "progressive-table-row-background-even" : [ 250, 248, 243 ],
    "progressive-table-row-background-odd" : [ 255, 255, 255 ],
    "progressive-progressbar-background" : "gray",
    "progressive-progressbar-indicator-done" : "#CCCCCC",
    "progressive-progressbar-indicator-undone" : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text" : "white"
  }
});