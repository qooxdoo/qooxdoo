/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Alexander Back (aback)

************************************************************************ */

/**
 * Modern color theme
 */
qx.Theme.define("qx.theme.modern.Color",
{
  title : "Modern",

  colors :
  {
    "background" : "#dfdfdf",
    "background-light" : "#F2F2F2",

    "text" : "#1a1a1a",
    "text-disabled" : [ 107, 106, 110 ],
    "text-selected" : "#fffefe",
    "text-focused" : "#1a1a1a", // TODO: check this one

    "input-text" : "black",

    "border" : "#2D405A",

    // TODO: adjust border colors
    "border-light" : "white",
    "border-light-shadow" : "#DCDFE4",
    "border-dark-shadow" : "#4d4d4d",
    "border-dark" : "#85878C",


    "focus" : "#92B1DC",

    "pane" : "#ededed",

    "selected" : "#00439d",
    "selected-inactive" : "#7a9bc8",
    
    // TODO
    "button" : "#EBE9ED",
    "button-hovered" : "#F6F5F7",
    "button-abandoned" : "#F9F8E9",
    "button-checked" : "#F3F0F5",
    
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
    "table-row" : [ 0, 0, 0]

  }
});
