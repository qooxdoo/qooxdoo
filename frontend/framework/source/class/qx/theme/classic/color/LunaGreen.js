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
 * Windows Luna Green color theme
 */
qx.Theme.define("qx.theme.classic.color.LunaGreen",
{
  title : "Windows Luna Green",
  extend : qx.theme.classic.color.Royale,

  colors :
  {
    "background" : [ 236, 233, 216 ],

    "effect" : [ 139, 161, 105 ],
    "selected" : [ 147, 160, 112 ],

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

    "window-active-caption" : [ 139, 161, 105 ],
    "window-active-caption-text" : [ 255, 255, 255 ],
    "window-inactive-caption" : [ 212, 214, 186 ],
    "window-inactive-caption-text" : [ 255, 255, 255 ],

    "tab-view-border" : [ 70, 65, 34 ],
    "tab-view-button" : [ 211, 220, 198 ]
  }
});
