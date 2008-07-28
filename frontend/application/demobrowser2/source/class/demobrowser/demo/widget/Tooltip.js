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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/help-about.png)
#asset(qx/icon/${qx.icontheme}/32/actions/help-about.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Tooltip",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(20);

      var container = new qx.ui.container.Composite(box).set({
        padding: [48, 20]
      })

      this.getRoot().add(container);

      var c1 = new qx.ui.basic.Atom("Shared ToolTip").set({
        backgroundColor: "#BDD2EF",
        height: 100,
        padding: 20,
        decorator: "outset",
        focusable: true
      });
      container.add(c1);

      var c2 = new qx.ui.basic.Atom("Shared ToolTip").set({
        backgroundColor: "#D1DFAD",
        height: 100,
        padding: 20,
        paddingLeft: 20,
        decorator: "outset",
        focusable: true
      });
      container.add(c2);

      var c3 = new qx.ui.basic.Atom("Icon only ToolTip").set({
        backgroundColor: "#D1A4AD",
        height: 100,
        padding: 20,
        paddingLeft: 20,
        decorator: "outset",
        focusable: true
      });
      container.add(c3);

      var c4 = new qx.ui.basic.Atom("ToolTip with icon and label").set({
        backgroundColor: "#F5E0BB",
        height: 100,
        padding: 20,
        paddingLeft: 20,
        decorator: "outset",
        focusable: true
      });
      container.add(c4);

      var c5 = new qx.ui.basic.Atom("Short timeout ToolTip").set({
        backgroundColor: "#F5E0BB",
        height: 100,
        padding: 20,
        decorator: "outset",
        focusable: true
      });
      container.add(c5);

      var tt1 = new qx.ui.popup.ToolTip("Hello World #1");
      c1.setToolTip(tt1);
      c2.setToolTip(tt1);

      var tt2 = new qx.ui.popup.ToolTip(null, "icon/16/actions/help-about.png");
      c3.setToolTip(tt2);

      var tt3 = new qx.ui.popup.ToolTip("Hello World #3", "icon/16/actions/help-about.png");
      c4.setToolTip(tt3);

      var tt4 = new qx.ui.popup.ToolTip("Such a great tooltip with a (show) timeout of 50ms.", "icon/32/actions/help-about.png");
      c5.setToolTip(tt4);
      tt4.setShowTimeout(50);
    }
  }
});
