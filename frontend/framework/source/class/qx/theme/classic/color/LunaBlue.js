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
 * Windows Luna Blue color theme
 */
qx.Theme.define("qx.theme.classic.color.LunaBlue",
{
  title : "Windows Luna Blue",
  extend : qx.theme.classic.color.Royale,

  colors :
  {
    "background" : [ 236, 233, 216 ],
    "selected" : [ 49, 106, 197 ],

    "border-light" : [ 255, 255, 255 ],
    "border-light-shadow" : [ 241, 239, 226 ],
    "border-dark" : [ 113, 111, 100 ],
    "border-dark-shadow" : [ 172, 168, 153 ],

    "text-selected" : [ 255, 255, 255 ],
    "text-disabled" : [ 172, 168, 153 ],

    "tooltip" : [ 255, 255, 225 ],
    "tooltip-text" : [ 0, 0, 0 ],

    "menu" : [ 255, 255, 255 ],
    "button" : [ 236, 233, 216 ],

    "window-active-caption" : [ 0, 84, 227 ],
    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption" : [ 122, 150, 223 ],
    "window-inactive-caption-text" : [ 216, 228, 248 ]
  }
});
