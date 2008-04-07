/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/* ************************************************************************

#resource(qx.icontheme:qx/decoration/Modern)
#asset(qx/decoration/Modern/*)

************************************************************************ */

/**
 * The modern decoration theme.
 */
qx.Theme.define("qx.theme.modern.Decoration",
{
  title : "Modern",
  resource : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Modern",

  decorations :
  {
    "pane" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/pane/pane.png"
      }
    },

    "button" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button.png"
      }
    },

    "button-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-focused.png"
      }
    },

    "button-hovered" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-hovered.png"
      }
    },

    "button-pressed" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-pressed.png"
      }
    },

    "button-ckecked" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-checked.png"
      }
    },

    "button-ckecked-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-checked-focused.png"
      }
    },

    "button-default" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-default.png"
      }
    },

    "button-default-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-default-focused.png"
      }
    },

    "textfield" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor: "border",
        innerColor: "white",
        backgroundImage : "decoration/form/input.png"
      }
    },

    "textfield-focused" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor: "border",
        innerColor: "focus"
      }
    }
  }
});
