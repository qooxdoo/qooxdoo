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

qx.Class.define("demobrowser.demo.widget.RepeatButton_1",
{
  extend : qx.application.Native,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      // ----- RepeatButton 1 -----
      var img1 = "icon/48/actions/list-add.png";
      var btn1 = new qx.ui.form.RepeatButton(null, img1, 48, 48);
      docLayout.add(btn1);

      // Label for the repeat button 1
      var l1 = new qx.ui.basic.Label("0");
      doc.add(l1, 20, 80);
      // listener for the repeatbutton 1
      btn1.addListener("execute", function() {
        var tempValue = parseInt(l1.getContent());
        l1.setContent((tempValue + 1) + "");
      });
      btn1.addListener("press", function() {
        l1.setBackgroundColor("#AAAAAA");
      }, this);
      btn1.addListener("release", function() {
        l1.setBackgroundColor("#FFFFFF");
      }, this);
      // --------------------------
    }
  }
});
