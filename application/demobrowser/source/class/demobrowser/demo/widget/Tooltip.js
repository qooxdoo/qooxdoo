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
      
      var scroller = new qx.ui.container.Scroll();
      
      var box = new qx.ui.layout.HBox(20);
      var container = new qx.ui.container.Composite(box).set({
        padding: 20,
        allowStretchY : false
      });

      scroller.add(container);
      this.getRoot().add(scroller, {edge : 0});
      
      this.createSharedToolTip(container);
      this.createIconToolTip(container);
      this.createToolTip(container);
      this.createShortTimeoutToolTip(container);
      this.createRichToolTip(container);
    },
      
    
    createSharedToolTip : function(container)
    {
      var tooltip = new qx.ui.tooltip.ToolTip("Shared ToolTip");
      tooltip.addListener("appear", function(e)
      {
        var label = "Shared tool tip of button #";
        if (this.getOpener() == button1) {
          label += "1";
        } else {
          label += "2";
        }
        tooltip.setLabel(label);
      });

      var button1 = new qx.ui.form.Button("Button #1 (Shared ToolTip)");
      button1.setToolTip(tooltip);
      container.add(button1);

      var button2 = new qx.ui.form.Button("Button #2 (Shared ToolTip)");
      button2.setToolTip(tooltip);
      container.add(button2);
    },
    
    
    createIconToolTip : function(container)
    {
      var button = new qx.ui.form.Button("Icon only ToolTip").set({
        toolTip: new qx.ui.tooltip.ToolTip(null, "icon/16/actions/help-about.png")
      });
      container.add(button);
    },
    
    
    createToolTip : function(container)
    {
      var button = new qx.ui.form.Button("ToolTip with icon and label").set({
        toolTip: new qx.ui.tooltip.ToolTip(
          "Hello World #3", "icon/16/actions/help-about.png"
        ) 
      })
      container.add(button);
    },
    
    
    createShortTimeoutToolTip : function(container)
    {
      var button = new qx.ui.form.Button("Short timeout ToolTip");
      container.add(button);

      var tooltip = new qx.ui.tooltip.ToolTip(
        "Such a great tooltip with a (show) timeout of 50ms.",
        "icon/32/actions/help-about.png"
      );
      tooltip.setShowTimeout(50);
      button.setToolTip(tooltip);
    },
    
    
    createRichToolTip : function(container)
    {
      var button = new qx.ui.form.Button("ToolTip with icon and rich text");
      container.add(button);

      var tooltip = new qx.ui.tooltip.ToolTip(
        "A long label text with auto-wrapping. " +
          "This also may contain <b style='color:red'>rich HTML</b> markup " +
          "and with a (show) timeout of 50ms.",
        "icon/32/actions/help-about.png");
      
      tooltip.setWidth(200);
      tooltip.setRich(true);
      tooltip.setShowTimeout(50);
      
      button.setToolTip(tooltip);
    }
  }
});
