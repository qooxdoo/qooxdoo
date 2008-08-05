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
    
    // TODO: adjust these colors to Modern theme (used for datefield-button)
    "background-focused" : "#F3F8FD",
    "background-disabled" : "#F4F4F4",
    "background-selected" : "#3E6CA8",
    "background-field" : "white",

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
    
    // TODO: adjust these colors to the Modern theme!
    "border-focused-light" : "#BCCEE5",
    "border-focused-light-shadow" : "#A5BDDE",
    "border-focused-dark-shadow" : "#7CA0CF",
    "border-focused-dark" : "#3E6CA8",


    "focus" : "#92B1DC",

    "pane" : "#ededed",

    "selected" : "#00439d",
    "selected-inactive" : "#7a9bc8",
    
    // TODO
    "button" : "#EBE9ED",
    "button-hovered" : "#F6F5F7",
    "button-abandoned" : "#F9F8E9",
    "button-checked" : "#F3F0F5",
    
    "date-chooser" : "#F2F2F2",
    "date-chooser-title" : "#00439d",
    
    "table-pane" : "white",
    
    // TODO: check these four colors
    "table-focus-indicator" : "#0073FF",
    "table-row-background-focused-selected" : "#084CA6",
    "table-row-background-focused" : "#0053DD",
    "table-row-background-selected" : "#084CA6",

    "table-row-background-even" : "#F4F4F4",
    "table-row-background-odd" : "#E4E4E4",
    "table-row-selected" : "white",
    "table-row" : "#1a1a1a",

    // no impact (decorators with backgroundImages are used)
    "effect" : [ 254, 200, 60 ],
    "table-header" : [ 242, 242, 242 ],
    "table-header-border" : [ 214, 213, 217 ],
    "table-header-cell" : [ 235, 234, 219 ],
    "table-header-cell-hover" : [ 255, 255, 255 ]
  }
});
