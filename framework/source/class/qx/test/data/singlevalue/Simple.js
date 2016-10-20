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
 * @ignore(qx.test.SVB)
 * @ignore(qx.test.TwoProperties)
 * @ignore(qx.Target)
 * @ignore(qx.Test)
 */
qx.Class.define("qx.test.data.singlevalue.Simple",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MRequirements,

  members :
  {
    __a : null,
    __b: null,

    setUp : function() {
      // create the widgets
      this.__a = new qx.test.data.singlevalue.TextFieldDummy();
      this.__b = new qx.test.data.singlevalue.TextFieldDummy();
    },

    tearDown : function() {
      qx.data.SingleValueBinding.removeAllBindingsForObject(this.__a);
      qx.data.SingleValueBinding.removeAllBindingsForObject(this.__b);
      this.__a.dispose();
      this.__b.dispose();
    },

    testStringPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      this.__a.setAppearance("affe");
      this.assertEquals("affe", this.__b.getAppearance(), "String binding does not work!");

      var affe = new qx.test.data.singlevalue.TextFieldDummy();
      affe.setAppearance("Jonny");
      qx.data.SingleValueBinding.bind(affe, "appearance", this.__b, "appearance");
      this.assertEquals("Jonny", this.__b.getAppearance(), "String binding does not work!");
      qx.data.SingleValueBinding.removeAllBindingsForObject(affe);
      affe.dispose();
    },


    testBooleanPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bind(this.__a, "enabled", this.__b, "enabled");
      this.__a.setEnabled(false);
      this.assertFalse(this.__b.getEnabled(), "Boolean binding does not work!");
    },


    testNumberPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      this.__a.setZIndex(2456);
      this.assertEquals(2456, this.__b.getZIndex(), "Number binding does not work!");
    },


    testColorPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bind(this.__a, "backgroundColor", this.__b, "backgroundColor");
      this.__a.setBackgroundColor("red");
      this.assertEquals("red", this.__b.getBackgroundColor(), "Color binding does not work!");
    },


    testWrongPropertyNames : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        var a = this.__a;
        var b = this.__b;

        // only in source version
        if (qx.core.Environment.get("qx.debug")) {
          // wrong source
          this.assertException(function() {
            qx.data.SingleValueBinding.bind(a, "BacccccckgroundColor", b, "backgroundColor");
          }, qx.core.AssertionError, null, "Not a wrong property name? (source)");
        }
      }
    },


    testWrongEventType : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        var a = this.__a;
        var b = this.__b;

        // only in source version
        if (qx.core.Environment.get("qx.debug")) {
          // wrong eventName
          this.assertException(function() {
            qx.data.SingleValueBinding.bind(a, "affe", b, "backgroundColor");
          }, null, null, "Not a wrong event name? (source)");
        }
      }
    },


    testDefaultConversion : function()
    {
      // String to number
      this.__a.setAppearance("0");
      qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "zIndex");
      this.__a.setAppearance("4879");
      this.assertEquals(4879, this.__b.getZIndex(), "String --> Number does not work!");

      // number to String
      this.__a.setZIndex(568);
      qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "appearance");
      this.__a.setZIndex(1234);
      this.assertEquals("1234", this.__b.getAppearance(), "Number --> String does not work!");

      // boolean to string
      qx.data.SingleValueBinding.bind(this.__a, "enabled", this.__b, "appearance");
      this.__a.setEnabled(true);
      this.assertEquals("true", this.__b.getAppearance(), "Boolean --> String does not work!");

      // string to float
      var s = new qx.test.data.singlevalue.TextFieldDummy();
      s.setFloatt(0);

      qx.data.SingleValueBinding.bind(s, "floatt", this.__b, "appearance");
      s.setFloatt(13.5);
      this.assertEquals("13.5", this.__b.getAppearance(), "Float --> String does not work!");

      qx.data.SingleValueBinding.removeAllBindingsForObject(s);
      s.dispose();
    },


    testRemoveBinding: function(){
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();
      // add a binding
      var id = qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      // set and chech the name
      this.__a.setAppearance("hans");
      this.assertEquals("hans", this.__b.getAppearance(), "String binding does not work!");

      // remove the binding
      qx.data.SingleValueBinding.removeBindingFromObject(this.__a, id);
      // set and chech the name
      this.__a.setAppearance("hans2");
      this.assertEquals("hans", this.__b.getAppearance(), "Did not remove the binding!");

      // test if the binding is not listed anymore
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(0, bindings.length, "Binding still in the registry!");

      // only in source version
      if (qx.core.Environment.get("qx.debug")) {
        // test wrong binding id
        var a = this.__a;
        this.assertException(function() {
          qx.data.SingleValueBinding.removeBindingFromObject(a, null);
        }, Error, null, "No exception thrown.");
      }
    },


    testGetAllBindingsForObject: function(){
      // remove all old bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // add two binding
      var id = qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      var id2 = qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      // set and chech the binding
      this.__a.setAppearance("hans");
      this.assertEquals("hans", this.__b.getAppearance(), "String binding does not work!");
      this.__a.setZIndex(89);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding does not work!");

      // check the method
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(2, bindings.length, "There are more than 2 bindings!");
      this.assertEquals(id, bindings[0][0], "Binding 1 not in the array.");
      this.assertEquals(id2, bindings[1][0], "Binding 2 not in the array.");

      // check for a non existing binding
      var noBindings = qx.data.SingleValueBinding.getAllBindingsForObject(this);
      this.assertEquals(0, noBindings.length, "There are bindings for this?");
    },


    testRemoveAllBindingsForObject: function() {
      // add two bindings
      qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      // set and check the binding
      this.__a.setAppearance("hans");
      this.assertEquals("hans", this.__b.getAppearance(), "String binding does not work!");
      this.__a.setZIndex(89);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding does not work!");

      // remove the bindings at once
      qx.data.SingleValueBinding.removeAllBindingsForObject(this.__a);

      // set and check the binding
      this.__a.setAppearance("hans2");
      this.assertEquals("hans", this.__b.getAppearance(), "String binding not removed!");
      this.__a.setZIndex(892);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding not removed!");

      // check if they are internally removed
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(0, bindings.length, "Still bindings there!");

      // check if a remove of an object without a binding works
      var o = new qx.core.Object();
      qx.data.SingleValueBinding.removeAllBindings();
      o.dispose();

      // only test in the source version
      if (qx.core.Environment.get("qx.debug")) {
        // test for null object
        this.assertException(function() {
          qx.data.SingleValueBinding.removeAllBindingsForObject(null);
        }, qx.core.AssertionError, null, "Null is not possible!");
      }

   },


    testGetAllBindings: function(){
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // add three bindings
      var id1 = qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      var id2 = qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      var id3 = qx.data.SingleValueBinding.bind(this.__b, "zIndex", this.__a, "zIndex");

      // get all bindings
      var allBindings = qx.data.SingleValueBinding.getAllBindings();

      // check if only the added hashs are in the object
      var hashArray = [this.__a.toHashCode(), this.__b.toHashCode()];
      var i = 0;
      for (var hash in allBindings) {
        this.assertInArray(hash, hashArray, "This hash should be in!");
        i++;
      }
      this.assertEquals(2, i, "Too much or too less objects in the array!");

      // check for the binding ids
      this.assertEquals(id1, allBindings[this.__a.toHashCode()][0][0], "This id should be in!");
      this.assertEquals(id2, allBindings[this.__a.toHashCode()][1][0], "This id should be in!");
      this.assertEquals(id3, allBindings[this.__b.toHashCode()][0][0], "This id should be in!");

      // check for the length
      this.assertEquals(2, allBindings[this.__a.toHashCode()].length, "Not the right amount in the data!");
      this.assertEquals(1, allBindings[this.__b.toHashCode()].length, "Not the right amount in the data!");
    },


    testDebugStuff: function(){
      // just a test if the method runs threw without an exception
      var id1 = qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      qx.data.SingleValueBinding.bind(this.__b, "appearance", this.__a, "appearance");
      qx.data.SingleValueBinding.bind(this.__b, "zIndex", this.__a, "zIndex");
      // test the single log
      qx.data.SingleValueBinding.showBindingInLog(this.__a, id1);
      // test the all log
      qx.data.SingleValueBinding.showAllBindingsInLog();
    },


    testMixinSupport: function() {
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // create a new Binding
      var id1 = this.__a.bind("appearance", this.__b, "appearance");
      this.__a.setAppearance("hulk");
      this.assertEquals("hulk", this.__b.getAppearance(), "String binding does not work!");

      // remove the binding
      this.__a.removeBinding(id1);
      this.__a.setAppearance("hulk2");
      this.assertEquals("hulk", this.__b.getAppearance(), "Unbinding does not work!");

      // add another two bindings
      var id1 = this.__a.bind("changeAppearance", this.__b, "appearance");
      var id2 = this.__a.bind("zIndex", this.__b, "zIndex");

      // get the current bindings
      var bindings = this.__a.getBindings();
      this.assertEquals(id1, bindings[0][0], "First binding is not there.");
      this.assertEquals(id2, bindings[1][0], "Second binding is not there.");

      // remove all bindings
      this.__a.removeAllBindings();
      var bindings = this.__a.getBindings();
      this.assertEquals(0, bindings.length, "Still bindings there?");
    },


    testDebugListenerMessages: function() {
      // enable debugging
      qx.data.SingleValueBinding.DEBUG_ON = true;

      // just do some bindings and invoke the changes
      qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      this.__a.setAppearance("affe");
      this.assertEquals("affe", this.__b.getAppearance(), "String binding does not work!");

      var affe = new qx.test.data.singlevalue.TextFieldDummy();
      affe.setAppearance("Jonny");
      qx.data.SingleValueBinding.bind(affe, "appearance", this.__b, "appearance");
      this.assertEquals("Jonny", this.__b.getAppearance(), "String binding does not work!");
      qx.data.SingleValueBinding.removeAllBindingsForObject(affe);
      affe.dispose();
    },


    testFallback: function() {
      // change + "name" binding
      this.__a.bind("value", this.__b, "value");

      this.__a.setValue("affe");
      this.assertEquals(this.__a.getValue(), this.__b.getValue(), "change event binding is not working.");

      // event binding
      this.__a.bind("changeZIndex", this.__b, "zIndex");

      this.__a.setZIndex(123);
      this.assertEquals(this.__a.getZIndex(), this.__b.getZIndex(), "Event binding is not working.");
    },


    testNullWithConverter: function() {
      // create a test class
      qx.Class.define("qx.Test", {
        extend : qx.core.Object,
        members : {
          __a : null,
          setA : function(data) {
            this.__a = data;
          },
          getA : function() {
            return this.__a;
          }
        }
      });
      var t = new qx.Test();

      // define the converter
      var options = {
        converter : function(data) {
          if (data == null) {
            return "affe";
          }
          return data + "";
        }
      };

      // starting point
      this.__a.setZIndex(null);
      this.__a.bind("zIndex", t, "a", options);
      this.assertEquals("affe", t.getA(), "Converter will not be executed.");

      this.__a.setZIndex(10);
      this.assertEquals(this.__a.getZIndex() + "", t.getA(), "Wrong start binding.");

      // set the zIndex to null
      this.__a.setZIndex(null);
      this.assertEquals("affe", t.getA(), "Converter will not be executed.");

      t.dispose();
    },


    testCallbacksOnInitialSet: function() {
      // create a test class
      qx.Class.define("qx.Target",
      {
        extend : qx.core.Object,

        properties :
        {
          value : {
            init: "Some String!",
            validate: qx.util.Validate.string()
          }
        }
      });
      var target = new qx.Target();

      // some test flags
      var ok = false;
      var fail = false;

      // callback methods
      var that = this;
      var options = {
        onUpdate : function(sourceObject, targetObject, value) {
          ok = true;
          that.assertEquals(sourceObject, that.__a, "Wrong source object.");
          that.assertEquals(targetObject, target, "Wrong target object.");
          that.assertEquals(value, "affe", "Wrong value.");
        },
        onSetFail : function() {
          fail = true;
        }
      };

      // set a valid initial value
      this.__a.setValue("affe");
      this.__a.bind("value", target, "value", options);

      this.assertEquals("affe", target.getValue(), "Binding not set anyway!");
      this.assertTrue(ok, "onUpdate not called.");
      this.assertFalse(fail, "onSetFail called?!");


      // reset the checks
      this.__a.removeAllBindings();
      ok = false;
      fail = false;

      // set an invalid initial value
      this.__a.setZIndex(10);
      this.__a.bind("zIndex", target, "value", options);

      this.assertTrue(fail, "onSetFail not called.");
      this.assertFalse(ok, "onUpdate called?!");
      target.dispose();
    },


    testConversionClass : function()
    {
      qx.Class.define("qx.test.TwoProperties", {
        extend : qx.core.Object,
        properties :
        {
          a : { event : "changeA", nullable : true },
          b : { event : "changeB", nullable : true }
        }
      });

      var o = new qx.test.TwoProperties();

      // number to string
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TOSTRINGOPTIONS
      );
      o.setA(10);
      this.assertEquals("10", o.getB(), "Number -> String");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);

      // boolean to string
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TOSTRINGOPTIONS
      );
      o.setA(true);
      this.assertEquals("true", o.getB(), "Boolean -> String");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);

      // date to string
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TOSTRINGOPTIONS
      );
      o.setA(new Date());
      this.assertTrue(qx.lang.Type.isString(o.getB()), "Date -> String");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);

      // string to number
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TONUMBEROPTIONS
      );
      o.setA("123");
      this.assertEquals(123, o.getB(), "String -> Number");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);

      // string to boolean
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TOBOOLEANOPTIONS
      );
      o.setA("123");
      this.assertEquals(true, o.getB(), "String -> Boolean");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);

      // number to boolean
      var id = qx.data.SingleValueBinding.bind(
        o, "a", o, "b", qx.data.Conversion.TOBOOLEANOPTIONS
      );
      o.setA(0);
      this.assertEquals(false, o.getB(), "Number -> Boolean");
      qx.data.SingleValueBinding.removeBindingFromObject(o, id);
      o.dispose();
    },


    testResetNotNull : function() {
      qx.Class.define("qx.test.SVB", {
        extend : qx.core.Object,
        properties : {
          x : {
            nullable: true,
            init: "affe",
            event: "changeX"
          }
        }
      });

      var a = new qx.test.SVB();
      var b = new qx.test.SVB();

      a.bind("x", b, "x");

      a.setX("x");
      this.assertEquals(a.getX(), b.getX());
      a.setX(null);
      this.assertEquals(a.getX(), b.getX());

      qx.data.SingleValueBinding.removeAllBindingsForObject(a);
      qx.data.SingleValueBinding.removeAllBindingsForObject(b);
      a.dispose();
      b.dispose();
      qx.Class.undefine("qx.test.SVB");
    },


    testResetNotNullInit : function() {
      qx.Class.define("qx.test.SVB", {
        extend : qx.core.Object,
        properties : {
          x : {
            nullable: true,
            init: "affe",
            event: "changeX"
          }
        }
      });

      var a = new qx.test.SVB();
      var b = new qx.test.SVB();

      a.setX(null);
      b.setX("x");
      qx.data.SingleValueBinding.bind(a, "x", b, "x");

      this.assertEquals(a.getX(), b.getX());

      qx.data.SingleValueBinding.removeAllBindingsForObject(a);
      qx.data.SingleValueBinding.removeAllBindingsForObject(b);

      a.dispose();
      b.dispose();
      qx.Class.undefine("qx.test.SVB");
    },


    testChangeEventMissing : function() {
      qx.Class.define("qx.test.SVB", {
        extend : qx.core.Object,
        properties : {
          x : {
            nullable: true,
            init: "affe"
          }
        }
      });

      var a = new qx.test.SVB();
      var b = new qx.test.SVB();

      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "x", b, "x");
      }, qx.core.AssertionError, "Binding property x of object qx.test.SVB");

      qx.data.SingleValueBinding.removeAllBindingsForObject(a);
      qx.data.SingleValueBinding.removeAllBindingsForObject(b);

      a.dispose();
      b.dispose();
      qx.Class.undefine("qx.test.SVB");
    },


    testConverterParam : function() {
      var self = this;
      var options = {converter : function(data, model, source, target) {
        // will be called twice (init and set)
        self.assertEquals(self.__a, source);
        self.assertEquals(self.__b, target);
        return data;
      }};

      qx.data.SingleValueBinding.bind(
        this.__a, "appearance", this.__b, "appearance", options
      );
      this.__a.setAppearance("affe");
      this.assertEquals("affe", this.__b.getAppearance(), "String binding does not work!");
    },


    testWrongArguments : function() {
      this.require(["qx.debug"]);

      this.assertException(function() {
        qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, undefined);
      }, qx.core.AssertionError, "");

      this.assertException(function() {
        qx.data.SingleValueBinding.bind(this.__a, "appearance", undefined, "appearance");
      }, qx.core.AssertionError, "");

      this.assertException(function() {
        qx.data.SingleValueBinding.bind(this.__a, undefined, this.__b, "appearance");
      }, qx.core.AssertionError, "");

      this.assertException(function() {
        qx.data.SingleValueBinding.bind(undefined, "appearance", this.__b, "appearance");
      }, qx.core.AssertionError, "");
    },


    testRemoveRelatedBindings: function(){
      var c = new qx.test.data.singlevalue.TextFieldDummy();

      // add three bindings
      qx.data.SingleValueBinding.bind(this.__a, "appearance", this.__b, "appearance");
      qx.data.SingleValueBinding.bind(this.__a, "zIndex", this.__b, "zIndex");
      qx.data.SingleValueBinding.bind(this.__b, "zIndex", this.__a, "zIndex");

      // add another binding to __a, which should not be affected
      qx.data.SingleValueBinding.bind(c, "appearance", this.__a, "appearance");

      // add another binding to __b, which should not be affected
      qx.data.SingleValueBinding.bind(c, "appearance", this.__b, "appearance");

      // check if the bindings are there
      var bindingsA = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      var bindingsB = qx.data.SingleValueBinding.getAllBindingsForObject(this.__b);
      this.assertEquals(4, bindingsA.length, "There are more than 4 bindings!");
      this.assertEquals(4, bindingsB.length, "There are more than 3 bindings!");

      // remove related bindings between __a and __b, do not affect bindings to c
      qx.data.SingleValueBinding.removeRelatedBindings(this.__a, this.__b);

      // __a object should have one binding to object c
      bindingsA = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(1, bindingsA.length, "There must be one binding!");
      this.assertTrue(bindingsA[0][1] === c, "Source object of the binding must be object 'c'!");

      // __b object should have one binding to object c
      bindingsB = qx.data.SingleValueBinding.getAllBindingsForObject(this.__b);
      this.assertEquals(1, bindingsB.length, "There must be one binding!");
      this.assertTrue(bindingsA[0][1] === c, "Source object of the binding must be object 'c'!");
    },



    testNonExistingSetup: function() {
      var a = qx.data.marshal.Json.createModel({b: {}, target: null});

      qx.data.SingleValueBinding.bind(a, "b.c", a, "target");
      this.assertNull(a.getTarget());

      a.setB(qx.data.marshal.Json.createModel({c: "txt"}));
      this.assertEquals("txt", a.getTarget());
    },


    testNonExistingSetupDeep: function() {
      var a = qx.data.marshal.Json.createModel({b: {c: {d: {e: {}}}}, target: null});

      qx.data.SingleValueBinding.bind(a, "b.c.d.e.f", a, "target");
      this.assertNull(a.getTarget());

      a.getB().setC(qx.data.marshal.Json.createModel({d: {e: {f: "txt"}}}));
      this.assertEquals("txt", a.getTarget());
    },


    testNonExistingChange: function() {
      var a = qx.data.marshal.Json.createModel({b: {c: "txt"}, bb: {}, target: null});

      qx.data.SingleValueBinding.bind(a, "b.c", a, "target");
      this.assertEquals("txt", a.getTarget());

      a.setB(a.getBb());
      this.assertNull(a.getTarget());
    },


    testNonExistingChangeDeep: function() {
      var a = qx.data.marshal.Json.createModel({b: {c: {d: {e: {f: "txt"}}}}, target: null});

      qx.data.SingleValueBinding.bind(a, "b.c.d.e.f", a, "target");
      this.assertEquals("txt", a.getTarget());

      a.getB().setC(qx.data.marshal.Json.createModel({d: {e: {}}}));
      this.assertNull(a.getTarget());

      a.getB().setC(qx.data.marshal.Json.createModel({d: {}}));
      this.assertNull(a.getTarget());
    }
  }
});
