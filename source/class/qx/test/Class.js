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
 * @ignore(qx.AbstractCar, qx.Bmw, qx.Car, qx.ConcreteCar, qx.Defer.*)
 * @ignore(qx.DeferFoo, qx.Empty, qx.FuncName, qx.MyClass, qx.MyMixin)
 * @ignore(qx.Single1.*, qx.test.u.u.*)
 * @ignore(qx.Insect, qx.Butterfly, qx.Firefly, qx.Grasshopper, qx.Bug)

 */

qx.Class.define("qx.test.Class",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MRequirements],

  members :
  {
    testAnonymous : function() {
      var clazz = qx.Class.define(null, {statics : {
        test : function() {
          return true;
        }
      }});

      this.assertTrue(clazz.test());
    },


    testOverridePropertyMethod : function() {
      this.require(["qx.debug"]);
      
      var C = qx.Class.define(null, {
        extend : qx.core.Object,
        properties : {
          prop: {
          	init: "unset",
            check : "String",
            inheritable: true,
            themeable: true
          }
        }
      });
      
      var D = qx.Class.define(null, {
      	extend: C,
      	members: {
      		setProp: function(value) {
      			return this.base(arguments, value + "-set");
      		},
      		getProp: function() {
      			return this.base(arguments) + "-get";
      		}
      	}
      });
      
      var d = new D();
      d.setProp("hello");
      this.assertEquals("hello-set-get", d.getProp());
    },


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
          startEngine : function() {
            return "start";
          },

          stopEngine : function() {
            return "stop";
          },

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
          startEngine : function()
          {
            var ret = this.base(arguments);
            return "brrr " + ret;
          },

          stopEngine : function()
          {
            var ret = this.base(arguments);
            return "brrr " + ret;
          },

          getWheels : function() {
            return this.self(arguments).WHEELS;
          },

          getMaxSpeed : function()
          {
            // call base in non overridden method
            this.base(arguments);
          }
        },

        statics : { WHEELS : 4 }
      });

      var bmw = new qx.Bmw("bmw", 44000);
      this.assertEquals("bmw", bmw.getName());
      this.assertEquals("brrr start", bmw.startEngine());
      this.assertEquals("brrr stop", bmw.stopEngine());
      this.assertEquals(4, bmw.getWheels());

      if (this.isDebugOn())
      {
        this.assertException(function() {
          bmw.getMaxSpeed();
        }, Error);
      }
    },


    testAbstract : function()
    {
      qx.Class.define("qx.AbstractCar",
      {
        extend : qx.core.Object,
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
          new qx.AbstractCar("blue");
        }, Error, new RegExp("The class .* is abstract"));
      }

      // check if subclasses of abstract classes work
      qx.Class.define("qx.ConcreteCar",
      {
        extend : qx.AbstractCar,

        construct : function(color) {
          this.base(arguments, color);
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

        construct : function() {
          this._date = new Date().toString();
        }
      });

      // direct instantiation should fail
      if (this.isDebugOn())
      {
        this.assertException(function() {
          new qx.Single1();
        }, Error, new RegExp("The class .* is a singleton"));
      };

      this.assertEquals(qx.Single1.getInstance()._date, qx.Single1.getInstance()._date, "getInstance should always return the same object!");

      qx.Class.undefine("qx.Single1");
    },

    testInvalidImplicitStatic : function()
    {
      // different error message if no "extend" key was configured
      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.define("qx.MyClass1",
          {
            include : [
              qx.ui.core.MChildrenHandling
            ]
          });
        }, Error, new RegExp('Assumed static class.*'));
      }
    },

    testEnvironment : function()
    {
      qx.Class.define("qx.Setting1", { environment : { "qx.juhu" : "kinners" } });

      this.assertEquals("kinners", qx.core.Environment.get("qx.juhu"));

      qx.Class.undefine("qx.Setting1");
    },


    testDefer : function()
    {
      // this is BAD practice, don't code like this!
      qx.Class.define("qx.Defer",
      {
        extend : qx.core.Object,

        defer : function(statics, members, properties)
        {
          statics.FOO = 12;

          statics.sayHello = function() {
            return "Hello";
          };

          members.sayJuhu = function() {
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
      defer.dispose();
    },


    testSubClassOf : function()
    {
      this.assertTrue(qx.Class.isSubClassOf(qx.ui.core.Widget, qx.core.Object));
    },


    testClassUndefine : function() {
      qx.Class.define("qx.test.u.u.Undefine", {
        extend : qx.core.Object
      });
      this.assertNotUndefined(qx.test.u.u.Undefine);

      qx.Class.undefine("qx.test.u.u.Undefine");
      this.assertUndefined(qx.test["u"]);
    },


    testPatch : function()
    {
      qx.Mixin.define("qx.MyMixin", {
        properties : {
          "property" : {init: "p"}
        },

        members : {
          getP : function() {
            return "p";
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend  : qx.core.Object
      });

      qx.Class.patch(qx.MyClass, qx.MyMixin);

      var o = new qx.MyClass();

      // just check of the properties are ok
      this.assertEquals("p", o.getProperty());
      this.assertEquals("p", o.getP());

      // clean up
      o.dispose();
      qx.Class.undefine("qx.MyClass");
      qx.Class.undefine("qx.MyMixin");
    },


    testPatchWithConstructor : function()
    {
      qx.Mixin.define("qx.MyMixin", {
        construct : function() {
          this.__p = "p";
        },
        properties : {
          "property" : {init: "p"}
        },

        members : {
          getP : function() {
            return this.__p;
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend  : qx.core.Object
      });

      qx.Class.patch(qx.MyClass, qx.MyMixin);

      var o = new qx.MyClass();

      // just check of the properties are ok
      this.assertEquals("p", o.getProperty());
      this.assertEquals("p", o.getP());

      // clean up
      o.dispose();
      qx.Class.undefine("qx.MyClass");
      qx.Class.undefine("qx.MyMixin");
    },


    testInclude : function() {
      qx.Mixin.define("qx.MyMixin", {
        properties : {
          "property" : {init: "p"}
        },

        members : {
          getP : function() {
            return "p";
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend  : qx.core.Object
      });

      qx.Class.include(qx.MyClass, qx.MyMixin);

      var o = new qx.MyClass();

      // just check of the properties are ok
      this.assertEquals("p", o.getProperty());
      this.assertEquals("p", o.getP());

      // clean up
      o.dispose();
      qx.Class.undefine("qx.MyClass");
      qx.Class.undefine("qx.MyMixin");
    },


    testIncludeWithConstructor : function() {
      qx.Mixin.define("qx.MyMixin", {
        construct : function() {
          this.__p = "p";
        },
        properties : {
          "property" : {init: "p"}
        },

        members : {
          getP : function() {
            return this.__p;
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend  : qx.core.Object
      });

      qx.Class.include(qx.MyClass, qx.MyMixin);

      var o = new qx.MyClass();

      // just check of the properties are ok
      this.assertEquals("p", o.getProperty());
      this.assertEquals("p", o.getP());

      // clean up
      o.dispose();
      qx.Class.undefine("qx.MyClass");
      qx.Class.undefine("qx.MyMixin");
    },


    testSubclasses : function()
    {
      qx.Class.define("qx.Insect",
      {
        extend : qx.core.Object
      });

      qx.Class.define("qx.Butterfly",
      {
        extend : qx.Insect
      });

      qx.Class.define("qx.Firefly",
      {
        extend : qx.Insect
      });

      qx.Class.define("qx.Grasshopper",
      {
        extend : qx.Insect
      });

      var subclasses = qx.Class.getSubclasses(qx.Insect);
      
      // we should find 3 subclasses of qx.Insect
      this.assertEquals(Object.keys(subclasses).length,3);

      // qx.Firefly should be a subclass of qx.Insect
      this.assertEquals(subclasses["qx.Firefly"],qx.Firefly);

      subclasses = qx.Class.getSubclasses(qx.Firefly);

      // there should be no subclasses for qx.Firefly
      this.assertEquals(Object.keys(subclasses).length,0);
      
      subclasses = qx.Class.getSubclasses(qx.Bug);

      // there should be no class qx.Bug
      this.assertEquals(subclasses,null);

    },


    "test: instantiate class in defer and access property" : function()
    {
      var self = this;

      qx.Class.define("qx.DeferFoo", {
        extend: qx.core.Object,
        properties : {
          juhu : {}
        },
        defer : function() {
          var df = new qx.DeferFoo();

          df.setJuhu("23");
          self.assertEquals("23", df.getJuhu());
          df.dispose();
        }
      });

      qx.Class.undefine("qx.DeferFoo");
    }
  }
});
