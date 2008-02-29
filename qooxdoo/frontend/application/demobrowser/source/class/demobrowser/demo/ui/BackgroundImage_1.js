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

qx.Class.define("demobrowser.demo.ui.BackgroundImage_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.Theme.patch(qx.theme.classic.Color, demobrowser.demo.ui.Color);
      qx.Theme.patch(qx.theme.classic.Appearance, demobrowser.demo.ui.Appearance);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);


      doc = new qx.ui.root.Application(document);

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(layout);

      doc.add(container, 0, 0);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-button"
      }), 0, 0);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-round-button"
      }), 0, 1);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-outset-button"
      }), 0, 2);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "glossy"
      }), 1, 0);

    }
  }
});

qx.Theme.define("demobrowser.demo.ui.Color",
{
  title: "Shaded Buttons - Colors",

  colors :
  {
    "normal" : "#4A7FDA",
    "over" : "#6A93DA",
    "pressed" : "#6A93DA"
  }
});

qx.Theme.define("demobrowser.demo.ui.Appearance",
{
  title: "Shaded Buttons",

  appearances :
  {
    "shaded-button" :
    {
      style : function(states)
      {
        var root = qx.core.Setting.get("demobrowser.resourceUri") + "/demo/";
        return {
          padding: states.pressed ? [11, 10, 9, 10] : 10,
          backgroundColor: states.pressed ? "pressed" : states.over ? "over" : "normal",
          backgroundImage: states.pressed ? root + "background/gradient-pressed.png" : root + "background/gradient.png",
          font: "large",
          decorator: new qx.ui.decoration.Basic().set({
            width: 1,
            color: "#334563",
            style: "solid"
          })
        }
      }
    },

    "shaded-round-button" :
    {
      include : "shaded-button",

      style : function(states)
      {
        return {
          decorator: new qx.ui.decoration.RoundedBorder().set({
            radius: 4,
            width: 1,
            color: "#334563",
            style: "solid"
          })
        }
      }
    },


    "shaded-outset-button" :
    {
      include : "shaded-button",

      style : function(states)
      {
        return {
          padding: states.pressed ? [11, 9, 9, 11] : 10,
          decorator: states.pressed ? "inset" : "outset"
        }
      }
    },

    "glossy" :
    {
      style : function(states)
      {
        var root = qx.core.Setting.get("demobrowser.resourceUri") + "/demo/";
        return {
          width: 126,
          height: 35,
          backgroundImage: states.pressed ? root + "background/glossy-pressed.png" : states.over ? root + "background/glossy-over.png" : root + "background/glossy.png",
          textColor: "#cad1e2",
          padding: [0, 15, 0, 15],
          font: new qx.html.Font().set({
            size: 14,
            family : ["Verdana", "sans-serif"]
          })
        }
      }
    }
  }
});