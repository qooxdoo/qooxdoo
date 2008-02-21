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

qx.Theme.define("demobrowser.demo.ui.Decoration_2_Theme1",
{
  title : "Test Decorations 1",

  decorations :
  {
    "black" :
    {
      clazz : qx.ui.decoration.Basic,

      style :
      {
        width: 1,
        color: "black"
      }
    },

    "special" :
    {
      clazz : qx.ui.decoration.Basic,

      style :
      {
        top : [1, "solid", "orange"],
        left : [5, "dotted", "green"],
        bottom : [3, "dashed", "blue"],
        right : [6, "double", "purple"]
      }
    },

    "round" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: [50, 30, 20, 20],
        backgroundColor: "red",
        width: [10, 30, 20, 15],
        style: "solid",
        color: ["purple", "blue", "yellow", "green"]
      }
    },

    "inset" :
    {
      clazz : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
      }
    }
  }
});