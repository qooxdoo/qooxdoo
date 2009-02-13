/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.data.controller.ListWithObjects", 
{
  extend : qx.dev.unit.TestCase,

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.ListWithObject",
    {
      extend : qx.core.Object,

      properties :
      {
        name : {
          check : "String",
          event : "changeName"
        },

        icon : {
          check : "String",
          init : "Juhu",
          event : "changeIcon"
        }
      }
    });
  },
  

  members :
  {   

    setUp : function()
    {
      this.__list = new qx.ui.form.List();

      // create the model
      this.__data = [];
      for (var i = 0; i < 5; i++) {
        var obj = new qx.test.ListWithObject();
        obj.setName("name" + i);
        obj.setIcon("icon" + i);
        this.__data.push(obj);
      }
      // create a new array
      this.__model = new qx.data.Array(this.__data);     
    },


    tearDown : function()
    {
      this.__controller = null;
      this.__model = null;
      this.__data = null;
      this.__list.dispose();
    },
    
    
    testRead: function() {    
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }      
    },
    
    
    testChangeLablePath: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }

      this.__controller.setLabelPath("icon");

      // check the binding again
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getIcon(), label, "Binding " + i + " is wrong!");
      }
    },
    
    
    testSelection: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      
      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[0]);
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");
    
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");
      
      // select the second object
      this.__list.addToSelection(this.__list.getChildren()[1]);
      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "Selection does not work.");
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");      
    },
    
    
    testSelectionBackMultiple: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
            
      // select the second and third object
      this.__list.setSelectionMode("multi");    
      
      // add the some elements to the selection
      this.__controller.getSelection().push(this.__model.getItem(1));
      this.__controller.getSelection().push(this.__model.getItem(2));      
      
      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "addToSelection does not work.");      
    },
    
    
    testChangeModelSmaller: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      
      // create the model
      this.__data = [];
      for (var i = 0; i < 2; i++) {
        var obj = new qx.test.ListWithObject();
        obj.setName("name");
        obj.setIcon("icon");
        this.__data.push(obj);
      }
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }      
      // check the length  
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");      
    },
    
    
    testIcon: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");
      
      // check the label binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
      // check the icon binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon(), icon, "Binding " + i + " is wrong!");
      }      
    },
    
    
    testChangeIconPath: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon(), icon, "Binding " + i + " is wrong!");
      }

      this.__controller.setIconPath("name");

      // check the binding again
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getName(), icon, "Binding " + i + " is wrong!");
      }
    },
    
    
    testConversionLabelAndIcon: function() {
      // create the label options
      var labelOptions = {
        converter: function(value) {
          return "Dr. " + value;
        }
      }
      // create the icon options
      var iconOptions = {
        converter: function(value) {
          return value + ".png";
        }
      }      
      
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");
      this.__controller.setLabelOptions(labelOptions);
      this.__controller.setIconOptions(iconOptions);
      
      
      // check the label binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals("Dr. " + this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
      
      // check the icon binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i].getIcon() + ".png", icon, "Binding " + i + " is wrong!");
      }      
    },
    
    
    testSetModelLate: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(null, this.__list, "name");
      
      this.__controller.setModel(this.__model);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
    },
    
    
    testSetTargetLate: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, null, "name");
      
      this.__controller.setTarget(this.__list);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].getName(), label, "Binding " + i + " is wrong!");
      }
    },
    
    
    testFilter: function() {
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list, "name");
      this.__controller.setIconPath("icon");
      
      var delegate = {};
      delegate.filter = function(data) {
        return data.getName() == "name2" ? true : false;
      }
      // set the filter
      this.__controller.setDelegate(delegate);
      
      // check for the length
      this.assertEquals(1, this.__list.getChildren().length, "Too much list items.");      
      
      // check the label binding
      var label = this.__list.getChildren()[0].getLabel();
      this.assertEquals("name2", label, "Label binding is wrong!");
      // check the icon binding
      var icon = this.__list.getChildren()[0].getIcon();
      this.assertEquals("icon2", icon, "Icon binding is wrong!");
    }
    
  }
});