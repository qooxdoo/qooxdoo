/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Theme.define("showcase.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  include : [
    showcase.page.theme.calc.theme.appearance.Black,
    showcase.page.theme.calc.theme.appearance.Modern
  ],

  appearances :
  {
    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "white",
          font            : "default"
        };
      }
    },


    "page-preview" :
    {
      alias: "listitem",
      include: "listitem",

      style : function(states)
      {
        return {
          iconPosition: "top",
          padding: 6,
          backgroundColor : states.selected ? "#dddddd" : undefined,
          decorator: null,
          cursor: "pointer"
        };
      }
    },


    "page-preview/label" :
    {
      include: "label",

      style : function(states)
      {
        return {
          textColor: "#333333",
          padding: 0,
          height: 35,
          // decorator: states.selected ? "group" : null,
          font: qx.bom.Font.fromConfig({
            size: 16,
            family: ["Lucida Grande", "Verdana", "sans-serif"]
          }),
          zIndex: 50
        };
      }
    },


    "preview-list":
    {
      alias : "list",

      style : function(states)
      {
        return {
          backgroundColor: "#f0f0f0",
          zIndex : 111,
          padding: 0
        };
      }
    },


    "separator":
    {
      style : function(states)
      {
        return {
          backgroundColor: "black",
          decorator: (new qx.ui.decoration.Decorator()).set({
            top: [1, "solid", "white"],
            bottom: [1, "solid", "white"]
          }),
          height: 7
        };
      }
    },


    "content-container" :
    {
      style : function(states)
      {
        return {
          padding: 0
        };
      }
    },

    "description" :
    {
      style : function(states)
      {
        return {
          width: 300,
          zIndex: 122,
          padding: 7
        };
      }
    },


    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          font      : "legend"
        };
      }
    }
  }
});
