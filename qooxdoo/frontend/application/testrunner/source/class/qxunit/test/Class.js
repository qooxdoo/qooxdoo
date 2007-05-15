/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.test.Class", {
  extend: testrunner.TestCase,

  members : {

    testEmptyClass: function() {
      qx.Class.define("testrunner.Empty", {
            extend: Object,
            construct: function() {}
        });

        var empty = new testrunner.Empty();
        this.assertEquals("object", typeof(empty));
      this.assertTrue(empty instanceof testrunner.Empty);
    },

    testSameNameClasses: function() {
      qx.Class.define("testrunner.Same", {
            extend: Object,
            construct: function() {}
        });

      this.assertExceptionDebugOn(function() {
          qx.Class.define("testrunner.Same", {
              extend: Object,
              construct: function() {}
          });
      }, Error, "An object of the name 'testrunner.Same' aready exists and overwriting is not allowed!");
    },

    testSuperClassCall: function() {
        qx.Class.define("testrunner.Car", {
            extend: qx.core.Object,

            construct: function (name) {
                this._name = name;
            },

            members: {
                startEngine: function() {
                    return "start";
                },

                stopEngine: function() {
                    return "stop";
                },

                getName: function() {
                    return this._name;
                }

            }
        });

        var car = new testrunner.Car("Audi");
        this.assertEquals("start", car.startEngine());
        this.assertEquals("stop", car.stopEngine());
        this.assertEquals("Audi", car.getName());

        qx.Class.define("testrunner.Bmw", {

            extend: testrunner.Car,

            construct: function(name, prize) {
                this.base(arguments, name);
            },

            members: {
                startEngine: function() {
                    var ret = this.base(arguments);
                    return "brrr " + ret;
                },

                stopEngine: function() {
                    var ret = arguments.callee.base.call();
                    return "brrr " + ret;
                },
            getWheels: function() {
            return this.self(arguments).WHEELS;
          }
            },

        statics: {
          WHEELS: 4
        }
        });

        var bmw = new testrunner.Bmw("bmw", 44000);
        this.assertEquals("bmw", bmw.getName());
        this.assertEquals("brrr start", bmw.startEngine());
        this.assertEquals("brrr stop", bmw.stopEngine());
      this.assertEquals(4, bmw.getWheels());
    },


    testAbstract: function() {

      qx.Class.define("testrunner.AbstractCar", {
        extend: Object,
        type: "abstract",
        construct: function(color) {
          this._color = color;
        },
        members: {
          startEngine: function() {}
        }
      });

      // instantiating abstract classes should fail
      this.assertExceptionDebugOn(function() {
        var car = new testrunner.AbstractCar("blue");
      }, Error, new RegExp("The class .* is abstract"));

      // check if subclasses of abstract classes work
      qx.Class.define("testrunner.ConcreteCar", {
        extend: testrunner.AbstractCar,
        construct: function(color) {
          arguments.callee.base.apply(this, arguments);
        }
      });

      var car = new testrunner.ConcreteCar("red");
      this.assertNotUndefined(car);
      this.assertEquals("red", car._color);
    },


    testSingleton: function() {

      qx.Class.define("testrunner.Single1", {
        extend: Object,
        type: "singleton",

        construct: function (name) {
          this._name = name;
          this._date = new Date().toString();
        }
      });

      this.assertEquals(
        testrunner.Single1.getInstance()._date,
        testrunner.Single1.getInstance()._date,
        "getInstance sould always return the same object!"
      );

      // direct instanctiation should fail
      this.assertExceptionDebugOn(function() {
        var s = new testrunner.Single1();
      }, Error, new RegExp("The class .* is a singleton"));

    },

    testSetting: function() {
      qx.Class.define("testrunner.Setting1", {
        settings: {
          "testrunner.juhu": "kinners"
        }
      });

      this.assertEquals(
        "kinners",
        qx.core.Setting.get("testrunner.juhu")
      );


      this.assertExceptionDebugOn(function() {
        qx.Class.define("testrunner.Setting2", {
          settings: {
            "foo.juhu": "kinners"
          }
        });
      }, Error, "Forbidden setting");
    },

    testVariant: function() {
      qx.Class.define("testrunner.Variant1", {
        variants: {
          "testrunner.juhu": {
            allowedValues: ["kinners", "juhu"],
            defaultValue: "kinners"
          }
        }
      });

      this.assertEquals(
        "kinners",
        qx.core.Variant.get("testrunner.juhu")
      );

      this.assertExceptionDebugOn(function() {
        qx.Class.define("testrunner.Variant2", {
          variants: {
            "foo.juhu": {
              allowedValues: ["kinners", "juhu"],
              defaultValue: "kinners"
            }
          }
        });
      }, Error, "Forbidden variant");
    },

    testDefer: function() {
      // this is BAD practice, don't code like this!
      qx.Class.define("testrunner.Defer", {
        extend: qx.core.Object,

        defer: function(statics, prot, properties) {
          statics.FOO = 12;
          statics.sayHello = function() { return "Hello"; };
          prot.sayJuhu = function() { return "Juhu"; };
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

    __testCaller: function() {

      qx.Class.define("testrunner.CallerSuper", {
        extend: qx.core.Object,
        members: {
          __foo: function() {
            this.debug("foo");
          },
          _bar: function() {
            console.log("%o", arguments.callee.context);
            debugger;
            this.__foo();
          },
          juhu: function() {
            this._bar();
          }
        },
        statics: {
          sayFoo: function() {
            this.__staticFoo();
          },
          __staticFoo: function() {
            new qx.core.Object().debug("static foo");
          }
        }
      });

      // statics
      testrunner.CallerSuper.sayFoo();
      this.assertException(function() {
        testrunner.CallerSuper.__staticFoo();
      }, Error, "Private method", "call private static");

      var caller = new testrunner.CallerSuper();
      //caller.juhu();

      this.assertException(function() {
        caller._bar();
      }, Error, "Protected method", "call protected member");

      this.assertException(function() {
        caller.__foo();
      }, Error, "Private method", "call private member");

      // test protected
      qx.Class.define("testrunner.CallerChild", {
        extend: testrunner.CallerSuper,
        members: {
          __foo: function() {
            this.debug("child foo");
          },
          /*
          juhu: function() {
            this._bar();
          },
          */
          kinners: function() {
            this.__foo();
          }
        }
      });

      var caller = new testrunner.CallerChild();
      caller.juhu();

      this.assertException(function() {
        caller.kinners();
      }, Error, "Private method", "call private member of super class");

    },

    __testWrappedPrivate: function() {
      qx.Interface.define("testrunner.IWrappedPrivate", {
        members: {
          __foo: function() { return true; }
        }
      });

      // private/protected should not be part of an interface
      qx.Class.define("testrunner.WrappedPrivate", {
        extend: qx.core.Object,
        implement: [testrunner.IWrappedPrivate],
        members: {
          __foo: function() { this.debug("foo"); },
          sayFoo: function() { this.__foo(); }
        }
      });

      var wp = new testrunner.WrappedPrivate();
      this.assertException(function() {
        wp.__foo();
      }, Error, "Private method");

      wp.sayFoo();
    },

    testGetFunctionName: function() {
      var self = this;

      qx.Class.define("testrunner.FuncName", {
        extend: qx.core.Object,
        construct: function() {
          this.base(arguments);
          self.assertEquals("construct", qx.dev.Debug.getFunctionName(arguments.callee));
        },

        members: {
          __foo: function() {
            self.assertEqualsDebugOn("__foo", qx.dev.Debug.getFunctionName(arguments.callee));
          },

          _bar: function() {
            self.assertEquals("_bar", qx.dev.Debug.getFunctionName(arguments.callee));
          },

          sayFooBar: function() {
            self.assertEquals("sayFooBar", qx.dev.Debug.getFunctionName(arguments.callee));
            this.__foo();
            this._bar();
          }
        }
      });

      var funcName = new testrunner.FuncName();
      funcName.sayFooBar();
      this.assertNull(qx.dev.Debug.getFunctionName(function() {}));

    }
  }
});