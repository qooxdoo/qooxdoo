/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Theme.define("showcase.page.theme.calc.theme.Decoration",
{
  decorations :
  {
    "calc-button" :
    {
      style :
      {
        borderImage : "showcase/theme/button.png",
        slice : [3, 3, 5, 3]
      }
    },

    "calc-button-pressed" :
    {
      style :
      {
        borderImage : "showcase/theme/button-pressed.png",
        slice : [3, 3, 5, 3]
      }
    },

    "calc-display" :
    {
      style :
      {
        borderImage : "showcase/theme/display.png",
        slice : [5, 5, 5, 4]
      }
    },

    "calc-window" :
    {
      style :
      {
        borderImage : "showcase/theme/window.png",
        slice : [6, 6]
      }
    }
  }
});