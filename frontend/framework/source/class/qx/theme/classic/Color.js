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
    "background" : "#EBE9ED",
    "background-light" : "#F3F0F5",
    "background-focused" : "#F3F8FD",
    "background-focused-inner" : "#DBEAF9",
    "background-disabled" : "#F4F4F4",
    "background-selected" : "#3E6CA8",
    "background-field" : "white",

    "border-lead" : "#888888",

    "border-light" : "white",
    "border-light-shadow" : "#DCDFE4",
    "border-dark-shadow" : "#A7A6AA",
    "border-dark" : "#85878C",

    "border-focused-light" : "#BCCEE5",
    "border-focused-light-shadow" : "#A5BDDE",
    "border-focused-dark-shadow" : "#7CA0CF",
    "border-focused-dark" : "#3E6CA8",

    "text" : "black",
    "text-disabled" : "#A7A6AA",
    "text-selected" : "white",
    "text-focused" : "#3E5B97",

    "tooltip" : "#FFFFE1",
    "tooltip-text" : "black",

    "button" : "#EBE9ED",
    "button-hovered" : "#F6F5F7",
    "button-abandoned" : "#F9F8E9",
    "button-checked" : "#F3F0F5",

    "effect" : "orange",

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
