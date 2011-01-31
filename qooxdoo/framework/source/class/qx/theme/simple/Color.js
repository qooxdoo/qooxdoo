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

************************************************************************ */

/**
 * Simple color theme
 */
qx.Theme.define("qx.theme.simple.Color",
{
  colors :
  {
    "background" : "white",
    "blue" : "#6694E3",
    "dark-blue" : "#5685D6",
    "light-blue" : "#E0ECFF",
    "middle-blue" : "#AEC3DA",
    "background-selected" : "#6694E3",    
    "background-disabled" : "#F7F7F7",
    "background-disabled-checked" : "#BBBBBB",

    
    "scrollbar-bright" : "#F1F1F1",
    "scrollbar-dark" : "#EBEBEB",
    
    "button" : "#E8F0E3",

    "invalid" : "#FF0000",
    
    "window-border" : "#2E3A46",
    "window-border-inner" : "#9DCBFE",
    
    "button-box-bright" : "#F9F9F9",
    "button-box-dark" : "#E3E3E3",
    
    "white-box-border" : "#BCBCBC",
    
    "shadow" : "#666666",
    
    "background-light" : "#F3F0F5",
    "background-focused" : "#F3F8FD",
    "background-focused-inner" : "#DBEAF9",

    "background-field" : "white",
    "background-pane" : "#FAFBFE",
    "background-invalid" : "#FFE0E0",

    "border-lead" : "#888888",

    "border-light" : "#B7B7B7",
    "border-light-shadow" : "#464646",
    "border-dark-shadow" : "#B7B7B7",
    "border-dark" : "#464646",

    // alias for compatibility reasons
    "border-main" : "#85878C",

    "border-focused-light" : "#BCCEE5",
    "border-focused-light-shadow" : "#A5BDDE",
    "border-focused-dark-shadow" : "#7CA0CF",
    "border-focused-dark" : "#3E6CA8",

    "border-separator" : "#808080",

    
    "border-focused-invalid" : "#FF9999",

    "text" : "black",
    "text-disabled" : "#A7A6AA",
    "text-selected" : "white",
    "text-focused" : "#3E5B97",
    "text-placeholder" : "#CBC8CD",

    "tooltip" : "#FFFFE1",
    "tooltip-text" : "black",


    "button-hovered" : "#F6F5F7",
    "button-abandoned" : "#F9F8E9",
    "button-checked" : "#F3F0F5",

    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption-text" : [ 255, 255, 255 ],
    "window-active-caption" : [ 51, 94, 168 ],
    "window-inactive-caption" : [ 111, 161, 217 ],

    "effect" : [ 254, 200, 60 ],
    "table-header" : [ 242, 242, 242 ],
    "table-header-border" : [ 214, 213, 217 ],
    "table-header-cell" : [ 235, 234, 219 ],
    "table-header-cell-hover" : [ 255, 255, 255 ],
    "table-focus-indicator" : [ 179, 217, 255 ],
    "table-row-background-focused-selected" : [ 90, 138, 211 ],
    "table-row-background-focused" : [ 221, 238, 255 ],
    "table-row-background-selected" : [ 51, 94, 168 ],
    "table-row-background-even" : "white",
    "table-row-background-odd" : "white",
    "table-row-selected" : [ 255, 255, 255 ],
    "table-row" : [ 0, 0, 0],
    "table-row-line" : "#EEE",
    "table-column-line" : "white",

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
