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

qx.Theme.define("demobrowser.demo.ui.Decoration_3_Theme",
{
  title : "Test Decorations",

  decorations :
  {
    "round1" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 5,
        backgroundColor: "gray",
        width: 2,
        color: "blue",
        antiAlias: true
      }
    },

    "round2" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 10,
        backgroundColor: "gray",
        width: [2, 4, 8, 16],
        color: ["purple", "blue", "yellow", "green"],
        antiAlias: true
      }
    },

    "round3" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: [4, 8, 16, 32],
        backgroundColor: "gray",
        width: 3,
        color: ["purple", "blue", "yellow", "green"],
        antiAlias: true
      }
    },

    "round4" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: [4, 8, 16, 32],
        backgroundColor: "gray",
        width: [2, 4, 8, 16],
        color: ["purple", "blue", "yellow", "green"],
        antiAlias: true
      }
    },

    "round5" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 10,
        backgroundColor: "gray",
        width: [0, 0, 5, 5],
        color: ["purple", "blue", "yellow", "green"],
        antiAlias: true
      }
    },

    "round6" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 10,
        backgroundColor: "gray",
        width: [5, 5, 0, 5],
        color: ["purple", "blue", "yellow", "green"],
        antiAlias: true
      }
    },

    "round7" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 10,
        backgroundColor: "gray",
        width: 0,
        color: "gray",
        antiAlias: true
      }
    },

    "round8" :
    {
      clazz : qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 0,
        backgroundColor: "gray",
        width: 0,
        color: "gray",
        antiAlias: true
      }
    }

  }
});