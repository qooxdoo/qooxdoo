/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @ignore(qx.test.data.singlevalue.Array_MultiBinding)
 */

/**
 * Test-Class for testing the single value binding
 */
qx.Class.define("qx.test.data.singlevalue.Array",
{
  extend : qx.dev.unit.TestCase,

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.data.singlevalue.Array_MultiBinding",
    {
      extend : qx.core.Object,

      construct : function() {
        this.setArray(new qx.data.Array(["one", "two", "three"]));
      },

      destruct : function() {
        this.getArray().dispose();
        var children = this.getChildren();
        if (children != null) {
          children.dispose();
        }
      },

      properties :
      {
        child : {
          check : "qx.test.data.singlevalue.Array_MultiBinding",
          event : "changeChild",
          nullable : true
        },

        children : {
          check : "qx.data.Array",
          event : "changeChildren",
          nullable: true,
          init : null
        },

        name : {
          check : "String",
          event : "changeName",
          nullable: true
        },

        array : {
          init : null,
          event: "changeArray"
        }
      }
    });
  },


  members :
  {
    __a: null,
    __b1: null,
    __b2: null,
    __label: null,

    setUp : function()
    {
      this.__a = new qx.test.data.singlevalue.Array_MultiBinding().set({
        name: "a",
        children: new qx.data.Array()
      });
      this.__b1 = new qx.test.data.singlevalue.Array_MultiBinding().set({
        name: "b1",
        children: new qx.data.Array()
      });
      this.__b2 = new qx.test.data.singlevalue.Array_MultiBinding().set({
        name: "b2",
        children: new qx.data.Array()
      });
      this.__label = new qx.test.data.singlevalue.TextFieldDummy();

      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();
    },


    tearDown : function()
    {
      this.__b1.dispose();
      this.__b2.dispose();
      this.__a.dispose();
      this.__label.dispose();
    },


    testChangeItem : function() {
      // bind the first element of the array
      qx.data.SingleValueBinding.bind(this.__a, "array[0]", this.__label, "value");

      // check the binding
      this.assertEquals("one", this.__label.getValue(), "Array[0] binding does not work!");
      // change the value
      this.__a.getArray().setItem(0, "ONE");
      this.assertEquals("ONE", this.__label.getValue(), "Array[0] binding does not work!");
    },


    testChangeArray: function() {
      // bind the first element of the array
      qx.data.SingleValueBinding.bind(this.__a, "array[0]", this.__label, "value");

      // change the array itself
      this.__a.getArray().dispose();
      this.__a.setArray(new qx.data.Array(1, 2, 3));
      qx.log.Logger.debug(this.__a.getArray().getItem(0));
      // check the binding
      this.assertEquals("1", this.__label.getValue(), "Changing the array does not work!");
    },


    testLast: function() {
      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "array[last]", this.__label, "value");
      // check the binding
      this.assertEquals("three", this.__label.getValue(), "Array[last] binding does not work!");

      // change the value
      this.__a.getArray().setItem(2,"THREE");
      this.assertEquals("THREE", this.__label.getValue(), "Array[last] binding does not work!");
    },


    testPushPop: function() {
      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "array[last]", this.__label, "value");
      // check the binding
      this.assertEquals("three", this.__label.getValue(), "Array[last] binding does not work!");

      // pop the last element
      this.__a.getArray().pop();
      // check the binding
      this.assertEquals("two", this.__label.getValue(), "Array[last] binding does not work!");

      // push a new element to the end
      this.__a.getArray().push("new");
      // check the binding
      this.assertEquals("new", this.__label.getValue(), "Array[last] binding does not work!");
    },


    testShiftUnshift: function() {
      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "array[0]", this.__label, "value");
      // check the binding
      this.assertEquals("one", this.__label.getValue(), "Array[last] binding does not work!");

      // pop the last element
      this.__a.getArray().shift();
      // check the binding
      this.assertEquals("two", this.__label.getValue(), "Array[last] binding does not work!");

      // push a new element to the end
      this.__a.getArray().unshift("new");
      // check the binding
      this.assertEquals("new", this.__label.getValue(), "Array[last] binding does not work!");
    },


    testChildArray: function() {
      // create the objects
      this.__a.setChild(this.__b1);
      this.__b1.getArray().dispose();
      this.__b1.setArray(new qx.data.Array("eins", "zwei", "drei"));
      this.__b2.getArray().dispose();
      this.__b2.setArray(new qx.data.Array("1", "2", "3"));

      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "child.array[0]", this.__label, "value");
      // check the binding
      this.assertEquals("eins", this.__label.getValue(), "child.array[0] binding does not work!");

      // change the child
      this.__a.setChild(this.__b2);
      // check the binding
      this.assertEquals("1", this.__label.getValue(), "child.array[0] binding does not work!");

      this.__b1.getArray().dispose();
      this.__b2.getArray().dispose();
    },


    testChildren: function() {
      // create the objects
      this.__a.getChildren().push(this.__b1);
      this.__a.getChildren().push(this.__b2);

      // bind the element
      qx.data.SingleValueBinding.bind(this.__a, "children[0].name", this.__label, "value");
      // check the binding
      this.assertEquals("b1", this.__label.getValue(), "children[0].name binding does not work!");

      // remove the first element
      this.__a.getChildren().shift();
      // check the binding
      this.assertEquals("b2", this.__label.getValue(), "children[0].name binding does not work!");

      // change the name of b2
      this.__b2.setName("AFFE");
      // check the binding
      this.assertEquals("AFFE", this.__label.getValue(), "children[0].name binding does not work!");
    },


    test2Arrays: function() {
      // create the objects
      this.__a.getChildren().push(this.__b1);
      this.__b1.getChildren().push(this.__b2);

      // bind the element
      qx.data.SingleValueBinding.bind(this.__a, "children[0].children[0].name", this.__label, "value");
      // check the binding
      this.assertEquals("b2", this.__label.getValue(), "children[0].children[0].name binding does not work!");

      // rename the last element
      this.__b2.setName("OHJE");
      // check the binding
      this.assertEquals("OHJE", this.__label.getValue(), "children[0].name binding does not work!");
    },


    testSplice: function() {
      // bind the first element
      qx.data.SingleValueBinding.bind(this.__a, "array[0]", this.__label, "value");

      // remove the first and add "eins" at position 0
      var array = this.__a.getArray().splice(0, 1, "eins");

      // check the binding
      this.assertEquals("eins", this.__label.getValue(), "Array[last] binding does not work!");

      array.dispose();
    },


    testWrongInput: function() {
      var a = this.__a;
      var label = this.__label;

      // bind a senseless value
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[affe]", label, "value");
      }, Error, null, "Affe not an array value.");

      // bind empty array
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[]", label, "value");
      }, Error, null, "'' not an array value.");

      // bind 2 arrays
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[0][0]", label, "value");
      }, Error, null, "array[][] not an array value.");

      // bind an float
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[1.5]", label, "value");
      }, Error, null, "1.5 not an array value.");

      // bind strange value
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[[affe]]", label, "value");
      }, Error, null, "'[[affe]]' not an array value.");

      // test map in array
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[{name: 'a'}]", label, "value");
      }, Error, null, "'[affe]' not an array value.");

      // test null in the array
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "array[null]", label, "value");
      }, Error, null, "'null' not an array value.");
    },


    testLateBinding: function() {
      // create the precondition
      this.__a.getArray().dispose();
      this.__a.setArray(new qx.data.Array());
      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "array[last]", this.__label, "value");

      // check the binding
      this.assertNull(this.__label.getValue(), "Late binding does not work!");

      // set a value and check it
      this.__a.getArray().push("1");
      this.assertEquals("1", this.__label.getValue(), "Late binding does not work!");

      // set another value and check it
      this.__a.getArray().push("2");
      this.assertEquals("2", this.__label.getValue(), "Late binding does not work!");
    },


    testRemoveArrayItem: function() {
      // bind the last element
      qx.data.SingleValueBinding.bind(this.__a, "array[last]", this.__label, "value");
      // check the binding
      this.assertEquals("three", this.__label.getValue(), "Array[last] binding does not work!");

      // pop all 3 elements
      this.__a.getArray().pop();
      this.__a.getArray().pop();
      this.__a.getArray().pop();

      // check the binding
      this.assertNull(this.__label.getValue(), "Array[last] binding does not work!");
    },


    testBidirectional: function() {
      // two way binding
      // model.name <-- bind --> model.child.array[0]

      // create model: model.child.array
      var model = new qx.test.data.singlevalue.Array_MultiBinding();
      model.setChild(new qx.test.data.singlevalue.Array_MultiBinding());

      // set up the two way binding
      model.bind("name", model, "child.array[0]");
      model.bind("child.array[0]", model, "name");

      // set the value of the textfield
      model.setName("affe");
      this.assertEquals("affe", model.getChild().getArray().getItem(0), "affe not set in the model array.");

      // set the value in the model
      model.getChild().getArray().setItem(0, "stadtaffe");
      this.assertEquals("stadtaffe", model.getName(), "stadtaffe not set in the model.");

      // set the models name to null
      model.setName(null);
      this.assertEquals(null, model.getChild().getArray().getItem(0), "model array not reseted to initial.");

      // set the model array item to null
      model.getChild().getArray().setItem(0, null);
      this.assertEquals(null, model.getName(), "model not reseted.");

      model.getChild().dispose();
      model.dispose();
    },


    testDirect : function()
    {
      // bind the first element of the array
      qx.data.SingleValueBinding.bind(this.__a.getArray(), "[0]", this.__label, "value");

      // check the binding
      this.assertEquals("one", this.__label.getValue(), "[0] binding does not work!");
      // change the value
      this.__a.getArray().setItem(0, "ONE");
      this.assertEquals("ONE", this.__label.getValue(), "[0] binding does not work!");
    },


    testDirectTarget : function()
    {
      this.__label.setValue("affe");
      // bind the first element of the array
      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a.getArray(), "[0]");

      // check the binding
      this.assertEquals("affe", this.__a.getArray().getItem(0), "[0] binding does not work!");
      // change the value
      this.__label.setValue("AFFE");
      this.assertEquals("AFFE", this.__a.getArray().getItem(0), "[0] binding does not work!");
    },


    testChildrenDirect : function()
    {
      // create the objects
      this.__a.getChildren().push(this.__b1);
      this.__a.getChildren().push(this.__b2);

      // bind the element
      qx.data.SingleValueBinding.bind(this.__a.getChildren(), "[0].name", this.__label, "value");
      // check the binding
      this.assertEquals("b1", this.__label.getValue(), "[0].name binding does not work!");

      // remove the first element
      this.__a.getChildren().shift();
      // check the binding
      this.assertEquals("b2", this.__label.getValue(), "[0].name binding does not work!");

      // change the name of b2
      this.__b2.setName("AFFE");
      // check the binding
      this.assertEquals("AFFE", this.__label.getValue(), "[0].name binding does not work!");
    },


    testTargetChildren : function() {
      // create the objects
      this.__a.getChildren().push(this.__b1);
      this.__a.getChildren().push(this.__b2);

      // bind the element
      this.__label.setValue("l");
      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a.getChildren(), "[0].name");
      // check the binding
      this.assertEquals("l", this.__a.getChildren().getItem(0).getName(), "[0].name binding does not work!");

      // remove the first element
      this.__a.getChildren().shift();
      // check the binding
      this.assertEquals("l", this.__a.getChildren().getItem(0).getName(), "[0].name binding does not work!");
    }

  }
});
