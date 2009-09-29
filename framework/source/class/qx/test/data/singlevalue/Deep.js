/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Test-Class for testing the single value binding
 */
qx.Class.define("qx.test.data.singlevalue.Deep",
{
  extend : qx.dev.unit.TestCase,

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

        name : {
          check : "String",
          init : "Juhu",
          event : "changeName"
        },

        array : {
          init : new qx.data.Array(["one", "two", "three"]),
          event: "changeArray"
        },

        lab : {
          event: "changeLable"
        }
      }
    });
  },


  members :
  {

    setUp : function()
    {
      this.__a = new qx.test.MultiBinding().set({
        name: "a",
        lab: new qx.ui.basic.Label("")
      });
      this.__b1 = new qx.test.MultiBinding().set({
        name: "b1",
        lab: new qx.ui.basic.Label("")
      });
      this.__b2 = new qx.test.MultiBinding().set({
        name: "b2",
        lab: new qx.ui.basic.Label("")
      });
      this.__label = new qx.ui.basic.Label();

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
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // set a wrong first parameter in the chain
        this.assertException(function() {
          qx.data.SingleValueBinding.bind(a, "chiild.name", label, "value");
        }, qx.core.AssertionError, null, "Wrong property name.");

        // set a wrong second parameter in the chain
        this.assertException(function() {
          qx.data.SingleValueBinding.bind(a, "child.naame", label, "value");
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
      this.assertEquals("a", this.__label.getValue(), "Single property names dont work!");
      // check the binding
      this.__a.setName("A");
      this.assertEquals("A", this.__label.getValue(), "Single property names dont work!");
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
      this.assertEquals("A", this.__label.getValue(), "Single property names dont work!");

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
      this.__a.setArray(new qx.data.Array([this.__b1]));

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__a, "array[0].lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
    },

    testDeepTargetArrayLast: function() {
      this.__a.setArray(new qx.data.Array([this.__b1]));

      qx.data.SingleValueBinding.bind(this.__a, "name", this.__a, "array[last].lab.value");

      this.assertEquals("a", this.__b1.getLab().getValue(), "Deep binding on the target does not work.");
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
    }

  }
});