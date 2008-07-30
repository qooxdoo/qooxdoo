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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/48/actions/list-add.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.RepeatButton",
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


      // Button
      var img1 = "icon/48/actions/list-add.png";
      var btn1 = new qx.ui.form.RepeatButton(null, img1);
      container.add(btn1);

      // Label
      var l1 = new qx.ui.basic.Label("0");
      this.getRoot().add(l1, {left:20, top:80});

      // Listener
      btn1.addListener("execute", function() {
        var tempValue = parseInt(l1.getContent()) + 1;
        l1.setContent(tempValue.toString());
      });
      btn1.addListener("press", function() {
        l1.setBackgroundColor("#AAAAAA");
      }, this);
      btn1.addListener("release", function() {
        l1.setBackgroundColor("#FFFFFF");
      }, this);
    }
  }
});
