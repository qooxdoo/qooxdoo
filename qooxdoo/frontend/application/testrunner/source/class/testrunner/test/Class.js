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

************************************************************************ */

qx.Class.define("testrunner.test.Class",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testEmptyClass : function()
    {
      qx.Class.define("testrunner.Empty",
      {
        extend    : Object,
        construct : function() {}
      });

      var empty = new testrunner.Empty();
      this.assertEquals("object", typeof (empty));
      this.assertTrue(empty instanceof testrunner.Empty);
    },



    testSuperClassCall : function()
    {
      qx.Class.define("testrunner.Car",
      {
        extend : qx.core.Object,

        construct : function(name) {
          this._name = name;
        },

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          startEngine : function() {
            return "start";
          },


          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          stopEngine : function() {
            return "stop";
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          getName : function() {
            return this._name;
          }
        }
      });

      var car = new testrunner.Car("Audi");
      this.assertEquals("start", car.startEngine());
      this.assertEquals("stop", car.stopEngine());
      this.assertEquals("Audi", car.getName());

      qx.Class.define("testrunner.Bmw",
      {
        extend : testrunner.Car,

        construct : function(name, prize) {
          this.base(arguments, name);
        },

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          startEngine : function()
          {
            var ret = this.base(arguments);
            return "brrr " + ret;
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          stopEngine : function()
          {
            var ret = arguments.callee.base.call();
            return "brrr " + ret;
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          getWheels : function() {
            return this.self(arguments).WHEELS;
          }
        },

        statics : { WHEELS : 4 }
      });

      var bmw = new testrunner.Bmw("bmw", 44000);
      this.assertEquals("bmw", bmw.getName());
      this.assertEquals("brrr start", bmw.startEngine());
      this.assertEquals("brrr stop", bmw.stopEngine());
      this.assertEquals(4, bmw.getWheels());
    },


    testAbstract : function()
    {
      qx.Class.define("testrunner.AbstractCar",
      {
        extend : Object,
        type : "abstract",

        construct : function(color) {
          this._color = color;
        },

        members : {
          startEngine : function() {}
        }
      });

      // instantiating abstract classes should fail
      if (this.isDebugOn())
      {
        this.assertException(function() {
          var car = new testrunner.AbstractCar("blue");
        }, Error, new RegExp("The class .* is abstract"));
      }

      // check if subclasses of abstract classes work
      qx.Class.define("testrunner.ConcreteCar",
      {
        extend : testrunner.AbstractCar,

        construct : function(color) {
          arguments.callee.base.apply(this, arguments);
        }
      });

      var car = new testrunner.ConcreteCar("red");
      this.assertNotUndefined(car);
      this.assertEquals("red", car._color);
    },


    testSingleton : function()
    {
      qx.Class.define("testrunner.Single1",
      {
        extend : Object,
        type : "singleton",

        construct : function(name)
        {
          this._name = name;
          this._date = new Date().toString();
        }
      });

      this.assertEquals(testrunner.Single1.getInstance()._date, testrunner.Single1.getInstance()._date, "getInstance sould always return the same object!");

      // direct instanctiation should fail
      if (this.isDebugOn())
      {
        this.assertException(function() {
          var s = new testrunner.Single1();
        }, Error, new RegExp("The class .* is a singleton"));
      };
    },


    testSetting : function()
    {
      qx.Class.define("testrunner.Setting1", { settings : { "testrunner.juhu" : "kinners" } });

      this.assertEquals("kinners", qx.core.Setting.get("testrunner.juhu"));
    },


    testVariant : function()
    {
      qx.Class.define("testrunner.Variant1",
      {
        variants :
        {
          "testrunner.juhu" :
          {
            allowedValues : [ "kinners", "juhu" ],
            defaultValue  : "kinners"
          }
        }
      });

      this.assertEquals("kinners", qx.core.Variant.get("testrunner.juhu"));

      if (this.isDebugOn())
      {
        this.assertException(function()
        {
          qx.Class.define("testrunner.Variant2",
          {
            variants :
            {
              "foo.juhu" :
              {
                allowedValues : [ "kinners", "juhu" ],
                defaultValue  : "kinners"
              }
            }
          });
        },
        Error, "Forbidden variant");
      };
    },


    testDefer : function()
    {
      // this is BAD practice, don't code like this!
      qx.Class.define("testrunner.Defer",
      {
        extend : qx.core.Object,

        defer : function(statics, prot, properties)
        {
          statics.FOO = 12;

          statics.sayHello = function() {
            return "Hello";
          };

          prot.sayJuhu = function() {
            return "Juhu";
          };

          properties.add("color", {});
        }
      });

      this.assertEquals(12, testrunner.Defer.FOO);
      this.assertEquals("Hello", testrunner.Defer.sayHello());

      var defer = new testrunner.Defer();
      this.assertEquals("Juhu", defer.sayJuhu());

      defer.setColor("red");
      this.assertEquals("red", defer.getColor());
    },


    testGetFunctionName : function()
    {
      var self = this;

      qx.Class.define("testrunner.FuncName",
      {
        extend : qx.core.Object,

        construct : function()
        {
          this.base(arguments);
          self.assertEquals("construct", qx.dev.Debug.getFunctionName(arguments.callee));
        },

        members :
        {
          __foo : function()
          {
            if (self.isDebugOn()) {
              self.assertEquals("__foo", qx.dev.Debug.getFunctionName(args.callee));
            };
          },

          _bar : function() {
            self.assertEquals("_bar", qx.dev.Debug.getFunctionName(arguments.callee));
          },

          sayFooBar : function()
          {
            self.assertEquals("sayFooBar", qx.dev.Debug.getFunctionName(arguments.callee));
            this.__foo();
            this._bar();
          }
        }
      });

      var funcName = new testrunner.FuncName();
      funcName.sayFooBar();
      this.assertNull(qx.dev.Debug.getFunctionName(function() {}));
    },


    testSubClassOf : function()
    {
      this.assertTrue(qx.Class.isSubClassOf(qx.legacy.ui.core.Widget, qx.core.Object));
      this.assertTrue(qx.Class.isSubClassOf(qx.legacy.ui.basic.Terminator, qx.core.Object));
      this.assertFalse(qx.Class.isSubClassOf(qx.legacy.ui.basic.Terminator, qx.legacy.ui.core.Parent));
    }
  }
});
