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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Theme.define("demobrowser.demo.ui.Decoration_2_Theme2",
{
  title : "Test Decorations 2",

  decorations :
  {
    "black" :
    {
      style :
      {
        width: 3,
        color: "black"
      }
    },

    "special" :
    {
      style :
      {
        top : [3, "dashed", "blue"],
        left : [6, "double", "purple"],
        bottom : [1, "solid", "orange"],
        right : [5, "dotted", "green"]
      }
    },

    "round" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radiusTopLeft: 10,
        radiusTopRight: 10,
        backgroundColor: "gray",
        width: 2,
        style: "solid",
        color: "orange"
      }
    },

    "inset" :
    {
      clazz : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 2,
        innerWidth: 2,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
      }
    }
  }
});
