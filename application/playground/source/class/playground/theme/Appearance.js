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
  extend : qx.theme.indigo.Appearance,

  appearances :
  {
    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "text-selected",
          backgroundColor: "background-selected-dark",
          decorator: "app-header",
          padding : [10, 10, 0, 10]
        };
      }
    },

    "modeButton" :
    {
      include : "tabview-page/button",
      alias : "tabview-page/button",

      style : function(states, superStyles)
      {
        return {
          font: states.checked ? "bold" : "default",
          textColor: "white",
          decorator : states.checked ? "mode-select-tab" : null,
          padding: [2, 15, 6, 15],
          marginBottom: -5,
          marginTop: 8
        };
      }
    },


    "sample-list" :
    {
      include : "list",
      alias : "list",

      style : function(states) {
        return {
          decorator: "separator-vertical",
          padding : 0
        };
      }
    }
  }
});