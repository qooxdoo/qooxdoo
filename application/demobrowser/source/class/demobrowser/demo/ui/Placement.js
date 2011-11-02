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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.Placement",
{
  extend : qx.application.Standalone,

  members :
  {
    __positions : null,

    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();

      this.__positions = ["bottom-left", "bottom-right", "top-left",
        "top-right", "right-top", "right-bottom", "left-top", "left-bottom"];

      // Corners
      root.add(this.createTestField("bottom-left"), { left: 20, top: 20 });
      root.add(this.createTestField("bottom-right"), { right: 20, top: 20 });
      root.add(this.createTestField("top-left"), { right: 20, bottom: 20 });
      root.add(this.createTestField("top-right"), { left: 20, bottom: 20 });

      // Left+Right Side
      root.add(this.createTestField("right-top"), { left: 20, top: 250 });
      root.add(this.createTestField("left-bottom"), { right: 20, top: 250 });

      // DOM align test
      root.add(this.createDomClick(), { left: 200, top: 100 });
    },


    createTestField : function(init)
    {
      var composite = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));

      var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grow);
      popup.add(new qx.ui.basic.Atom("Content"));
      popup.setPadding(20);

      var selectBox = new qx.ui.form.SelectBox;
      var itemToSelect = null;

      for (var i = 0; i < this.__positions.length; i++)
      {
        var item = new qx.ui.form.ListItem(this.__positions[i]);
        selectBox.add(item);

        if (this.__positions[i] == init) {
          itemToSelect = item;
        }
      }
      composite.add(selectBox);

      selectBox.addListener("changeSelection", function(e) {
        popup.setPosition(e.getData()[0].getLabel());
      });

      selectBox.setSelection([itemToSelect]);

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
      for (var i = 0; i < this.__positions.length; i++) {
        selectBox.add(new qx.ui.form.ListItem(this.__positions[i]));
      }
      composite.add(selectBox);

      selectBox.addListener("changeSelection", function(e) {
        popup.setPosition(e.getData()[0].getLabel());
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
  },

  destruct : function() {
    this.__positions = null;
  }
});
