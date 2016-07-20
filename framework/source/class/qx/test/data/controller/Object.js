/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.data.controller.Object",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __label1: null,
    __label2: null,
    __model: null,
    __controller: null,

    setUp : function()
    {
      this.__label1 = new qx.ui.basic.Label();
      this.__label2 = new qx.ui.basic.Label();

      this.__model = new qx.ui.core.Widget();

      this.__controller = new qx.data.controller.Object(this.__model);
    },


    tearDown : function()
    {
      this.__model.dispose();
      this.__label2.dispose();
      this.__label1.dispose();
      this.__controller.dispose();
    },


    testOneToOne: function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding does not work!");
    },


    testOneToTwo: function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");
      // Tie the label2s content to the zindex of the model
      this.__controller.addTarget(this.__label2, "value", "zIndex");

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("10", this.__label2.getValue(), "Binding2 does not work!");
    },


    testChangeModel: function() {
      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");
      this.__controller.addTarget(this.__label2, "value", "zIndex");

      // set an old zIndex
      this.__model.setZIndex(10);

      // create a new model with a different zIndex
      var newModel = new qx.ui.core.Widget();
      newModel.setZIndex(20);

      // dispose the old model to check that the controller can handle that
      this.__model.dispose();

      // set the new Model
      this.__controller.setModel(newModel);

      // test for the binding
      this.assertEquals("20", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("20", this.__label2.getValue(), "Binding2 does not work!");

      newModel.dispose();
    },


    testRemoveOneBinding: function() {
      // set a zIndex
      this.__model.setZIndex(20);

      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");
      this.__controller.addTarget(this.__label2, "value", "zIndex");

      // test for the binding
      this.assertEquals("20", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("20", this.__label2.getValue(), "Binding2 does not work!");

      // remove one target
      this.__controller.removeTarget(this.__label1, "value", "zIndex");

      // set a new zIndex
      this.__model.setZIndex(5);

      // test for the binding
      this.assertEquals("20", this.__label1.getValue(), "Binding1 has not been removed!");
      this.assertEquals("5", this.__label2.getValue(), "Binding2 has been removed!");
    },


    testRemoveUnexistantTarget: function() {
      // test some cases
      this.__controller.removeTarget(this.__label1, "value", "zIndex");
      this.__controller.removeTarget(null, "AFFE", "AFFEN");

      // set a target for testing
      this.__controller.addTarget(this.__label1, "value", "zIndex");

      // test the same cases again
      this.__controller.removeTarget(this.__label1, "value", "zIndex");
      this.__controller.removeTarget(null, "AFFE", "AFFEN");
    },


    testTowToTwo: function() {
      // set up two links
      this.__controller.addTarget(this.__label1, "value", "zIndex");
      this.__controller.addTarget(this.__label2, "value", "visibility");

      // set the values
      this.__model.setZIndex(11);
      this.__model.setVisibility("visible");

      // test for the binding
      this.assertEquals("11", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("visible", this.__label2.getValue(), "Binding2 does not work!");

      // set new values
      this.__model.setZIndex(15);
      this.__model.setVisibility("hidden");

      // test again for the binding
      this.assertEquals("15", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("hidden", this.__label2.getValue(), "Binding2 does not work!");
    },


    testOneToOneBi: function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", true);

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding does not work!");

      // set a new content
      this.__label1.setValue("20");

      // test the reverse binding
      this.assertEquals(20, this.__model.getZIndex(), "Reverse-Binding does not work!");
    },


    testOneToTwoBi: function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", true);
      // Tie the label2s content to the zindex of the model
      this.__controller.addTarget(this.__label2, "value", "zIndex", true);

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("10", this.__label2.getValue(), "Binding2 does not work!");

      // change one label
      this.__label1.setValue("100");

      // test for the binding
      this.assertEquals(100, this.__model.getZIndex(), "Reverse Binding does not work!");
      this.assertEquals("100", this.__label2.getValue(), "Binding2 does not work!");

      // change the other label
      this.__label2.setValue("200");

      // test for the binding
      this.assertEquals(200, this.__model.getZIndex(), "Reverse Binding does not work!");
      this.assertEquals("200", this.__label1.getValue(), "Binding1 does not work!");
    },


    testChangeModelBi: function() {
      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", true);
      this.__controller.addTarget(this.__label2, "value", "zIndex", true);

      // set an old zIndex
      this.__model.setZIndex(10);

      // create a new model with a different zIndex
      var newModel = new qx.ui.core.Widget();
      newModel.setZIndex(20);

      // set the new Model
      this.__controller.setModel(newModel);

      // test for the binding
      this.assertEquals("20", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("20", this.__label2.getValue(), "Binding2 does not work!");

      // set the zIndex in a label
      this.__label2.setValue("11");

      // test for the bindings (working and should not work)
      this.assertEquals("11", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals(11, newModel.getZIndex(), "Reverse-Binding does not work!");
      this.assertEquals(10, this.__model.getZIndex(), "Binding has not been removed.");

      newModel.dispose();
    },


    testConverting: function() {
      // create the options map
      var opt = {
        converter: function(value) {
          if (value > 10) {
            return "A";
          }
          return "B";
        }
      };

      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", false, opt);

      // set a zIndex and test it
      this.__model.setZIndex(11);
      this.assertEquals("A", this.__label1.getValue(), "Converter does not work!");

      // set a zIndex and test it
      this.__model.setZIndex(5);
      this.assertEquals("B", this.__label1.getValue(), "Converter does not work!");
    },



    testConvertingBi: function() {
      // create the options map for source to target
      var opt = {
        converter: function(value) {
          if (value > 10) {
            return "A";
          }
          return "B";
        }
      };

      // create the options map for target to source
      var revOpt = {
        converter: function(value) {
          if (value  == "A") {
            return 11;
          }
          return 10;
        }
      };

      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", true, opt, revOpt);

      // set a zIndex and test it
      this.__model.setZIndex(11);
      this.assertEquals("A", this.__label1.getValue(), "Converter does not work!");

      // set a zIndex and test it
      this.__model.setZIndex(5);
      this.assertEquals("B", this.__label1.getValue(), "Converter does not work!");

      // change the target and check the model
      this.__label1.setValue("A");
      this.assertEquals(11, this.__model.getZIndex(), "Back-Converter does not work!");
      this.__label1.setValue("B");
      this.assertEquals(10, this.__model.getZIndex(), "Back-Converter does not work!");
    },


    testChangeModelCon: function() {
      // create the options map
      var opt = {
        converter: function(value) {
          if (value > 10) {
            return "A";
          }
          return "B";
        }
      };

      // Tie the labels content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", false, opt);
      this.__controller.addTarget(this.__label2, "value", "zIndex", false, opt);

      // set an old zIndex
      this.__model.setZIndex(3);

      // create a new model with a different zIndex
      var newModel = new qx.ui.core.Widget();
      newModel.setZIndex(20);

      // set the new Model
      this.__controller.setModel(newModel);

      // test for the binding
      this.assertEquals("A", this.__label1.getValue(), "Binding1 does not work!");
      this.assertEquals("A", this.__label2.getValue(), "Binding2 does not work!");

      newModel.dispose();
    },


    testSetLateModel: function() {
      this.__controller.dispose();
      // create a blank controller
      this.__controller = new qx.data.controller.Object();

      // set the model
      this.__controller.setModel(this.__model);

      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding does not work!");
    },


    testSetModelNull: function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");

      this.__label1.setValue("test");

      // set the model of the controller to null and back
      this.__controller.setModel(null);

      // check if the values have been reseted
      this.assertNull(this.__label1.getValue());

      this.__controller.setModel(this.__model);

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding does not work!");
    },


    testCreateWithoutModel: function() {
      // create a new controller
      this.__controller.dispose();
      this.__controller = new qx.data.controller.Object();

      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex");

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      this.__controller.setModel(this.__model);

      // test for the binding
      this.assertEquals("10", this.__label1.getValue(), "Binding does not work!");
    },


    testTargetArrayBi : function() {
      var selectbox = new qx.ui.form.SelectBox();
      for (var i = 0; i < 10; i++) {
        selectbox.add(new qx.ui.form.ListItem("item " + i).set({model: i}));
      }

      this.__controller.addTarget(selectbox, "modelSelection[0]", "zIndex", true);

      // selectbox --> model
      selectbox.setSelection([selectbox.getSelectables()[6]]);
      this.assertEquals(6, this.__model.getZIndex());

      // model --> selectbox
      this.__model.setZIndex(3);
      this.assertEquals(3, selectbox.getSelection()[0].getModel());

      selectbox.dispose();
    },


    testDispose : function() {
      // Tie the label1s content to the zindex of the model
      this.__controller.addTarget(this.__label1, "value", "zIndex", true);

      // create a common startbase
      this.__label1.setZIndex(7);

      // dispose the controller to remove the bindings
      this.__controller.dispose();

      // set a new zIndex to the model
      this.__model.setZIndex(10);

      // test if the binding has been removed and reseted
      this.assertEquals(null, this.__label1.getValue(), "Binding does not work!");

      // set a new content
      this.__label1.setValue("20");

      // test the reverse binding
      this.assertEquals(10, this.__model.getZIndex(), "Reverse-Binding does not work!");
    }

  }
});