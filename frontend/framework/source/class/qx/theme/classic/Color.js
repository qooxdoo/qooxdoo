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

************************************************************************ */

/**
 * Windows classic color theme
 */
qx.Theme.define("qx.theme.classic.Color",
{
  title : "Windows Classic",

  colors :
  {
    "background" : [ 235, 233, 237 ],
    "background-light" : "#F3F0F5",

    "border-light" : "white",
    "border-light-shadow" : [ 220, 223, 228 ],
    "border-dark" : [ 133, 135, 140 ],
    "border-dark-shadow" : [ 167, 166, 170 ],

    "selected" : "#3E6CA8",
    "field" : "white",

    "text" : "black",
    "text-disabled" : [ 167, 166, 170 ],
    "text-selected" : "white",

    "tooltip" : [ 255, 255, 225 ],
    "tooltip-text" : "black",

    "button" : [ 235, 233, 237 ],
    "button-hovered" : [ 246, 245, 247 ],
    "button-abandoned" : [ 249, 248, 233 ],

    "effect" : [ 128, 128, 128 ],

    "tabview-pane" : [ 250, 249, 248 ],
    "tabview-border" : [ 128, 128, 128 ],
    "tabview-button" : [ 224, 221, 216 ],
    "tabview-button-hover" : [ 250, 249, 248 ],
    "tabview-button-checked" : [ 250, 249, 248 ],

    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption-text" : [ 255, 255, 255 ],
    "window-active-caption" : [ 51, 94, 168 ],
    "window-inactive-caption" : [ 111, 161, 217 ]
  }
});
