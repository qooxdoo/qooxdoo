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

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);
      qx.Theme.patch(qx.theme.classic.Appearance, demobrowser.demo.ui.Appearance);

      doc = new qx.ui.root.Application(document);

      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(layout);

      doc.add(container, 0, 0);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-button"
      }));
    }
  }
});

qx.Theme.define("demobrowser.demo.ui.Appearance",
{
  title: "Classic mixin for HtmlArea",

  appearances :
  {
    "shaded-button" :
    {
      style : function(states)
      {
        var root = qx.core.Setting.get("demobrowser.resourceUri") + "/demo/";
        return {
          padding: 10,
          backgroundColor: states.over && !states.pressed ? "#6A93DA" : "#4A7FDA",
          backgroundImage: states.pressed ? root + "background/gradient-pressed.png" : root + "background/gradient.png",
          font: "large",
          decorator: new qx.ui.decoration.RoundedBorder().set({
            radius: 4,
            width: 1,
            color: "#334563",
            style: "solid"
          })
        }
      }
    }
  }
});