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

/* ************************************************************************
#ignore(qx.demo)
************************************************************************ */

qx.Class.define("qx.test.data.controller.List",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,

  members :
  {

    __list: null,
    __controller: null,
    __data: null,
    __model : null,

    setUp : function()
    {
      // prevent the icon laod error with this stub
      this.stub(qx.io.ImageLoader, "load")

      this.__list = new qx.ui.form.List();
    },


    tearDown : function()
    {
      this.__controller ? this.__controller.dispose() : null;
      this.__model ? this.__model.dispose() : null;
      for (var i=0; i<this.__list.getChildren().length; i++) {
        this.__list.getChildren()[i].destroy();
      }
      this.__list.destroy();
      this.flush();
      this.__controller = null;
      this.__model = null;
      this.__data = null;
      this.base(arguments);
      // clear the stub
      this.getSandbox().restore();
    },


    __setUpString: function(attribute) {
      this.__data = ["a", "b", "c", "d", "e"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);
    },


    testNumberModel : function() {
      var selectBox = new qx.ui.form.SelectBox();

      var model = qx.data.marshal.Json.createModel([1, 0]);
      var controller = new qx.data.controller.List(model, selectBox);

      controller.getSelection().push(0);
      this.assertEquals(1, controller.getSelection().length);
      this.assertEquals(0, controller.getSelection().getItem(0));

      selectBox.destroy();
      model.dispose();
      controller.dispose();
    },


    testModelChangeCombobox : function() {
      var model2 = new qx.data.Array(["A", "B"]);
      var box = new qx.ui.form.ComboBox();
      var controller = new qx.data.controller.List(this.__model, box);

      // change the model
      controller.setModel(model2);
      this.assertEquals("A", box.getChildControl("list").getChildren()[0].getLabel());
      this.assertEquals("B", box.getChildControl("list").getChildren()[1].getLabel());

      model2.dispose();
      box.dispose();
      controller.dispose();
    },


    testStringArray: function() {
      this.__setUpString();

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testEmptyList: function() {
      this.__setUpString();
      this.__controller.setModel(null);

      // check that the list is empty
      this.assertEquals(0, this.__list.getChildren().length);
    },


    testStringElementRemove: function() {
      this.__setUpString();

      // remove the last elements
      this.__data.shift();
      this.__model.shift();

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
      // check the length
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },


    testStringElementAdd: function() {
      this.__setUpString();

      // remove the last elements
      this.__data.unshift("A");
      this.__model.unshift("A");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
      // check the length
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },


    testChangeElement: function() {
      this.__setUpString();

      // change one element
      this.__data[0] = "A";
      this.__model.setItem(0, "A");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testChangeModelSmaller: function() {
      this.__setUpString();

      this.__model.dispose();
      // change one element
      this.__data = ["f", "g", "h", "i"];
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
      // check the length
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },


    testChangeModelBigger: function() {
      this.__setUpString();

      this.__model.dispose();
      // change one element
      this.__data = ["f", "g", "h", "i", "j", "k"];
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
      // check the length
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },


    testChangeTarget: function() {
      this.__setUpString();

      var list = new qx.ui.form.List();

      // change the target
      this.__controller.setTarget(list);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
      // check the length of the old list
      this.assertEquals(0, this.__list.getChildren().length, "Wrong length!");

      list.dispose();
    },


    testReverse: function() {
      this.__setUpString();

      // reverse the datas
      this.__data.reverse();
      this.__model.reverse();

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testBooleanArray: function() {
      this.__data = [true, false, false];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);

      var checkArray = ["true", "false", "false"];
      // check the binding
      for (var i = 0; i < checkArray.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(checkArray[i], label, "Boolean-Binding " + i + " is wrong!");
      }
    },


    testNumberArray: function() {
      this.__data = [10, 20, -1, 50];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);

      var checkArray = ["10", "20", "-1", "50"];
      // check the binding
      for (var i = 0; i < checkArray.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(checkArray[i], label, "Boolean-Binding " + i + " is wrong!");
      }
    },


    testSelectBox: function() {
      this.__data = ["10", "20", "-1", "50"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      var box = new qx.ui.form.SelectBox();
      this.__controller = new qx.data.controller.List(this.__model, box);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = box.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "SelectBox-Binding " + i + " is wrong!");
      }
      box.dispose();
    },


    testComboBox: function() {
      this.__data = ["10", "20", "-1", "50"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      var box = new qx.ui.form.ComboBox();
      this.__controller = new qx.data.controller.List(this.__model, box);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = box.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "ComboBox-Binding " + i + " is wrong!");
      }
      box.dispose();
    },


    testResetSelectionSingle: function(){
      this.__setUpString();

      var box = new qx.ui.form.SelectBox();
      this.__controller.setTarget(box);

      var model = new qx.data.Array(["x", "y", "z"]);

      this.__controller.getSelection().push("b");

      // change the model (should reset the selection)
      this.__controller.setModel(model);

      // first element should be selected because its a select box

      this.wait(100, function() {
        this.assertEquals("x", this.__controller.getSelection().getItem(0));

        model.dispose();
        box.destroy();
      }, this);

    },


    testSelectionSingle: function() {
      this.__setUpString();

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


    testSelectionSingleRemoveFirst: function() {
      this.__setUpString();
      var model = this.__model;
      this.__list.setSelectionMode("one");

      var selection = this.__controller.getSelection();

      this.assertEquals(model.getItem(0), this.__list.getSelection()[0].getModel());

      this.assertEventFired(selection, "change", function() {
        model.removeAt(0);
      });
    },


    testSelectionMultiple: function() {
      this.__setUpString();

      // select the second and third object
      this.__list.setSelectionMode("multi");
      this.__list.addToSelection(this.__list.getChildren()[1]);
      this.__list.addToSelection(this.__list.getChildren()[2]);

      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "Selection does not work.");
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "Selection does not work.");

      // test for the selection length
      this.assertEquals(2, this.__controller.getSelection().length, "Selection length is wrong.");
    },


    testSelectionBackSingle: function() {
      this.__setUpString();

      // add the first element to the selection
      this.__controller.getSelection().push(this.__model.getItem(0));

      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
    },


    testSelectionBackMultiple: function() {
      this.__setUpString();

      // select the second and third object
      this.__list.setSelectionMode("multi");

      // add the some elements to the selection
      this.__controller.getSelection().push(this.__model.getItem(1));
      this.__controller.getSelection().push(this.__model.getItem(2));

      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "addToSelection does not work.");
    },


    testSelectionArrayChange: function() {
      this.__setUpString();

      // set a new selection array
      this.__controller.setSelection(new qx.data.Array([this.__model.getItem(0)]));

      // test the selection
      this.assertEquals(
        this.__model.getItem(0),
        this.__list.getSelection()[0].getLabel(),
        "Change the selection array does not work."
      );
      this.__controller.getSelection().dispose();
    },


    testSelectionArrayChangeItem: function() {
      this.__setUpString();

      // set the selection in the array
      this.__controller.getSelection().push(this.__model.getItem(0));

      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__list.getSelection()[0].getLabel(), "Change the selection array does not work.");
    },


    testSelectionArrayReverse: function() {
      this.__setUpString();

      // set the selection in the array
      this.__controller.getSelection().push(this.__model.getItem(0));

      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__list.getSelection()[0].getLabel(), "Change the selection array does not work.");

      // reverse the model
      this.__model.reverse();

      // test the selection (the selection is async in that case)
      var self = this;
      this.wait(100, function() {
        self.assertEquals(
          self.__model.getItem(self.__model.getLength() - 1),
          self.__list.getSelection()[0].getLabel(),
          "Can not handle reverse."
        );
      });
    },


    testSelectionAfterDelete: function() {
      this.__setUpString();

      // add b to the selection
      this.__controller.getSelection().push("b");
      // remove the first element of the controller 'a'
      this.__model.shift();

      // check if the selected item in the list is "b"
      this.assertTrue(this.__controller.getSelection().contains("b"), "Selection array wrong!");

      // selection updates work with the widget pool and can be async
      this.wait(100, function() {
        this.assertEquals("b", this.__list.getSelection()[0].getLabel(), "Remove from selection does not work!");
      }, this);
    },


    testSelectionAfterDeleteEmpty: function() {
      this.__setUpString();

      // add c to the selection
      this.__controller.getSelection().push("c");
      // remove the c
      this.__model.splice(2, 1);

      // selection updates work with the widget pool and can be async
      this.wait(100, function() {
        // check if the selection is empty
        this.assertEquals(0, this.__controller.getSelection().length, "Remove from selection does not work!");
      }, this);
    },


    testResetBug: function() {
      this.__setUpString();

      // create the test label
      var label = new qx.ui.basic.Label();
      this.__controller.bind("selection[0]", label, "value");

      // add stuff to the selection
      this.__controller.getSelection().push("c");

      // remove the first element of the controller 'a'
      this.__model.shift();
      this.__model.shift();

      // check for the label
      this.assertEquals("c", label.getValue(), "Label has not the right value.");

      // remove the selected element
      this.__model.shift();

      // check for null
      var self = this;
      this.wait(100, function() {
        self.assertNull(label.getValue(), "Label does still contain something!");
      }, this);
    },


    testDates: function() {
      this.__data = [new Date(0), new Date(100)];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].toString(), label, "Date-Binding " + i + " is wrong!");
      }
    },


    testConversionLabel: function() {
      this.__setUpString();

      // create the options map with the converter
      var options = {};
      options.converter = function(data) {
        return data + " Converted";
      }
      this.__controller.setLabelOptions(options);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i] + " Converted", label, "Binding " + i + " is wrong!");
      }
    },


    testOnUpdateLabel: function() {
      this.__data = ["a", "b", "c", "d", "e"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the options map with the converter
      var options = {};
      var flag = false;
      options.onUpdate = function() {
        flag = true;
      }
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);
      this.__controller.setLabelOptions(options);

      // change something to inkoe a change of a binding
      this.__data.pop();
      this.__model.pop();

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }

      // check if the flag is set
      this.assertTrue(flag, "onUpdate not executed");
    },


    testSelectBoxSelectionSingle: function() {
      this.__data = ["10", "20", "-1", "50"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      var box = new qx.ui.form.SelectBox();
      this.__controller = new qx.data.controller.List(this.__model, box);

      // add 10 to the selection
      this.__controller.getSelection().push("10");

      // check for the Selection
      this.assertEquals("10", box.getSelection()[0].getLabel(), "Wrong selection");

      box.dispose();
    },


    testSelectionWithModelChange: function() {
      this.__setUpString();

      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[0]);
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");

      // change the model
      this.__controller.setModel(new qx.data.Array(["x", "y", "z"]));

      // test for an empty selection
      this.assertEquals(0, this.__controller.getSelection().length, "Selection is not empty.");

      // select an item
      this.__controller.getSelection().push("x");

      // test for the selection
      this.assertEquals("x", this.__controller.getSelection().getItem(0), "Selection is wrong.");
      this.__controller.getModel().dispose();
    },


    testSelectionWithModelChangeSelectBox: function() {
      this.__data = ["a", "b", "c", "d", "e"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      var selectBox = new qx.ui.form.SelectBox();
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, selectBox);

      // first object is selected (one selection mode)

      // test the selection
      this.assertEquals(this.__model.getItem(0), selectBox.getSelection()[0].getModel());
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");

      // change the model
      this.__controller.setModel(new qx.data.Array(["x", "y", "z"]));

      // select an item
      this.__controller.getSelection().push("y");

      // test for the selection
      this.assertEquals(1, this.__controller.getSelection().length, "Selection has a wrong length.");
      this.assertEquals("y", this.__controller.getSelection().getItem(0), "Selection is wrong.");

      this.__controller.setModel(new qx.data.Array(["1", "2", "3"]));

      this.__controller.addListener("changeSelection", function() {
        this.resume(function() {
          // test for the first selected item (one selection)
          this.assertEquals(1, this.__controller.getSelection().length, "Selection has a wrong length.");
          this.assertEquals("1", this.__controller.getSelection().getItem(0), "Selection does not work.");
          selectBox.dispose();

        }, this);
      }, this);

      this.wait();
    },


    testFilterApply: function() {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "b" || data == "c" || data == "d";
      };

      this.__controller.setDelegate(delegate);

      // check the binding
      for (var i = 0; i < this.__data.length - 2; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i + 1], label, "Binding " + i + " is wrong!");
      }
    },


    testFilterChange: function() {
      this.__setUpString();

      var delegate1 = {};
      delegate1.filter = function(data) {
        return data == "b" || data == "c" || data == "d";
      };
      var delegate2 = {};
      delegate2.filter = function(data) {
        return data == "a" || data == "b" || data == "c";
      };

      this.__controller.setDelegate(delegate1);
      this.__controller.setDelegate(delegate2);

      // check the binding
      for (var i = 0; i < this.__data.length - 2; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testFilterChangeModel: function() {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "B" || data == "C" || data == "D";
      };

      this.__controller.setDelegate(delegate);

      // check for the right length
      this.assertEquals(0, this.__list.getChildren().length, "Some list items created.");

      var model = new qx.data.Array("A", "B", "C", "D", "E");
      this.__controller.setModel(model);

      // check the length
      this.assertEquals(3, this.__list.getChildren().length, "Wrong number of list items");
      // check the labels
      this.assertEquals("B", this.__list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("C", this.__list.getChildren()[1].getLabel(), "Binding is wrong!");
      this.assertEquals("D", this.__list.getChildren()[2].getLabel(), "Binding is wrong!");
      model.dispose();
    },


    testFilterReverseModel: function() {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "a" || data == "b" || data == "c";
      };

      this.__controller.setDelegate(delegate);

      // check for the right length
      this.assertEquals(3, this.__list.getChildren().length, "Some list items created.");
      // check the labels
      this.assertEquals("a", this.__list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("b", this.__list.getChildren()[1].getLabel(), "Binding is wrong!");
      this.assertEquals("c", this.__list.getChildren()[2].getLabel(), "Binding is wrong!");

      // reverse the order of the model
      this.__model.reverse();

      // check for the right length
      this.assertEquals(3, this.__list.getChildren().length, "Some list items created.");
      // check the labels
      this.assertEquals("c", this.__list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("b", this.__list.getChildren()[1].getLabel(), "Binding is wrong!");
      this.assertEquals("a", this.__list.getChildren()[2].getLabel(), "Binding is wrong!");
    },


    testFilterRemove: function() {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "a" || data == "b" || data == "c";
      };

      this.__controller.setDelegate(delegate);

      // check for the right length
      this.assertEquals(3, this.__list.getChildren().length, "Some list items created.");
      // check the labels
      this.assertEquals("a", this.__list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("b", this.__list.getChildren()[1].getLabel(), "Binding is wrong!");
      this.assertEquals("c", this.__list.getChildren()[2].getLabel(), "Binding is wrong!");

      // remove the filter
      this.__controller.setDelegate(null);

      // check for the right length
      this.assertEquals(5, this.__list.getChildren().length, "Some list items created.");
      // check the labels
      this.assertEquals("a", this.__list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("b", this.__list.getChildren()[1].getLabel(), "Binding is wrong!");
      this.assertEquals("c", this.__list.getChildren()[2].getLabel(), "Binding is wrong!");
      this.assertEquals("d", this.__list.getChildren()[3].getLabel(), "Binding is wrong!");
      this.assertEquals("e", this.__list.getChildren()[4].getLabel(), "Binding is wrong!");
    },


    testFilterChangeTarget: function() {
      this.__setUpString();

      var list = new qx.ui.form.List();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "b" || data == "d";
      };

      this.__controller.setDelegate(delegate);

      // check the length of the first list
      this.assertEquals(2, this.__list.getChildren().length, "Wrong number of list items");

      // change the target
      this.__controller.setTarget(null);
      // check if everything is cleaned up
      this.assertEquals(0, this.__list.getChildren().length, "Wrong number of list items");

      // set the new target
      this.__controller.setTarget(list);

      // check the new target
      this.assertEquals(2, list.getChildren().length, "Wrong number of list items");
      this.assertEquals("b", list.getChildren()[0].getLabel(), "Binding is wrong!");
      this.assertEquals("d", list.getChildren()[1].getLabel(), "Binding is wrong!");

      this.__controller.dispose();
      list.dispose();
    },


    testFilterWithSelection: function() {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "a" || data == "e";
      };
      this.__controller.setDelegate(delegate);

      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[0]);
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");

      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");

      // select the second object
      this.__list.addToSelection(this.__list.getChildren()[1]);
      // test the selection
      this.assertEquals(this.__model.getItem(4), this.__controller.getSelection().getItem(0), "Selection does not work.");

      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");
    },


    testFilterAfterSelection: function() {
      this.__setUpString();

      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[1]);

      // apply the filter
      var delegate = {};
      delegate.filter = function(data) {
        return data == "b" || data == "c" || data == "d";
      };
      this.__controller.setDelegate(delegate);

      this.assertEquals("b", this.__controller.getSelection().getItem(0), "Selection does not work.");
      this.assertEquals("b", this.__list.getSelection()[0].getLabel(), "Selection does not work.");
    },


    testDelegateLate: function() {
      this.__setUpString();

      // create the delegate
      var delegate = {};
      delegate.configureItem = function(item) {
        item.setRich(true);
      };

      this.__controller.setDelegate(delegate);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var item = this.__list.getChildren()[i];
        this.assertTrue(item.getRich(), "Delegate " + i + " is wrong!");
      }
    },


    testDelegateFirst: function() {
      this.__data = ["a", "b", "c", "d", "e"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      // create the controller
      this.__controller = new qx.data.controller.List();
      // create the delegate
      var delegate = {};
      delegate.configureItem = function(item) {
        item.setRich(true);
      };

      this.__controller.setDelegate(delegate);
      this.__controller.setTarget(this.__list);
      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var item = this.__list.getChildren()[i];
        this.assertTrue(item.getRich(), "Delegate " + i + " is wrong!");
      }
    },


    testDelegateBindItem: function() {
      this.__data = [true, true, false, true, false];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      this.__controller = new qx.data.controller.List();

      var delegate = {};
      delegate.createItem = function() {
        return new qx.ui.form.CheckBox();
      }

      delegate.bindItem = function(controller, item, id) {
        controller.bindProperty(null, "enabled", null, item, id);
      }

      this.__controller.setDelegate(delegate);
      this.__controller.setTarget(this.__list);
      this.__controller.setModel(this.__model);

      // check the binding
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        this.assertEquals("qx.ui.form.CheckBox", this.__list.getChildren()[i].classname);
        var label = this.__list.getChildren()[i].getEnabled();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testDelegateBindItemLate: function() {
      this.__data = [true, true, false, true, false];
      // create a new array
      this.__model = new qx.data.Array(this.__data);

      this.__controller = new qx.data.controller.List();
      this.__controller.setTarget(this.__list);
      this.__controller.setModel(this.__model);

      var delegate = {};
      delegate.createItem = function() {
        return new qx.ui.form.CheckBox();
      }

      delegate.bindItem = function(controller, item, id) {
        controller.bindProperty(null, "enabled", null, item, id);
      }

      this.__controller.setDelegate(delegate);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        this.assertEquals("qx.ui.form.CheckBox", this.__list.getChildren()[i].classname);
        var label = this.__list.getChildren()[i].getEnabled();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testDelegateBindDefaultProperties : function()
    {
      this.__setUpString();
      this.__controller.setModel(null);

      var delegate = {};
      delegate.bindItem = function(controller, item, id) {
        controller.bindDefaultProperties(item, id);
      }
      this.__controller.setDelegate(delegate);

      this.__controller.setModel(this.__model);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },


    testDelegateBindDefaultPropertiesLate : function()
    {
      this.__setUpString();

      var delegate = {};
      delegate.bindItem = function(controller, item, id) {
        controller.bindDefaultProperties(item, id);
      }
      this.__controller.setDelegate(delegate);

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        this.__model.setItem(i, i + "")
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(i + "", label, "Binding " + i + " is wrong!");
      }
    },


    testSelectionSequence: function() {
      // "a", "b", "c", "d", "e"
      this.__setUpString();
      this.__list.setSelectionMode("multi");

      var selList = new qx.ui.form.List();
      var selController = new qx.data.controller.List(null, selList);

      // add the last two to the selection of the first list
      this.__list.addToSelection(this.__list.getChildren()[4]);
      this.__list.addToSelection(this.__list.getChildren()[3]);

      // special hack for chrome because his selection order is different
      selController.setModel(this.__controller.getSelection());

      var labels = [];
      for (var i = 0; i < selList.getChildren().length; i++) {
        labels.push(selList.getChildren()[i].getLabel());
      };

      // check if the second list is filled right
      this.assertNotEquals(-1, labels.indexOf("e"), "e is not in the selection list.");
      this.assertNotEquals(-1, labels.indexOf("d"), "d is not in the selection list.");

      selList.addToSelection(selList.getChildren()[1]);

      this.assertEquals(selList.getChildren()[1].getLabel(), selController.getSelection().getItem(0), "d not selected in the second list.");

      // remove the last element of the first list
      this.__model.pop();

      this.wait(100, function() {
        // is d still in the list?
        this.assertEquals("d", selList.getChildren()[0].getLabel(), "d is not in the selection list anymore.");

        // get rid of that old stuff
        this.flush();
        selList.dispose();
        selController.dispose();
      }, this);
    },


    testGetVisibleModels : function()
    {
      this.__setUpString();

      var delegate = {};
      delegate.filter = function(data) {
        return data == "b" || data == "c" || data == "d";
      };

      this.__controller.setDelegate(delegate);

      var visibleModels = this.__controller.getVisibleModels();

      this.assertEquals(visibleModels.classname, "qx.data.Array");
      this.assertEquals(3, visibleModels.getLength());
      this.assertEquals("b", visibleModels.getItem(0));
      this.assertEquals("c", visibleModels.getItem(1));
      this.assertEquals("d", visibleModels.getItem(2));
      visibleModels.dispose();
    },


    testBindIconWithStringArray : function()
    {
      this.__setUpString();
      this.__controller.setIconPath("");

      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var icon = this.__list.getChildren()[i].getIcon();
        this.assertEquals(this.__data[i], icon, "Binding " + i + " is wrong!");
      }
    },


    testScrollBySelection : function()
    {
      this.__setUpString();
      // set a smal hight (list hast to scroll)
      this.__list.setHeight(40);
      this.getRoot().add(this.__list);
      var selectables = this.__list.getSelectables();

      // select the first item
      this.__list.setSelection([selectables[0]]);
      // Workaround for Opera's asynchronous scrolling behavior, see bug #3613.
      if (qx.core.Environment.get("engine.name") == "opera" &&
        parseFloat(qx.core.Environment.get("engine.version")) <= 9.6) {
        qx.event.Timer.once(function() {
          // scroll a bit down (scrollY is 40)
          this.__list.scrollByY(40);
        }, this, 0);

        this.wait(100, function() {
          // select the current visible item
          this.__list.addToSelection(selectables[2]);
          // check that it has not been scrolled
          this.assertEquals(40, this.__list.getScrollY());
        }, this);
      }
      else {
        // scroll a bit down (scrollY is 40)
        this.__list.scrollByY(40);
        // select the current visible item
        this.__list.addToSelection(selectables[2]);
        // check that it has not been scrolled
        this.assertEquals(40, this.__list.getScrollY());
      }
    },


    testScrollBySelectionMulti : function()
    {
      this.__setUpString();
      // set a smal hight (list hast to scroll)
      this.__list.setHeight(40);
      this.__list.setSelectionMode("multi");
      this.getRoot().add(this.__list);
      var selectables = this.__list.getSelectables();

      // select the first item
      this.__list.setSelection([selectables[0]]);
      // Workaround for Opera's asynchronous scrolling behavior, see bug #3613.
      if (qx.core.Environment.get("engine.name") == "opera" &&
        parseFloat(qx.core.Environment.get("engine.version")) <= 9.6) {
        qx.event.Timer.once(function() {
          // scroll a bit down (scrollY is 40)
          this.__list.scrollByY(40);
        }, this, 0);

        this.wait(100, function() {
          // select the current visible item
          this.__list.addToSelection(selectables[2]);
          // check that it has not been scrolled
          this.assertEquals(40, this.__list.getScrollY());
        }, this);
      }
      else {
        // scroll a bit down (scrollY is 40)
        this.__list.scrollByY(40);
        // select the current visible item
        this.__list.addToSelection(selectables[2]);
        // check that it has not been scrolled
        this.assertEquals(40, this.__list.getScrollY());
      }
    },


    testBug1947: function() {
      qx.Class.define("qx.demo.Kid",
      {
        extend : qx.core.Object,

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          }
        }
      });

      var kid = new qx.demo.Kid();
      qx.Class.define("qx.demo.Parent",
      {
        extend : qx.core.Object,
        construct : function()
        {
          this.base(arguments);
          this.setKid(kid);
        },

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          },
          kid :
          {
            check : "qx.demo.Kid",
            event : "changeKid"
          }
        }
      });

      var parentA = new qx.demo.Parent()
      parentA.setName("parentA");
      parentA.getKid().setName("kidA");
      var parentB = new qx.demo.Parent();
      parentB.setName("parentB");
      parentB.getKid().setName("kidB");
      var parents = new qx.data.Array();
      parents.push(parentA);
      parents.push(parentB);

      var list = new qx.ui.form.List();
      var ctrl = new qx.data.controller.List(parents, list, "name");

      var label = new qx.ui.basic.Label();
      label.setDecorator("main");

      ctrl.bind("selection[0].Kid.Name", label, "value");

      ctrl.getSelection().push(parentA);

      parentA.dispose();
      parentB.dispose();
      kid.dispose();
      list.dispose();
      ctrl.dispose();
      label.dispose();
      parents.dispose();
    },


    testBug1988: function() {
      qx.Class.define("qx.demo.Kid",
      {
        extend : qx.core.Object,

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null,
            nullable : true
          }
        }
      });

      //var kid = new qx.demo.Kid();
      qx.Class.define("qx.demo.Parent",
      {
        extend : qx.core.Object,
        construct : function()
        {
          this.base(arguments);
          this.setKid(new qx.demo.Kid());
        },

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          },
          kid :
          {
            check : "qx.demo.Kid",
            event : "changeKid"
          }
        }
      });

      var parentA = new qx.demo.Parent()
      parentA.setName("parentA");
      parentA.getKid().setName("kidA");


      var parentB = new qx.demo.Parent();
      parentB.setName("parentB");
      //parentB.getKid().setName("kidB");


      var parents = new qx.data.Array();
      parents.push(parentA);
      parents.push(parentB);

      var list = new qx.ui.form.List();
      var ctrl = new qx.data.controller.List(parents, list, "name");

      var label = new qx.ui.basic.Label();

      ctrl.bind("selection[0].kid.name", label, "value");

      // select the first child of the list
      list.addToSelection(list.getChildren()[0]);
      // check the label
      this.assertEquals("kidA", label.getValue(), "Wrong name in the label.");

      // select the second label
      list.addToSelection(list.getChildren()[1]);
      this.assertNull(label.getValue(), "Label has not been reseted.");

      parentA.getKid().dispose();
      parentA.dispose();
      parentB.getKid().dispose();
      parentB.dispose();
      list.dispose();
      ctrl.dispose();
      label.dispose();
      parents.dispose();
    }
  }
});
