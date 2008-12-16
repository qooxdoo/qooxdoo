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

qx.Class.define("demobrowser.demo.ui.Placement",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();

      // Corners
      root.add(this.createTestField("bottom-left"), { left: 20, top: 20 });
      root.add(this.createTestField("bottom-right"), { right: 20, top: 20 });
      root.add(this.createTestField("top-left"), { right: 20, bottom: 20 });
      root.add(this.createTestField("top-right"), { left: 20, bottom: 20 });

      // Left+Right Side
      root.add(this.createTestField("right-top"), { left: 20, top: 250 });
      root.add(this.createTestField("left-bottom"), { right: 20, top: 250 });

      // DOM align test
      root.add(this.createDomClick(), { left: 500, top: 100 });
    },


    createTestField : function(init)
    {
      var composite = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));

      var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grow);
      popup.add(new qx.ui.basic.Atom("Content"));
      popup.setPadding(20);

      var selectBox = new qx.ui.form.SelectBox;
      selectBox.add(new qx.ui.form.ListItem("bottom-left"));
      selectBox.add(new qx.ui.form.ListItem("bottom-right"));
      selectBox.add(new qx.ui.form.ListItem("top-left"));
      selectBox.add(new qx.ui.form.ListItem("top-right"));
      selectBox.add(new qx.ui.form.ListItem("right-top"));
      selectBox.add(new qx.ui.form.ListItem("right-bottom"));
      selectBox.add(new qx.ui.form.ListItem("left-top"));
      selectBox.add(new qx.ui.form.ListItem("left-bottom"));
      composite.add(selectBox);

      selectBox.addListener("changeValue", function(e) {
        popup.setPosition(e.getData());
      });

      selectBox.setValue(init);

      var button = new qx.ui.form.Button("Open Popup");
      composite.add(button);
      button.addListener("mousedown", function(e)
      {
        popup.placeToWidget(button);
        popup.show();
      });

      return composite;
    },


    createDomClick : function()
    {
      var composite = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));

      var label = new qx.ui.basic.Label("DOM align control");
      composite.add(label);

      var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grow);
      popup.add(new qx.ui.basic.Atom("DOM Popup"));
      popup.setPadding(20);

      var selectBox = new qx.ui.form.SelectBox;
      selectBox.add(new qx.ui.form.ListItem("bottom-left"));
      selectBox.add(new qx.ui.form.ListItem("bottom-right"));
      selectBox.add(new qx.ui.form.ListItem("top-left"));
      selectBox.add(new qx.ui.form.ListItem("top-right"));
      selectBox.add(new qx.ui.form.ListItem("right-top"));
      selectBox.add(new qx.ui.form.ListItem("right-bottom"));
      selectBox.add(new qx.ui.form.ListItem("left-top"));
      selectBox.add(new qx.ui.form.ListItem("left-bottom"));
      composite.add(selectBox);

      selectBox.addListener("changeValue", function(e) {
        popup.setPosition(e.getData());
      });

      var button = new qx.ui.form.Button("Open DOM-Popup");
      composite.add(button);
      button.addListener("mousedown", function(e)
      {
        popup.placeToElement(document.getElementById("domanchor"));
        popup.show();
      });

      return composite;
    }
  }
});
