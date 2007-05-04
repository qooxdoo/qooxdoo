/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Windows Luna Silver color theme
 */
qx.Theme.define("qx.theme.classic.color.LunaSilver",
{
  title : "Windows Luna Silver",
  extend : qx.theme.classic.color.Royale,

  colors :
  {
    "background" : [ 224, 223, 227 ],

    "effect" : [ 192, 192, 192 ],
    "selected" : [ 178, 180, 191 ],

    "border-light" : [ 255, 255, 255 ],
    "border-light-shadow" : [ 241, 239, 226 ],
    "border-dark" : [ 113, 111, 100 ],
    "border-dark-shadow" : [ 157, 157, 161 ],

    "text-selected" : [ 0, 0, 0 ],
    "text-disabled" : [ 172, 168, 153 ],

    "tooltip" : [ 255, 255, 225 ],
    "tooltip-text" : [ 0, 0, 0 ],

    "menu" : [ 255, 255, 255 ],
    "button" : [ 224, 223, 227 ],

    "window-active-caption" : [ 192, 192, 192 ],
    "window-active-caption-text" : [ 14, 16, 16 ],
    "window-inactive-caption" : [ 255, 255, 255 ],
    "window-inactive-caption-text" : [ 162, 161, 161 ]
  }
});
