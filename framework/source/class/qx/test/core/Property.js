/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @ignore(qx.Node, qx.test.A, qx.test.B, qx.test.clName, qx.test.IForm)
 * @ignore(qx.TestProperty, qx.Super)
 */

qx.Class.define("qx.test.core.Property",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testBasic : function()
    {
      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.core.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Public setter/getter etc.
      this.assertFunction(inst.setPublicProp, "public setter");
      this.assertFunction(inst.getPublicProp, "public getter");
      this.assertFunction(inst.resetPublicProp, "public reset");
      this.assertUndefined(inst.togglePublicProp, "public toggler");
      this.assertUndefined(inst.setThemedPublicProp, "public themed");

      // Boolean property
      this.assertFunction(inst.toggleBooleanProp, "boolean toggler");
      inst.dispose();
    },


    testBuiltinTypes : function()
    {
      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.core.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Type checks: String
      this.assertIdentical("Hello", inst.setStringProp("Hello"), "string property, set");
      this.assertIdentical("Hello", inst.getStringProp(), "string property, get");

      // Type checks: Boolean, true
      this.assertIdentical(true, inst.setBooleanProp(true), "boolean property, set");
      this.assertIdentical(true, inst.getBooleanProp(), "boolean property, get");

      // Type checks: Boolean, false
      this.assertIdentical(false, inst.setBooleanProp(false), "boolean property, set");
      this.assertIdentical(false, inst.getBooleanProp(), "boolean property, get");

      // Type checks: Number, int
      this.assertIdentical(3, inst.setNumberProp(3), "number property, set");
      this.assertIdentical(3, inst.getNumberProp(), "number property, get");

      // Type checks: Number, float
      this.assertIdentical(3.14, inst.setNumberProp(3.14), "number property, set");
      this.assertIdentical(3.14, inst.getNumberProp(), "number property, get");

      // Type checks: Object, inline
      var obj = {};
      this.assertIdentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Object, new
      var obj = new Object;
      this.assertIdentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Array, inline
      var arr = [];
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      // Type checks: Array, new
      var arr = new Array;
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      inst.dispose();
    },


    testInheritance : function()
    {
      this.assertNotUndefined(qx.core.Property);

      var pa = new qx.test.core.InheritanceDummy();
      var ch1 = new qx.test.core.InheritanceDummy();
      var ch2 = new qx.test.core.InheritanceDummy();
      var ch3 = new qx.test.core.InheritanceDummy();
      var chh1 = new qx.test.core.InheritanceDummy();
      var chh2 = new qx.test.core.InheritanceDummy();
      var chh3 = new qx.test.core.InheritanceDummy();

      pa.add(ch1);
      pa.add(ch2);
      pa.add(ch3);
      ch2.add(chh1);
      ch2.add(chh2);
      ch2.add(chh3);

      // Simple: Only inheritance, no local values
      this.assertTrue(pa.setEnabled(true), "a1");
      this.assertTrue(pa.getEnabled(), "a2");
      this.assertTrue(ch1.getEnabled(), "a3");
      this.assertTrue(ch2.getEnabled(), "a4");
      this.assertTrue(ch3.getEnabled(), "a5");
      this.assertTrue(chh1.getEnabled(), "a6");
      this.assertTrue(chh2.getEnabled(), "a7");
      this.assertTrue(chh3.getEnabled(), "a8");

      // Enabling local value
      this.assertFalse(ch2.setEnabled(false), "b1");
      this.assertFalse(ch2.getEnabled(), "b2");
      this.assertFalse(chh1.getEnabled(), "b3");
      this.assertFalse(chh2.getEnabled(), "b4");
      this.assertFalse(chh3.getEnabled(), "b5");

      // Reset local value
      ch2.resetEnabled();
      this.assertTrue(ch2.getEnabled(), "c2");
      this.assertTrue(chh1.getEnabled(), "c3");
      this.assertTrue(chh2.getEnabled(), "c4");
      this.assertTrue(chh3.getEnabled(), "c5");

      pa.dispose();
      ch1.dispose();
      ch2.dispose();
      ch3.dispose();
      chh1.dispose();
      chh2.dispose();
      chh3.dispose();
    },


    testParent : function()
    {
      var pa = new qx.test.core.InheritanceDummy();
      var ch1 = new qx.test.core.InheritanceDummy();
      var ch2 = new qx.test.core.InheritanceDummy();
      var ch3 = new qx.test.core.InheritanceDummy();

      this.assertIdentical(pa.getEnabled(), null, "d1");
      this.assertIdentical(ch1.getEnabled(), null, "d2");
      this.assertIdentical(ch2.getEnabled(), null, "d3");
      this.assertIdentical(ch3.getEnabled(), null, "d4");

      pa.add(ch1);

      this.assertTrue(pa.setEnabled(true), "a1");  // ch1 gets enabled, too
      this.assertFalse(ch3.setEnabled(false), "a2");

      this.assertTrue(pa.getEnabled(), "b1");
      this.assertTrue(ch1.getEnabled(), "b2");
      this.assertIdentical(ch2.getEnabled(), null, "b3");
      this.assertFalse(ch3.getEnabled(), "b4");

      pa.add(ch2);  // make ch2 enabled_ through inheritance
      pa.add(ch3);  // keep ch2 disabled, user value has higher priority

      this.assertTrue(pa.getEnabled(), "c1");
      this.assertTrue(ch1.getEnabled(), "c2");
      this.assertTrue(ch2.getEnabled(), "c3");
      this.assertFalse(ch3.getEnabled(), "c4");

      pa.dispose();
      ch1.dispose();
      ch2.dispose();
      ch3.dispose();
    },


    testMultiValues : function()
    {
      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.core.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Check init value
      this.assertIdentical(inst.getInitProp(), "foo", "a1");
      this.assertIdentical(inst.setInitProp("hello"), "hello", "a2");
      this.assertIdentical(inst.getInitProp(), "hello", "a3");
      this.assertIdentical(inst.resetInitProp(), undefined, "a4");
      this.assertIdentical(inst.getInitProp(), "foo", "a5");

      // Check null value
      this.assertIdentical(inst.getNullProp(), "bar", "b1");
      this.assertIdentical(inst.setNullProp("hello"), "hello", "b2");
      this.assertIdentical(inst.getNullProp(), "hello", "b3");
      this.assertIdentical(inst.setNullProp(null), null, "b4");
      this.assertIdentical(inst.getNullProp(), null, "b5");
      this.assertIdentical(inst.resetNullProp(), undefined, "b6");
      this.assertIdentical(inst.getNullProp(), "bar", "b7");

      // Check appearance value
      this.assertIdentical(inst.setThemedAppearanceProp("black"), "black", "c1");
      this.assertIdentical(inst.getAppearanceProp(), "black", "c2");
      this.assertIdentical(inst.setAppearanceProp("white"), "white", "c3");
      this.assertIdentical(inst.getAppearanceProp(), "white", "c4");
      this.assertIdentical(inst.resetAppearanceProp(), undefined, "c5");
      this.assertIdentical(inst.getAppearanceProp(), "black", "c6");

      // No prop
      this.assertIdentical(inst.getNoProp(), null, "c1");

      inst.dispose();
    },


    testInitApply : function()
    {
      var inst = new qx.test.core.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      this.assertUndefined(inst.lastApply);
      inst.setInitApplyProp1("juhu"); //set to init value
      this.assertJsonEquals(["juhu", "juhu"], inst.lastApply);
      inst.lastApply = undefined;

      inst.setInitApplyProp1("juhu"); // set to same value
      this.assertUndefined(inst.lastApply); // apply must not be called
      inst.lastApply = undefined;

      inst.setInitApplyProp1("kinners"); // set to new value
      this.assertJsonEquals(["kinners", "juhu"], inst.lastApply);
      inst.lastApply = undefined;

      this.assertUndefined(inst.lastApply);
      inst.setInitApplyProp2(null); //set to init value
      this.assertJsonEquals([null, null], inst.lastApply);
      inst.lastApply = undefined;

      inst.dispose();
    },


    testInit : function()
    {
      // now test the init functions
      var self = this;
      var inst = new qx.test.core.PropertyHelper(function(inst) {

        inst.initInitApplyProp1();
        self.assertJsonEquals(["juhu", null], inst.lastApply);
        inst.lastApply = undefined;

        inst.initInitApplyProp2();
        self.assertJsonEquals([null, null], inst.lastApply);
        inst.lastApply = undefined;
      });
      this.assertNotUndefined(inst, "instance");
      inst.dispose();
    },

    testDefinesThanSubClassWithInterface : function()
    {
      // see bug #2162 for details
      delete qx.test.A;
      delete qx.test.B;
      delete qx.test.IForm;

      qx.Class.define("qx.test.A",
      {
        extend : qx.core.Object,

        properties : {
          enabled : {}
        }
      });

      var a = new qx.test.A();

      qx.Interface.define("qx.test.IForm",
      {
        members : {
          setEnabled : function(value) {}
        }
      });

      qx.Class.define("qx.test.B",
      {
        extend : qx.test.A,
        implement : qx.test.IForm
      });

      var b = new qx.test.B();
      b.setEnabled(true);
      a.dispose();
      b.dispose();
    },


    testPropertyNamedClassname : function()
    {
      qx.Class.define("qx.test.clName", {
        extend : qx.core.Object,
        properties : {
          classname : {}
        }
      });

      delete qx.test.clName;
    },


    testWrongPropertyDefinitions : function()
    {
      if (qx.core.Environment.get("qx.debug")) {

        // class config maps must be separately defined to not produce compiler errors

        // date
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : new Date()
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;

        // array
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : [1,2,3]
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;

        // qooxdoo class
        var o = new qx.core.Object();
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : o
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
        o.dispose();

        // RegExp
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : new RegExp()
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;

        // null
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : null
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;

        // boolean
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : true
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;

        // number
        this.assertException(function() {
          var config = {
            extend : qx.core.Object,
            properties : 123
          };
          qx.Class.define("qx.test.clName", config);
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
      }
    },

    testRecursive : function()
    {
      qx.Class.define("qx.Node",
      {
        extend : qx.core.Object,

        construct : function() {
          this._min = 0;
        },

        properties :
        {
          value : { apply : "applyValue" }
        },

        members :
        {

          applyValue: function(value, old) {
            if (value < this._min) {
              this.setValue(this._min);
            }
          }
        }
      });

      var root = new qx.Node();

      root.setValue(100);
      this.assertEquals(100, root.getValue());

      root.setValue(-100);
      this.assertEquals(0, root.getValue());
      root.dispose();

    },


    testEventWithInitOldData: function()
    {
      qx.Class.define("qx.TestProperty",
      {
        extend : qx.core.Object,

        properties :
        {
          prop : {
            check : "Boolean",
            init : false,
            event : "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertFalse(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertFalse(e.getOldData(), "Wrong old data in the event!");
      }, "Change event not fired!");

      object.dispose();
    },


    testEventWithoutInitOldData: function()
    {
      qx.Class.define("qx.TestProperty",
      {
        extend : qx.core.Object,

        properties :
        {
          prop : {
            check : "Boolean",
            nullable : true,
            event : "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertNull(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertNull(e.getOldData(), "Wrong old data in the event!");
      }, "Change event not fired!");

      object.dispose();
    },


    testEventWithInitAndInheritableOldData: function()
    {
      qx.Class.define("qx.TestProperty",
      {
        extend : qx.core.Object,

        properties :
        {
          prop : {
            check : "Boolean",
            init : false,
            inheritable : true,
            event : "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertFalse(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertFalse(e.getOldData(), "Wrong old data in the event!");
      }, "Change event not fired!");

      object.dispose();
    },


    testEventWithoutInitAndInheritableOldData: function()
    {
      qx.Class.define("qx.TestProperty",
      {
        extend : qx.core.Object,

        properties :
        {
          prop : {
            check : "Boolean",
            nullable : true,
            inheritable : true,
            event : "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertNull(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertNull(e.getOldData(), "Wrong old data in the event!");
      }, "Change event not fired!");

      object.dispose();
    },


    /*
    ---------------------------------------------------------------------------
       IS-EQUAL OVERRIDE TEST
    ---------------------------------------------------------------------------
    */

    /**
     * Check whether the (numeric) value is negative zero (-0)
     *
     * @param value {number} Value to check
     * @return {Boolean} whether the value is <code>-0</code>
     */
    __isNegativeZero : function (value) {
      return value===0 && (1/value < 0); // 1/-0 => -Infinity
    },


    /**
     * Check whether the (numeric) value is positive zero (+0)
     *
     * @param value {number} Value to check
     * @return {Boolean} whether the value is <code>+0</code>
     */
    __isPositiveZero : function (value) {
      return value===0 && (1/value > 0); // 1/+0 => +Infinity
    },


    testWrongIsEqualDefinitions : function ()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var re = new RegExp("Invalid type for 'isEqual'.*");
        var o = new qx.core.Object();

        [
          new Date(),   // date
          [1,2,3],      // array
          {},           // object
          o,            // qooxdoo class
          new RegExp(), // RegExp
          null,         // null
          true, false,  // boolean
          123           // number
        ].forEach(function (isEqualTestValue, i) {

          var msg = "case[" + i + "] (" + String(isEqualTestValue) + ")";
          this.assertException(function ()
          {
            qx.Class.define("qx.TestProperty", {
              extend : qx.core.Object,
              properties : {
                prop : {
                  check : "Number",
                  isEqual : isEqualTestValue
                }
              }
            });
            new qx.TestProperty().set({prop: 0});
          }, Error, re, msg);

          delete qx.TestProperty;
        }, this);

        o.dispose();

      } // end-if (qx.core.Environment.get("qx.debug"))

    },


    testIsEqualInline : function ()
    {
      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : "Object.is(a, b)"
          }
        }
      });

      var object = new qx.TestProperty();
      object.setProp(0); // initialize with +0

      //
      // check for the event
      //
      var self = this;

      // No change expected
      this.assertEventNotFired(object, "changeProp", function () {
        object.setProp(0);
        object.setProp(+0);
      }, function (e) {}, "'changeProp' event fired!");

      // Change expected
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(-0);
      }, function (e) {
        var isNegativeZero = self.__isNegativeZero( e.getData() );
        var isPositiveZero = self.__isPositiveZero( e.getOldData() );
        self.assertTrue(isNegativeZero, "Wrong data in the event!");
        self.assertTrue(isPositiveZero, "Wrong old data in the event!");
      }, "Change event not fired!");

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },


    testIsEqualFunction : function ()
    {
      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : function (x,y) { return Object.is(x, y); }
          }
        }
      });

      var object = new qx.TestProperty();
      object.setProp(0); // initialize with +0

      //
      // check for the event
      //
      var self = this;

      // No change expected
      this.assertEventNotFired(object, "changeProp", function () {
        object.setProp(0);
        object.setProp(+0);
      }, function (e) {}, "'changeProp' event fired!");

      // Change expected
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(-0);
      }, function (e) {
        var isNegativeZero = self.__isNegativeZero( e.getData() );
        var isPositiveZero = self.__isPositiveZero( e.getOldData() );
        self.assertTrue(isNegativeZero, "Wrong data in the event!");
        self.assertTrue(isPositiveZero, "Wrong old data in the event!");
      }, "Change event not fired!");

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },


    testIsEqualMember : function ()
    {
      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : "__fooBar"
          }
        },
        members : {
          __fooBar : function (foo, bar) {
            return Object.is(foo, bar);
          }
        }
      });

      var object = new qx.TestProperty();
      object.setProp(0); // initialize with +0

      //
      // check for the event
      //
      var self = this;

      // No change expected
      this.assertEventNotFired(object, "changeProp", function () {
        object.setProp(0);
        object.setProp(+0);
      }, function (e) {}, "'changeProp' event fired!");

      // Change expected
      this.assertEventFired(object, "changeProp", function () {
        object.setProp(-0);
      }, function (e) {
        var isNegativeZero = self.__isNegativeZero( e.getData() );
        var isPositiveZero = self.__isPositiveZero( e.getOldData() );
        self.assertTrue(isNegativeZero, "Wrong data in the event!");
        self.assertTrue(isPositiveZero, "Wrong old data in the event!");
      }, "Change event not fired!");

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },


    testIsEqualInlineContext : function ()
    {
      var context, object;

      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : "(this.__checkCtx(a,b))"
          }
        },
        members : {
          __checkCtx : function (foo, bar) {
            context = this;
          }
        }
      });

      object = new qx.TestProperty().set({prop: 4711});

      this.assertIdentical(object, context);

      object.dispose();
    },


    testIsEqualFunctionContext : function ()
    {
      var context, object;

      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : function (x, y) {
              context = this;
            }
          }
        }
      });

      object = new qx.TestProperty().set({prop: 4711});

      this.assertIdentical(object, context);

      object.dispose();
    },


    testIsEqualMemberContext : function ()
    {
      var context, object;

      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : "__checkCtx"
          }
        },
        members : {
          __checkCtx : function (foo, bar) {
            context = this;
          }
        }
      });

      object = new qx.TestProperty().set({prop: 4711});

      this.assertIdentical(object, context);

      object.dispose();
    },


    testIsEqualBaseClassMember : function ()
    {
      var context, object;

      qx.Class.define("qx.Super", {
        extend : qx.core.Object,
        members : {
          __checkCtx : function (foo, bar) {
            context = this;
          }
        }
      });
      qx.Class.define("qx.TestProperty", {
        extend: qx.Super,
        properties : {
          prop : {
            check : "Number",
            nullable : true,
            event : "changeProp",
            isEqual : "__checkCtx"
          }
        }
      });

      object = new qx.TestProperty().set({prop: 4711});

      this.assertIdentical(object, context);

      object.dispose();
    },


    testTransform : function ()
    {
      qx.Class.define("qx.TestProperty", {
        extend : qx.core.Object,
        construct: function() {
          this.base(arguments);
          this.initPropTwo(new qx.data.Array());
        },
        properties : {
          prop : {
            check : "qx.data.Array",
            nullable : true,
            event : "changeProp",
            transform : "__transform"
          },
          propTwo : {
            check : "qx.data.Array",
            nullable : true,
            event : "changePropTwo",
            transform : "__transform",
            deferredInit: true
          }
        },
        members : {
          __transform : function (value, oldValue) {
            if (oldValue === undefined)
              return value;
            if (!value)
              oldValue.removeAll();
            else
              oldValue.replace(value)
            return oldValue;
          }
        }
      });

      var object = new qx.TestProperty();
      var arr = new qx.data.Array();
      object.setProp(arr);
      this.assertIdentical(arr, object.getProp());
      arr.push("1");

      var arr2 = new qx.data.Array();
      arr2.push("2");
      arr2.push("3");

      object.setProp(arr2);
      this.assertIdentical(arr, object.getProp());
      this.assertArrayEquals([ "2", "3" ], arr.toArray());


      var savePropTwo = object.getPropTwo();
      object.setPropTwo(arr2);
      this.assertIdentical(savePropTwo, object.getPropTwo());
      this.assertArrayEquals([ "2", "3" ], savePropTwo.toArray());
    }


  }
});
