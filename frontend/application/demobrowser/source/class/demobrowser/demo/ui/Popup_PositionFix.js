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

#asset(qx/icon/Oxygen/16/actions/help-about.png)
#asset(qx/icon/Oxygen/32/actions/help-about.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Tooltip_Clipping",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tooltip = new qx.ui.popup.ToolTip("Quite a long tool tip", "icon/32/actions/help-about.png");

      var c1 = new qx.ui.basic.Atom("Hover me").set({
        backgroundColor: "#BDD2EF",
        width: 100,
        height: 100,
        paddingLeft: 20,
        decorator: "outset",
        toolTip: tooltip,
        focusable: true
      });
      this.getRoot().add(c1, {left: 0, top: 0});

      var c2 = new qx.ui.basic.Atom("Hover me").set({
        backgroundColor: "#D1DFAD",
        width: 100,
        height: 100,
        paddingLeft: 20,
        decorator: "outset",
        toolTip: tooltip,
        focusable: true
      });
      this.getRoot().add(c2, {right: 0, top: 0});

      var c3 = new qx.ui.basic.Atom("Hover me").set({
        backgroundColor: "#D1A4AD",
        width: 100,
        height: 100,
        paddingLeft: 20,
        decorator: "outset",
        toolTip: tooltip,
        focusable: true
      });
      this.getRoot().add(c3, {right: 0, bottom: 0});

      var c4 = new qx.ui.basic.Atom("Hover me").set({
        backgroundColor: "#F5E0BB",
        width: 100,
        height: 100,
        paddingLeft: 20,
        decorator: "outset",
        toolTip: tooltip,
        focusable: true
      });
      this.getRoot().add(c4, {left: 0, bottom: 0});
    }
  }
});
