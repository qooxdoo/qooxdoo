/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * A custom apperance theme for the playground.
 */
qx.Theme.define("playground.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "header",
          textColor : "text-selected",
          padding : [6, 12, 0, 12],
          decorator : "app-header"
        };
      }
    },

    "modeButton" :
    {
      include : "button",
      alias : "button",

      style : function(states, superStyles)
      {
        var decorator;
        if (states.checked) {
          decorator = "button";
        }  else {
          decorator = "button-checked";
        }

        // feature detect if we should use the CSS decorators
        if (qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear")) {
            decorator += "-css";
        }
        return {
          font: states.checked ? "bold" : "default",
          textColor: "black",
          decorator : decorator,
          padding: [3, 35, 22, 35],
          marginBottom: -20
        };
      }
    }
  }
});