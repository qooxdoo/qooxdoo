/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.ComboBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroller = new qx.ui.container.Scroll();
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      scroller.add(container, {edge: 0});

      var standard = new qx.ui.container.Composite(new qx.ui.layout.HBox(50));
      standard.setPadding(20);

      standard.add(this.createBox1());
      standard.add(this.createBox2());
      standard.add(this.createBox3());

      container.add(standard, {left : 20, top : 20});
      this.getRoot().add(scroller, {edge : 0});
    },


    createBox1 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Simple"));

      // Creates the model data
      var model = new qx.data.Array();
      for (var i = 0; i < 300; i++) {
        model.push("Item " + (i+1));
      }

      // Creates the combo box
      var comboBox = new qx.ui.form.VirtualComboBox(model);
      container.add(comboBox);

      // log all changes on the selection
      comboBox.addListener("changeValue", function(e) {
        this.debug("Change value: ", e.getData());
      });


      return container;
    },


    createBox2 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Long text"));

      // Creates the model data
      var model = new qx.data.Array();
      for (var i = 0; i < 300; i++) {
        model.push("Random Value " + Math.round(Math.random()*100000000));
      }

      // Creates the select box
      var comboBox = new qx.ui.form.VirtualComboBox(model);
      container.add(comboBox);

      return container;
    },


    createBox3 : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      container.add(new qx.ui.basic.Label("Empty Item"));

      // Creates the model data
      var model = new qx.data.Array();
      model.push("");

      for (var i = 0; i < 300; i++) {
        model.push("Option " + (i+1));
      }

      // Creates the combo box
      var comboBox = new qx.ui.form.VirtualComboBox(model);
      container.add(comboBox);

      return container;
    }
  }
});
