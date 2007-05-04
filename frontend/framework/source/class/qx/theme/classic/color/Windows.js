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
 * Windows classic color theme
 */
qx.Theme.define("qx.theme.classic.color.Windows",
{
  title : "Windows Classic",
  extend : qx.theme.classic.color.Royale,

  colors :
  {
    "background" : [ 212, 208, 200 ],
    "selected" : [ 10, 36, 106 ],

    "border-light" : [ 255, 255, 255 ],
    "border-light-shadow" : [ 212, 208, 200 ],
    "border-dark" : [ 64, 64, 64 ],
    "border-dark-shadow" : [ 128, 128, 128 ],

    "text-selected" : [ 255, 255, 255 ],
    "text-disabled" : [ 128, 128, 128 ],

    "tooltip" : [ 255, 255, 225 ],
    "tooltip-text" : [ 0, 0, 0 ],

    "menu" : [ 212, 208, 200 ],
    "button" : [ 212, 208, 200 ],

    "window-active-caption" : [ 10, 36, 106 ],
    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption" : [ 128, 128, 128 ],
    "window-inactive-caption-text" : [ 212, 208, 200 ]
  }
});
