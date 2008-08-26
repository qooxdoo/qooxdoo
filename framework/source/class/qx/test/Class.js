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

qx.Class.define("qx.test.Class",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testEmptyClass : function()
    {
      qx.Class.define("qx.Empty",
      {
        extend    : Object,
        construct : function() {}
      });

      var empty = new qx.Empty();
      this.assertEquals("object", typeof (empty));
      this.assertTrue(empty instanceof qx.Empty);
    },



    testSuperClassCall : function()
    {
      qx.Class.define("qx.Car",
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
           * @return {string} TODOC
           */
          startEngine : function() {
            return "start";
          },


          /**
           * TODOC
           *
           * @return {string} TODOC
           */
          stopEngine : function() {
            return "stop";
          },


          /**
           * TODOC
           *
           * @return {var} TODOC
           */
          getName : function() {
            return this._name;
          }
        }
      });

      var car = new qx.Car("Audi");
      this.assertEquals("start", car.startEngine());
      this.assertEquals("stop", car.stopEngine());
      this.assertEquals("Audi", car.getName());

      qx.Class.define("qx.Bmw",
      {
        extend : qx.Car,

        construct : function(name, prize) {
          this.base(arguments, name);
        },

        members :
        {
          /**
           * TODOC
           *
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
           * @return {var} TODOC
           */
          getWheels : function() {
            return this.self(arguments).WHEELS;
          }
        },

        statics : { WHEELS : 4 }
      });

      var bmw = new qx.Bmw("bmw", 44000);
      this.assertEquals("bmw", bmw.getName());
      this.assertEquals("brrr start", bmw.startEngine());
      this.assertEquals("brrr stop", bmw.stopEngine());
      this.assertEquals(4, bmw.getWheels());
    },


    testAbstract : function()
    {
      qx.Class.define("qx.AbstractCar",
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
          var car = new qx.AbstractCar("blue");
        }, Error, new RegExp("The class .* is abstract"));
      }

      // check if subclasses of abstract classes work
      qx.Class.define("qx.ConcreteCar",
      {
        extend : qx.AbstractCar,

        construct : function(color) {
          arguments.callee.base.apply(this, arguments);
        }
      });

      var car = new qx.ConcreteCar("red");
      this.assertNotUndefined(car);
      this.assertEquals("red", car._color);
    },


    testSingleton : function()
    {
      qx.Class.define("qx.Single1",
      {
        extend : Object,
        type : "singleton",

        construct : function(name)
        {
          this._name = name;
          this._date = new Date().toString();
        }
      });

      this.assertEquals(qx.Single1.getInstance()._date, qx.Single1.getInstance()._date, "getInstance sould always return the same object!");

      // direct instanctiation should fail
      if (this.isDebugOn())
      {
        this.assertException(function() {
          new qx.Single1();
        }, Error, new RegExp("The class .* is a singleton"));
      };
    },


    testSetting : function()
    {
      qx.Class.define("qx.Setting1", { settings : { "qx.juhu" : "kinners" } });

      this.assertEquals("kinners", qx.core.Setting.get("qx.juhu"));
    },


    testVariant : function()
    {
      qx.Class.define("qx.Variant1",
      {
        variants :
        {
          "qx.juhu" :
          {
            allowedValues : [ "kinners", "juhu" ],
            defaultValue  : "kinners"
          }
        }
      });

      this.assertEquals("kinners", qx.core.Variant.get("qx.juhu"));

      if (this.isDebugOn())
      {
        this.assertException(function()
        {
          qx.Class.define("qx.Variant2",
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
      qx.Class.define("qx.Defer",
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

      this.assertEquals(12, qx.Defer.FOO);
      this.assertEquals("Hello", qx.Defer.sayHello());

      var defer = new qx.Defer();
      this.assertEquals("Juhu", defer.sayJuhu());

      defer.setColor("red");
      this.assertEquals("red", defer.getColor());
    },


    testGetFunctionName : function()
    {
      var self = this;

      qx.Class.define("qx.FuncName",
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
              self.assertEquals("__foo", qx.dev.Debug.getFunctionName(arguments.callee));
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

      var funcName = new qx.FuncName();
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
