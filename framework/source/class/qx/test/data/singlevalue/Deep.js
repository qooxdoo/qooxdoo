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
 * Test-Class for testing the single value binding
 *
 * @ignore(qx.test.MultiBinding)
 */
qx.Class.define("qx.test.data.singlevalue.Deep",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],

  construct : function() {
    this.base(arguments);

    // define a test class
    qx.Class.define("qx.test.MultiBinding",
    {
      extend : qx.core.Object,

      properties :
      {
        child : {
          check : "qx.test.MultiBinding",
          event : "changeChild",
          nullable : true
        },

        childWithout : {
          check : "qx.test.MultiBinding",
          nullable : true
        },

        name : {
          check : "String",
          nullable: true,
          init : "Juhu",
          event : "changeName"
        },

        array : {
          init : null,
          event: "changeArray"
        },

        lab : {
          event: "changeLable"
        }
      },

      destruct : function()
      {
        if (this.getLab()) {
          this.getLab().dispose();
        }
        if (this.getArray()) {
          this.getArray().dispose();
        }
      }
    });
  },


  members :
  {
    __a : null,
    __b1 : null,
    __b2 : null,
    __label : null,

    setUp : function()
    {
      this.__a = new qx.test.MultiBinding().set({
        name: "a",
        lab: new qx.test.data.singlevalue.TextFieldDummy(""),
        array: new qx.data.Array(["one", "two", "three"])
      });
      this.__b1 = new qx.test.MultiBinding().set({
        name: "b1",
        lab: new qx.test.data.singlevalue.TextFieldDummy(""),
        array: new qx.data.Array(["one", "two", "three"])
      });
      this.__b2 = new qx.test.MultiBinding().set({
        name: "b2",
        lab: new qx.test.data.singlevalue.TextFieldDummy(""),
        array: new qx.data.Array(["one", "two", "three"])
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


    testConverterChainBroken : function() {
      var m = qx.data.marshal.Json.createModel({a: {a: 1}, b: 2});
      var called = 0;
      m.bind("a.a", m, "b", {converter : function(data) {
        called++;
        return 3;
      }});
      // check the init values
      this.assertEquals(1, called);
      this.assertEquals(3, m.getB());

      // set the binding leaf to null
      m.getA().setA(null);
      this.assertEquals(2, called);
      this.assertEquals(3, m.getB());

      // set the binding root to null
      m.setA(null);
      this.assertEquals(3, called);
      this.assertEquals(3, m.getB());

      m.dispose();
    },


    testConverterChainBrokenInitialNull : function() {
      var m = qx.data.marshal.Json.createModel({a: null});
      var t = qx.data.marshal.Json.createModel({a: null});

      var spy = this.spy(function() {
        return 123;
      });
      m.bind("a.b", t, "a", {converter : spy});

      this.assertCalledOnce(spy);
      this.assertCalledWith(spy, undefined, undefined, m, t);
      this.assertEquals(123, t.getA());

      m.dispose();
      t.dispose();
    },


    testDepthOf2: function() {
      // create a hierarchy
      // a --> b1
      this.__a.setChild(this.__b1);

      // create the binding
      // a --> b1 --> label
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");

      // just set the name of the second component
      this.__b1.setName("B1");
      this.assertEquals("B1", this.__label.getValue(), "Deep binding does not work with updating the first parameter.");
      // change the second component
      // a --> b2 --> label
      this.__a.setChild(this.__b2);
      this.assertEquals("b2", this.__label.getValue(), "Deep binding does not work with updating the first parameter.");
      // check for the null value
      // a --> null
      this.__a.setChild(null);
      this.assertNull(this.__label.getValue(), "Binding does not work with null.");
    },


    testDepthOf3: function(attribute) {
      // create a hierarchy
      var c1 = new qx.test.MultiBinding().set({
        name: "c1"
      });
      var c2 = new qx.test.MultiBinding().set({
        name: "c2"
      });

      // a --> b1 --> c1 --> label
      //       b2 --> c2
      this.__a.setChild(this.__b1);
      this.__b1.setChild(c1);
      this.__b2.setChild(c2);

      // create the binding
      qx.data.SingleValueBinding.bind(this.__a, "child.child.name", this.__label, "value");

      // just set the name of the last component
      c1.setName("C1");
      this.assertEquals("C1", this.__label.getValue(), "Deep binding does not work with updating the third parameter.");

      // change the middle child
      // a --> b2 --> c2 --> label
      this.__a.setChild(this.__b2);
      this.assertEquals("c2", this.__label.getValue(), "Deep binding does not work with updating the second parameter.");

      // set the middle child to null
      // a --> null
      this.__a.setChild(null);
      this.assertNull(this.__label.getValue(), "Deep binding does not work with first null child.");

      // set only two childs
      // a --> b1 --> null
      this.__b1.setChild(null);
      this.__a.setChild(this.__b1);
      this.assertNull(this.__label.getValue(), "Deep binding does not work with second null child.");

      // set the childs in a row
      // a --> b1 --> c1 --> label
      this.__b1.setChild(c1);
      this.assertEquals("C1", this.__label.getValue(), "Deep binding does not work with updating the third parameter.");
    },



    testDepthOf5: function(attribute) {
      // create a hierarchy
      var c = new qx.test.MultiBinding().set({
        name: "c"
      });
      var d = new qx.test.MultiBinding().set({
        name: "d"
      });
      var e = new qx.test.MultiBinding().set({
        name: "e"
      });

      // a --> b1 --> c --> d --> e --> label
      this.__a.setChild(this.__b1);
      this.__b1.setChild(c);
      c.setChild(d);
      d.setChild(e);

      // create the binding
      qx.data.SingleValueBinding.bind(this.__a, "child.child.child.child.name", this.__label, "value");

      // test if the binding did work
      this.assertEquals("e", this.__label.getValue(), "Deep binding does not work with updating the third parameter.");
    },


    testWrongDeep: function() {
      // create a hierarchy
      this.__a.setChild(this.__b1);

      var a = this.__a;
      var label = this.__label;

      // only in source version
      if (qx.core.Environment.get("qx.debug")) {
        // set a wrong first parameter in the chain
        this.assertException(function() {
          qx.data.SingleValueBinding.bind(a, "chiild.name", label, "value");
        }, qx.core.AssertionError, null, "Wrong property name.");

        // set a complete wrong chain
        this.assertException(function() {
          qx.data.SingleValueBinding.bind(a, "affe", label, "value");
        }, qx.core.AssertionError, null, "Wrong property name.");
      }
    },


    testSingle: function() {
      // set only one property in the chain
      qx.data.SingleValueBinding.bind(this.__a, "name", this.__label, "value");

      // chech the initial value
      this.assertEquals("a", this.__label.getValue(), "Single property names don't work!");
      // check the binding
      this.__a.setName("A");
      this.assertEquals("A", this.__label.getValue(), "Single property names don't work!");
    },


    testDebug: function(attribute) {
      // build the structure
      this.__a.setChild(this.__b1);
      // bind the stuff together
      var id = qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");

      // log this binding in the console
      qx.data.SingleValueBinding.showBindingInLog(this.__a, id);
    },


    testRemove: function() {
      // build the structure
      this.__a.setChild(this.__b1);
      // bind the stuff together
      var id = qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");

      // check the binding
      this.__b1.setName("A");
      this.assertEquals("A", this.__label.getValue(), "Single property names don't work!");

      // remove the binding
      qx.data.SingleValueBinding.removeBindingFromObject(this.__a, id);

      // check the binding again
      this.__a.setName("A2");
      this.assertEquals("A", this.__label.getValue(), "Removing does not work!");

      // smoke Test for the remove
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "value");

      qx.data.SingleValueBinding.removeAllBindings();

    },


    testArrayDeep: function() {
      this.__a.getArray().dispose();
      this.__a.setArray(new qx.data.Array([this.__b1]));
      this.__b1.setChild(this.__b2);
      this.__b2.setChild(this.__b1);

      qx.data.SingleValueBinding.bind(this.__a, "array[0].child.name", this.__label, "value");

      this.assertEquals("b2", this.__label.getValue(), "Deep binding does not work.");

      this.__a.getArray().pop();
      this.assertNull(this.__label.getValue(), "Deep binding does not work.");

      this.__a.getArray().push(this.__b2);
      this.assertEquals("b1", this.__label.getValue(), "Deep binding does not work.");

      this.__b1.setName("B1");
      this.assertEquals("B1", this.__label.getValue(), "Deep binding does not work.");
    },


    testDeepTarget: function() {
      qx.data.SingleValueBinding.bind(this.__a, "name", this.__b1, "lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },

    testDeepTarget2: function() {
      this.__b2.setChild(this.__b1);
      qx.data.SingleValueBinding.bind(this.__a, "name", this.__b2, "child.lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },

    testDeepTargetNull: function() {
      qx.data.SingleValueBinding.bind(this.__a, "name", this.__b2, "child.lab.value");

      this.assertEquals("", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },

    testDeepTargetArray: function() {
      this.__a.getArray().dispose();
      this.__a.setArray(new qx.data.Array([this.__b1]));

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__a, "array[0].lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },

    testDeepTargetArrayLast: function() {
      this.__a.getArray().dispose();
      this.__a.setArray(new qx.data.Array([this.__b1]));

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__a, "array[last].lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },


    testDeepTargetChange : function()
    {
      var oldLabel = this.__b1.getLab();
      var newLabel = new qx.test.data.singlevalue.TextFieldDummy("x");

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__b1, "lab.value");

      this.__b1.setLab(newLabel);
      this.assertEquals("a", this.__b1.getLab().getValue());

      this.__a.setName("l");
      this.assertEquals("a", oldLabel.getValue());
      this.assertEquals("l", this.__b1.getLab().getValue());

      newLabel.dispose();
      oldLabel.dispose();
    },


    testDeepTargetChangeConverter : function()
    {
      var oldLabel = this.__b1.getLab();
      var newLabel = new qx.test.data.singlevalue.TextFieldDummy("x");

      qx.data.SingleValueBinding.bind(
        this.__a, "name", this.__b1, "lab.value",
        {converter : function(data) {return data + "...";}}
      );

      this.__b1.setLab(newLabel);
      this.assertEquals("a...", this.__b1.getLab().getValue());

      this.__a.setName("l");
      this.assertEquals("a...", oldLabel.getValue());
      this.assertEquals("l...", this.__b1.getLab().getValue());

      newLabel.dispose();
      oldLabel.dispose();
    },


    testDeepTargetChange3 : function()
    {
      // set up the target chain
      this.__a.setChild(this.__b1);
      this.__b1.setChild(this.__b2);
      this.__b2.setChild(this.__b1);

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "child.child.lab.value");

      // check the default set
      this.__label.setValue("123");
      this.assertEquals("123", this.__b2.getLab().getValue());

      // change the child of __a
      this.__a.setChild(this.__b2);
      this.assertEquals("123", this.__b1.getLab().getValue());

      // set another label value
      this.__label.setValue("456");
      this.assertEquals("123", this.__b2.getLab().getValue());
      this.assertEquals("456", this.__b1.getLab().getValue());
    },


    testDeepTargetChange3Remove : function()
    {
      // set up the target chain
      this.__a.setChild(this.__b1);
      this.__b1.setChild(this.__b2);
      this.__b2.setChild(this.__b1);

      var id = qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "child.child.lab.value");

      // check the default set
      this.__label.setValue("123");
      this.assertEquals("123", this.__b2.getLab().getValue(), "0");

      qx.data.SingleValueBinding.removeBindingFromObject(this.__label, id);

      // change the child of __a
      this.__a.setChild(this.__b2);
      this.assertEquals("", this.__b1.getLab().getValue(), "listener still there");

      // set another label value
      this.__label.setValue("456");
      this.assertEquals("123", this.__b2.getLab().getValue(), "1");
      this.assertEquals("", this.__b1.getLab().getValue(), "2");
    },


    testDeepTargetChangeArray : function()
    {
      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a,"array[0]");

      this.__label.setValue("123");
      this.assertEquals("123", this.__a.getArray().getItem(0));

      var newArray = new qx.data.Array([0, 1, 0]);
      var oldArray = this.__a.getArray();
      this.__a.setArray(newArray);
      this.assertEquals("123", this.__a.getArray().getItem(0), "initial set");

      this.__label.setValue("456");
      this.assertEquals("456", newArray.getItem(0));
      this.assertEquals("123", oldArray.getItem(0));

      oldArray.dispose();
      newArray.dispose();
    },


    testDeepTargetChangeArrayLast : function()
    {
      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a,"array[last]");

      this.__label.setValue("123");
      this.assertEquals("123", this.__a.getArray().getItem(2));

      var newArray = new qx.data.Array([0, 1, 0]);
      var oldArray = this.__a.getArray();
      this.__a.setArray(newArray);
      this.assertEquals("123", this.__a.getArray().getItem(2), "initial set");

      this.__label.setValue("456");
      this.assertEquals("456", newArray.getItem(2));
      this.assertEquals("123", oldArray.getItem(2));

      oldArray.dispose();
      newArray.dispose();
    },


    testDeepTargetChange3Array : function()
    {
      // set up the target chain
      this.__a.setChild(this.__b1);
      this.__b1.setChild(this.__b2);
      this.__b2.setChild(this.__b1);

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "child.child.array[0]");

      // check the default set
      this.__label.setValue("123");
      this.assertEquals("123", this.__b2.getArray().getItem(0));

      // change the child of __a
      this.__a.setChild(this.__b2);
      this.assertEquals("123", this.__b1.getArray().getItem(0));

      // set another label value
      this.__label.setValue("456");
      this.assertEquals("456", this.__b1.getArray().getItem(0));
      this.assertEquals("123", this.__b2.getArray().getItem(0), "binding still exists");
    },


    testDeepTargetChangeMiddleArray : function()
    {
      var oldArray = this.__a.getArray();
      var array = new qx.data.Array([this.__b1, this.__b2]);
      this.__a.setArray(array);
      oldArray.dispose();

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "array[0].lab.value");

      this.__label.setValue("123");
      this.assertEquals("123", this.__b1.getLab().getValue());

      array.reverse();
      this.assertEquals("123", this.__b2.getLab().getValue());

      this.__label.setValue("456");
      this.assertEquals("456", this.__b2.getLab().getValue());
      this.assertEquals("123", this.__b1.getLab().getValue());
    },


    testDeepTargetChangeMiddleArrayLast : function()
    {
      var oldArray = this.__a.getArray();
      var array = new qx.data.Array([this.__b2, this.__b1]);
      this.__a.setArray(array);
      oldArray.dispose();

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "array[last].lab.value");

      this.__label.setValue("123");
      this.assertEquals("123", this.__b1.getLab().getValue());

      array.reverse();
      this.assertEquals("123", this.__b2.getLab().getValue());

      this.__label.setValue("456");
      this.assertEquals("456", this.__b2.getLab().getValue());
      this.assertEquals("123", this.__b1.getLab().getValue());
    },


    testDeepTargetChangeWithoutEvent : function()
    {
      this.__a.setChildWithout(this.__b1);

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "childWithout.name");

      this.__label.setValue("123");
      this.assertEquals("123", this.__b1.getName());

      this.__a.setChildWithout(this.__b2);
      this.assertEquals("b2", this.__b2.getName());

      this.__label.setValue("456");
      this.assertEquals("456", this.__b2.getName());
      this.assertEquals("123", this.__b1.getName());
    },


    testDeepTargetChangeWithoutEvent3 : function()
    {
      this.__a.setChild(this.__b1);
      this.__b1.setChildWithout(this.__b2);
      this.__b2.setChildWithout(this.__b1);

      qx.data.SingleValueBinding.bind(this.__label, "value", this.__a, "child.childWithout.name");

      this.__label.setValue("123");
      this.assertEquals("123", this.__b2.getName());

      this.__a.setChild(this.__b2);
      this.assertEquals("123", this.__b1.getName());

      this.__b2.setChildWithout(this.__a);
      this.assertEquals("a", this.__a.getName());

      this.__label.setValue("456");
      this.assertEquals("456", this.__a.getName());
      this.assertEquals("123", this.__b1.getName());
    },


    testDeepTargetChange3ResetNotNull : function()
    {
      // set up the target chain
      this.__a.setChild(this.__b1);
      this.__b1.setChild(this.__b2);
      this.__b2.setChild(this.__b1);

      this.__a.setName(null);

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__a, "child.child.name");
      this.assertEquals(this.__a.getName(), this.__b2.getName());

      this.__a.setName("nnnnn");
      this.assertEquals(this.__a.getName(), this.__b2.getName());

      this.__a.setName(null);
      this.assertEquals(this.__a.getName(), this.__b2.getName());
    },


    /**
     * Remove a deep binding that has a class in its binding that does not have a property in the chain.
     */
    testRemoveIncompleteBinding : function () {
      var source = qx.data.marshal.Json.createModel({a: null});
      var a = qx.data.marshal.Json.createModel({}); // a class that does not contain a property with name "b"
      var target = qx.data.marshal.Json.createModel({result: null});

      try {
        source.bind('a.b', target, 'result');
        source.setA(a);
        source.removeAllBindings();
      } catch (e) {
        this.error(e);
        this.assertTrue(false, e.message);
      }

      source = qx.data.marshal.Json.createModel({a: null});
      source.setA(a);

      try {
        source.bind('a.b', target, 'result');
        source.removeAllBindings();
      } catch (e) {
        this.error(e);
        this.assertTrue(false, e.message);
      }
    }

  }
});
