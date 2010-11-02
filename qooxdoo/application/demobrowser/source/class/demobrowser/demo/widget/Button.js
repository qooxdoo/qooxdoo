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

#asset(qx/icon/${qx.icontheme}/22/apps/media-video-player.png)
#asset(qx/icon/${qx.icontheme}/22/apps/internet-mail.png)
#asset(qx/icon/${qx.icontheme}/22/apps/internet-web-browser.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Button",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);
      this.getRoot().add(container, {left:0,top:0});

      this.addNormalButtons(container);
      this.addToggleButton(container);
      this.addToggleButtonGroup(container);
      this.addRepeatButton(container);
      this.addHoverButton(container);
    },


    addNormalButtons : function(container)
    {
      var btn1 = new qx.ui.form.Button("Button A", "icon/22/apps/media-video-player.png");
      container.add(btn1);

      var btn2 = new qx.ui.form.Button("Button B", "icon/22/apps/internet-mail.png");
      btn2.setEnabled(false);
      container.add(btn2);
    },


    addToggleButton : function(container)
    {
      var button = new qx.ui.form.ToggleButton("Toggle Button", "icon/22/apps/internet-web-browser.png");
      button.focus();
      container.add(button);

      button.addListener("changeValue", function(e) {
        this.debug("Checked: " + e.getData());
      }, this);
    },


    addToggleButtonGroup: function(container)
    {
      var button1 = new qx.ui.form.ToggleButton("On");
      var button2 = new qx.ui.form.ToggleButton("Off");

      var group = new qx.ui.form.RadioGroup();
      group.add(button1, button2);

      container.add(button1);
      container.add(button2);
    },


    addRepeatButton : function(container)
    {
      var button = new qx.ui.form.RepeatButton(null, "icon/22/actions/list-add.png");
      container.add(button);

      // Label
      var label = new qx.ui.basic.Label("0");
      label.setDecorator("main");
      label.setPadding(2, 4);
      label.setBackgroundColor("white");
      container.add(label);

      // Listener
      button.addListener("execute", function()
      {
        var tempValue = parseInt(label.getValue()) + 1;
        label.setValue(tempValue.toString());
      });
    },


    addHoverButton : function(container)
    {
      var button = new qx.ui.form.HoverButton("Hover").set({
        padding: 10,
        backgroundColor: "#AAA"
      });
      container.add(button);

      // Label
      var label = new qx.ui.basic.Label("0");
      label.setDecorator("main");
      label.setPadding(2, 4);
      label.setBackgroundColor("white");
      container.add(label);

      // Listener
      button.addListener("execute", function()
      {
        var tempValue = parseInt(label.getValue()) + 1;
        label.setValue(tempValue.toString());
      });
    }
  }
});
