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

/**
 * The classic qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.contemporary.Appearance",
{
  title : "Contemporary Appearance",

  appearances :
  {
    "button" :
    {
      style : function(states)
      {
        var base = qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/";

        var decorator;

        if (states.checked && states.focus) {
          decorator = "button-checked-focus";
        } else if (states.checked) {
          decorator = "button-checked";
        } else if (states.pressed) {
          decorator = "button-pressed";
        }else if (states.over) {
          decorator = "button-over";
        } else if (states["default"] && states.focus) {
          decorator = "button-default-focus";
        } else if (states["default"]) {
          decorator = "buton-default";
        } else if (states.focus) {
          decorator = "button-normal-focus";
        } else {
          decorator = "button-normal";
        }

        return {
          align: "top",
          textColor: "black",
          font: "default",
          decorator: decorator
        }
      }
    }
  }
});
