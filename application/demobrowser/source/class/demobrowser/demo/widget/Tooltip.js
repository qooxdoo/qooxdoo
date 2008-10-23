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

      var box = new qx.ui.layout.HBox(20);
      var container = new qx.ui.container.Composite(box).set({
        padding: 20
      })

      this.getRoot().add(container);

      var c1 = new qx.ui.form.Button("Shared ToolTip");
      container.add(c1);

      var c2 = new qx.ui.form.Button("Shared ToolTip");
      container.add(c2);

      var c3 = new qx.ui.form.Button("Icon only ToolTip");
      container.add(c3);

      var c4 = new qx.ui.form.Button("ToolTip with icon and label");
      container.add(c4);

      var c5 = new qx.ui.form.Button("Short timeout ToolTip");
      container.add(c5);

      var c6 = new qx.ui.form.Button("ToolTip with icon and rich text");
      container.add(c6);
      
      var tt1 = new qx.ui.tooltip.ToolTip("Hello World #1");
      c1.setToolTip(tt1);
      c2.setToolTip(tt1);

      var tt2 = new qx.ui.tooltip.ToolTip(null, "icon/16/actions/help-about.png");
      c3.setToolTip(tt2);

      var tt3 = new qx.ui.tooltip.ToolTip("Hello World #3", "icon/16/actions/help-about.png");
      c4.setToolTip(tt3);

      var tt4 = new qx.ui.tooltip.ToolTip("Such a great tooltip with a (show) timeout of 50ms.", "icon/32/actions/help-about.png");
      c5.setToolTip(tt4);
      tt4.setShowTimeout(50);
      
      var tt5 = new qx.ui.tooltip.ToolTip("A long label text with auto-wrapping. " 
          + "This also may contain <b style='color:red'>rich HTML</b> markup "
          + "and with a (show) timeout of 50ms.",
          "icon/32/actions/help-about.png");
      tt5.setWidth(200);
      tt5.setRich(true);
      tt5.setShowTimeout(50);
      c6.setToolTip(tt5);
    }
  }
});
