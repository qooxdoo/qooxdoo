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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/* ************************************************************************

#resource(qx.icontheme:qx/decoration/Classic)

************************************************************************ */

/**
 * The Contemporary decoration theme.
 */
qx.Theme.define("qx.theme.contemporary.Decoration",
{
  title : "Contemporary",

  decorations :
  {
    "button-normal" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Normal.png"
      }
    },

    "button-normal-focus" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Normal-Fokus.png"
      }
    },

    "button-over" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Hover.png"
      }
    },

    "button-pressed" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Pressed.png"
      }
    },

    "button-ckecked" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Checked.png"
      }
    },

    "button-ckecked-focus" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Checked-Fokus.png"
      }
    },

    "button-default" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Default.png"
      }
    },

    "button-default-focus" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/button/Button-Default-Fokus.png"
      }
    }

  }
});
