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
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************
#ignore(qx.test.ExtendSuper)
#ignore(qx.test.ExtendSuper.prototype)
#ignore(qx.test.Super.prototype)
#ignore(qx.test.Super)
#ignore(qx.test.ExtendNull)
#ignore(qx.test.ExtendQxObject)
#ignore(qx.test.ExtendError)
#ignore(qx.test.Construct)
************************************************************************ */

qx.Class.define("qx.test.Bootstrap",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testDefineAnonymous : function() {
      var clazz = qx.Bootstrap.define(null, {statics : {
        test : function() {
          return true;
        }
      }});

      this.assertTrue(clazz.test());
    },


    "test: define class with contructor" : function()
    {
      var c = qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        construct : function() {
          this.called = true;
        }
      });

      var obj = new qx.test.Construct();
      this.assertTrue(obj.called);

      this.assertEquals(c, qx.Bootstrap.getByName("qx.test.Construct"));
      this.assertEquals(qx.test.Construct, qx.Bootstrap.getByName("qx.test.Construct"));

      qx.Class.undefine("qx.test.Construct");
    },


    "test: define bootstrap class, which extends 'Error'" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendError", {
        extend: Error
      });

      var obj = new qx.test.ExtendError();
      this.assertInstance(obj, Error);

      qx.Class.undefine("qx.test.ExtendError");
    },


    "test: extend from qx.core.Object" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendQxObject", {
        extend: qx.core.Object
      });

      var obj = new qx.test.ExtendQxObject();
      this.assertInstance(obj, qx.core.Object);

      obj.dispose();

      qx.Class.undefine("qx.test.ExtendQxObject");
    },


    "test: extend from null should extend Object" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendNull", {
        extend: null,
        members : {}
      });

      var obj = new qx.test.ExtendNull();
      this.assertInstance(obj, Object);

      qx.Class.undefine("qx.test.ExtendNull");
    },


    "test: extend from Bootstrap class" : function()
    {
      qx.Bootstrap.define("qx.test.Super", {
        members : {}
      });

      qx.Bootstrap.define("qx.test.ExtendSuper", {
        extend: qx.test.Super,
        members : {}
      });

      var obj = new qx.test.ExtendSuper();

      this.assertInstance(obj, Object);
      this.assertInstance(obj, qx.test.Super);
      this.assertInstance(obj, qx.test.ExtendSuper);

      qx.Class.undefine("qx.test.Super");
      qx.Class.undefine("qx.test.ExtendSuper");
    },


    "test: extended Bootstap class should append members to the prototype" : function()
    {
      qx.Bootstrap.define("qx.test.Super", {
        members : {
          foo : 10,
          baz: "juhu"
        }
      });

      qx.Bootstrap.define("qx.test.ExtendSuper", {
        extend: qx.test.Super,
        members : {
          bar : "affe",
          foo : 11
        }
      });

      var obj = new qx.test.ExtendSuper();
      this.assertEquals("affe", obj.bar);
      this.assertEquals(11, obj.foo);
      this.assertEquals("juhu", obj.baz);

      this.assertEquals(11, qx.test.ExtendSuper.prototype.foo);
      this.assertEquals(10, qx.test.Super.prototype.foo);

      qx.Class.undefine("qx.test.Super");
      qx.Class.undefine("qx.test.ExtendSuper");
    },


    testFunctionWrap : function()
    {
      var context = null;
      var result = 0;

      var add = function(a, b)
      {
        context = this;
        return a + b;
      };

      context = null;
      result = add(1, 2);

      // The assertEquals test fails in Safari 3 but is fixed in WebKit nightly
      if (qx.core.Environment.get("browser.version") == "safari" &&
        qx.core.Environment.get("browser.version") < 4 )
      {
        this.assertNotEquals(context, window, "This test fails if the issue is "
        + "fixed in Safari 3.");
      } else {
        this.assertEquals(context, window);
      }
      this.assertEquals(3, result);

      context = null;
      var boundAdd = qx.Bootstrap.bind(add, this);
      result = boundAdd(1, 3);
      this.assertEquals(context, this);
      this.assertEquals(4, result);

      context = null;
      var addOne = qx.Bootstrap.bind(add, this, 1);
      result = addOne(4);
      this.assertEquals(context, this);
      this.assertEquals(5, result);
    },


    testBindWithUndefinedArguments : function()
    {
      var undef;
      var callback = function(undef, arg) {
        this.assertTrue(arg)
      }
      var bound = qx.Bootstrap.bind(callback, this, undef, true);
      bound();
    },


    testDefineShadowedMembers : function()
    {
      qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        members : {
          "isPrototypeOf" : 10,
          "hasOwnProperty" : 11,
          "toLocaleString" : 12,
          "toString" : 13,
          "valueOf" : 14
        }
      });

      var obj = new qx.test.Construct();
      this.assertEquals(10, obj.isPrototypeOf);
      this.assertEquals(11, obj.hasOwnProperty);
      this.assertEquals(12, obj.toLocaleString);
      this.assertEquals(13, obj.toString);
      this.assertEquals(14, obj.valueOf);

      qx.Class.undefine("qx.test.Construct");
    },


    testDefineShadowedStatics : function()
    {
      qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        statics : {
          "isPrototypeOf" : 10,
          "toLocaleString" : 12,
          "toString" : 13,
          "valueOf" : 14
        }
      });

      this.assertEquals(10, qx.test.Construct.isPrototypeOf);
      this.assertEquals(12, qx.test.Construct.toLocaleString);
      this.assertEquals(13, qx.test.Construct.toString);
      this.assertEquals(14, qx.test.Construct.valueOf);

      qx.Class.undefine("qx.test.Construct");
    },


    testGetKeys : function()
    {
      var obj = {};
      obj.isPrototypeOf = function() {};
      obj.hasOwnProperty = function() {};
      obj.toLocaleString = function() {};
      obj.toString = function() {};
      obj.valueOf = function() {};
      obj.constructor = function() {};
      obj.prototype = function() {};

      var keys = qx.Bootstrap.getKeys(obj);
      this.assertTrue(qx.lang.Array.contains(keys, "isPrototypeOf"), "Test isPrototypeOf");
      this.assertTrue(qx.lang.Array.contains(keys, "hasOwnProperty"), "Test hasOwnProperty");
      this.assertTrue(qx.lang.Array.contains(keys, "toLocaleString"), "Test toLocaleString");
      this.assertTrue(qx.lang.Array.contains(keys, "toString"), "Test toString");
      this.assertTrue(qx.lang.Array.contains(keys, "valueOf"), "Test valueOf");
      this.assertTrue(qx.lang.Array.contains(keys, "constructor"), "Test constructor");
      this.assertTrue(qx.lang.Array.contains(keys, "prototype"), "Test prototype");
    },

    testGetKeysWithExtendObject : function()
    {
      function ObjectA() {
        this.A = 10;
      };

      function ObjectB() {
        this.B = 11;
      };

      ObjectB.prototype = new ObjectA();

      var objB = new ObjectB();
      this.assertEquals(10, objB.A, "Object extension fails!");
      this.assertEquals(11, objB.B, "Object extension fails!");

      var keys = qx.Bootstrap.getKeys(objB);
      this.assertEquals(1, keys.length, "Expected length wrong!");
      this.assertFalse(qx.lang.Array.contains(keys, "A"), "Test property A!");
      this.assertTrue(qx.lang.Array.contains(keys, "B"), "Test property B!");
    }
  }
});
