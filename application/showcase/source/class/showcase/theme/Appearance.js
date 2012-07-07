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
      style : function(states)
      {
        return {
          backgroundColor: "#f0f0f0",
          zIndex : 111,
          padding: 0
        };
      }
    },

    "preview-list/scrollbar-x/slider" : "widget",
    "preview-list/scrollbar-x" : "widget",

    "preview-list/scrollbar-x/button" :
    {
      style : function(states)
      {
        return {
          width: 0,
          height: 0
        };
      }
    },

    "preview-list/scrollbar-x/button-begin" : "preview-list/scrollbar-x/button",
    "preview-list/scrollbar-x/button-end" : "preview-list/scrollbar-x/button",

    "preview-list/scrollbar-x/slider/knob" :
    {
      style : function(states)
      {
        return {
          decorator: new qx.ui.decoration.HBox("showcase/images/tag-hor.png"),
          opacity: qx.core.Environment.get("engine.name") == "mshtml" ? 1 : (states.hovered ? 0.2 : 0.1),
          height: 12
        };
      }
    },


    "separator":
    {
      style : function(states)
      {
        return {
          backgroundColor: "black",
          decorator: new qx.ui.decoration.Single().set({
            top: [1, "solid", "white"],
            bottom: [1, "solid", "white"]
          }),
          height: 7
        };
      }
    },


    "stack":
    {
      style : function(states)
      {
        return {
          // the header's shadow may block mouse events in the stack
          marginTop: qx.core.Environment.get("event.pointer") ? 0 : 8
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