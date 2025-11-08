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

qx.Class.define("qx.test.Class", {
  extend: qx.dev.unit.TestCase,
  include: [qx.dev.unit.MRequirements],

  members: {
    testAnonymous() {
      var clazz = qx.Class.define(null, {
        statics: {
          test() {
            return true;
          }
        }
      });

      this.assertTrue(clazz.test());
    },

    testOverridePropertyMethod() {
      this.require(["qx.debug"]);

      var C = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          prop: {
            init: "unset",
            check: "String",
            inheritable: true,
            themeable: true
          }
        }
      });

      var D = qx.Class.define(null, {
        extend: C,
        members: {
          setProp(value) {
            return super.setProp(value + "-set");
          },
          getProp() {
            return super.getProp() + "-get";
          }
        }
      });

      var d = new D();
      d.setProp("hello");
      this.assertEquals("hello-set-get", d.getProp());
    },

    testEmptyClass() {
      qx.Class.define("qx.Empty", {
        extend: Object,
        construct() {}
      });

      var empty = new qx.Empty();
      this.assertEquals("object", typeof empty);
      this.assertTrue(empty instanceof qx.Empty);
    },

    testSuperClassCall() {
      qx.Class.define("qx.Car", {
        extend: qx.core.Object,

        construct(name) {
          this._name = name;
        },

        members: {
          startEngine() {
            return "start";
          },

          stopEngine() {
            return "stop";
          },

          getName() {
            return this._name;
          }
        }
      });

      var car = new qx.Car("Audi");
      this.assertEquals("start", car.startEngine());
      this.assertEquals("stop", car.stopEngine());
      this.assertEquals("Audi", car.getName());

      qx.Class.define("qx.Bmw", {
        extend: qx.Car,

        construct(name, prize) {
          super(name);
        },

        members: {
          startEngine() {
            var ret = super.startEngine();
            return "brrr " + ret;
          },

          stopEngine() {
            var ret = super.stopEngine();
            return "brrr " + ret;
          },

          getWheels() {
            return this.self(arguments).WHEELS;
          },

          getMaxSpeed() {
            // call base in non overridden method
            super.getMaxSpeed();
          }
        },

        statics: { WHEELS: 4 }
      });

      var bmw = new qx.Bmw("bmw", 44000);
      this.assertEquals("bmw", bmw.getName());
      this.assertEquals("brrr start", bmw.startEngine());
      this.assertEquals("brrr stop", bmw.stopEngine());
      this.assertEquals(4, bmw.getWheels());

      if (this.isDebugOn()) {
        this.assertException(function () {
          bmw.getMaxSpeed();
        }, Error);
      }
    },

    testAbstract() {
      qx.Class.define("qx.AbstractCar", {
        extend: qx.core.Object,
        type: "abstract",

        construct(color) {
          this._color = color;
        },

        members: {
          startEngine() {}
        }
      });

      // instantiating abstract classes should fail
      if (this.isDebugOn()) {
        this.assertException(
          function () {
            new qx.AbstractCar("blue");
          },
          Error,
          new RegExp("The class .* is abstract")
        );
      }

      // check if subclasses of abstract classes work
      qx.Class.define("qx.ConcreteCar", {
        extend: qx.AbstractCar,

        construct(color) {
          super(color);
        }
      });

      var car = new qx.ConcreteCar("red");
      this.assertNotUndefined(car);
      this.assertEquals("red", car._color);
    },

    testSingleton() {
      qx.Class.define("qx.Single1", {
        extend: Object,
        type: "singleton",

        construct() {
          this._date = new Date().toString();
        }
      });

      // direct instantiation should fail
      if (this.isDebugOn()) {
        this.assertException(
          function () {
            new qx.Single1();
          },
          Error,
          new RegExp("The class .* is a singleton")
        );
      }

      this.assertEquals(
        qx.Single1.getInstance()._date,
        qx.Single1.getInstance()._date,
        "getInstance should always return the same object!"
      );

      qx.Class.undefine("qx.Single1");
    },

    testInvalidImplicitStatic() {
      // different error message if no "extend" key was configured
      if (this.isDebugOn()) {
        this.assertException(
          function () {
            qx.Class.define("qx.MyClass1", {
              include: [qx.core.MLogging]
            });
          },
          Error,
          new RegExp("Assumed static class.*")
        );
      }
    },

    testEnvironment() {
      qx.Class.define("qx.Setting1", { environment: { "qx.juhu": "kinners" } });

      this.assertEquals("kinners", qx.core.Environment.get("qx.juhu"));

      qx.Class.undefine("qx.Setting1");
    },

    testDefer() {
      // this is BAD practice, don't code like this!
      qx.Class.define("qx.Defer", {
        extend: qx.core.Object,

        defer(statics, members, properties) {
          statics.FOO = 12;

          statics.sayHello = function () {
            return "Hello";
          };

          members.sayJuhu = function () {
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

    testSubClassOf() {
      this.assertTrue(qx.Class.isSubClassOf(qx.data.Array, qx.core.Object));
    },

    testClassUndefine() {
      qx.Class.define("qx.test.u.u.Undefine", {
        extend: qx.core.Object
      });

      this.assertNotUndefined(qx.test.u.u.Undefine);

      qx.Class.undefine("qx.test.u.u.Undefine");
      this.assertUndefined(qx.test["u"]);
    },

    testPatch() {
      qx.Mixin.define("qx.MyMixin", {
        properties: {
          property: { init: "p" }
        },

        members: {
          getP() {
            return "p";
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend: qx.core.Object
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

    testPatchWithConstructor() {
      qx.Mixin.define("qx.MyMixin", {
        construct() {
          this.__p = "p";
        },
        properties: {
          property: { init: "p" }
        },

        members: {
          getP() {
            return this.__p;
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend: qx.core.Object
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

    testInclude() {
      qx.Mixin.define("qx.MyMixin", {
        properties: {
          property: { init: "p" }
        },

        members: {
          getP() {
            return "p";
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend: qx.core.Object
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

    testIncludeWithConstructor() {
      qx.Mixin.define("qx.MyMixin", {
        construct() {
          this.__p = "p";
        },
        properties: {
          property: { init: "p" }
        },

        members: {
          getP() {
            return this.__p;
          }
        }
      });

      qx.Class.define("qx.MyClass", {
        extend: qx.core.Object
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

    testSubclasses() {
      qx.Class.define("qx.Insect", {
        extend: qx.core.Object
      });

      qx.Class.define("qx.Butterfly", {
        extend: qx.Insect
      });

      qx.Class.define("qx.Firefly", {
        extend: qx.Insect
      });

      qx.Class.define("qx.Grasshopper", {
        extend: qx.Insect
      });

      var subclasses = qx.Class.getSubclasses(qx.Insect);

      // we should find 3 subclasses of qx.Insect
      this.assertEquals(Object.keys(subclasses).length, 3);

      // qx.Firefly should be a subclass of qx.Insect
      this.assertEquals(subclasses["qx.Firefly"], qx.Firefly);

      subclasses = qx.Class.getSubclasses(qx.Firefly);

      // there should be no subclasses for qx.Firefly
      this.assertEquals(Object.keys(subclasses).length, 0);

      subclasses = qx.Class.getSubclasses(qx.Bug);

      // there should be no class qx.Bug
      this.assertEquals(subclasses, null);
    },

    "test: instantiate class in defer and access property"() {
      var self = this;

      qx.Class.define("qx.DeferFoo", {
        extend: qx.core.Object,
        properties: {
          juhu: {}
        },

        defer() {
          var df = new qx.DeferFoo();

          df.setJuhu("23");
          self.assertEquals("23", df.getJuhu());
          df.dispose();
        }
      });

      qx.Class.undefine("qx.DeferFoo");
    },

    testGetPropertyDescriptorStatic() {
      // Define a test class with properties
      var TestClass = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          myProp: {
            init: "default",
            check: "String",
            nullable: false
          },

          anotherProp: {
            init: 42,
            check: "Integer"
          }
        }
      });

      // Test static method on qx.Class
      var descriptor = qx.Class.getPropertyDescriptor(TestClass, "myProp");
      this.assertNotNull(descriptor, "Property descriptor should not be null");
      this.assertInstance(
        descriptor,
        qx.core.property.Property,
        "Should return Property object"
      );

      this.assertEquals("myProp", descriptor.getPropertyName(), "Property name should match");

      var definition = descriptor.getDefinition();
      this.assertEquals(
        "default",
        definition.init,
        "Init value should match"
      );

      this.assertEquals(
        "String",
        definition.check,
        "Check type should match"
      );

      // Test with another property
      descriptor = qx.Class.getPropertyDescriptor(TestClass, "anotherProp");
      this.assertNotNull(
        descriptor,
        "Second property descriptor should not be null"
      );

      this.assertEquals(
        "anotherProp",
        descriptor.getPropertyName(),
        "Second property name should match"
      );

      // Test with non-existent property
      descriptor = qx.Class.getPropertyDescriptor(TestClass, "nonExistent");
      this.assertNull(
        descriptor,
        "Non-existent property descriptor should be null"
      );
    },

    testGetPropertyDescriptorInstance() {
      // Define a test class with properties
      var TestClass = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          instanceProp: {
            init: "test",
            check: "String",
            event: "changeInstanceProp"
          },

          inheritableProp: {
            init: null,
            nullable: true,
            inheritable: true
          }
        }
      });

      var instance = new TestClass();

      // Test accessing via instance.getPropertyDescriptor
      var descriptor = instance.getPropertyDescriptor("instanceProp");
      this.assertNotNull(
        descriptor,
        "Property descriptor should not be null"
      );

      this.assertInstance(
        descriptor,
        qx.core.property.Property,
        "Should return Property object"
      );

      this.assertEquals(
        "instanceProp",
        descriptor.getPropertyName(),
        "Property name should match"
      );

      var definition = descriptor.getDefinition();
      this.assertEquals(
        "test",
        definition.init,
        "Init value should match"
      );

      this.assertEquals(
        "changeInstanceProp",
        definition.event,
        "Event should match"
      );

      // Test inheritable property
      descriptor = instance.getPropertyDescriptor("inheritableProp");
      this.assertNotNull(
        descriptor,
        "Inheritable property descriptor should not be null"
      );

      this.assertTrue(
        descriptor.isInheritable(),
        "Inheritable property should be marked as inheritable"
      );

      // Test with non-existent property
      descriptor = instance.getPropertyDescriptor("nonExistent");
      this.assertNull(
        descriptor,
        "Non-existent property descriptor should be null"
      );

      instance.dispose();
    },

    testGetPropertyDescriptorSetGet() {
      // Define a test class with properties
      var TestClass = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          count: {
            init: 0,
            check: "Integer"
          },

          label: {
            init: "default",
            check: "String",
            event: "changeLabel"
          }
        }
      });

      var instance = new TestClass();

      // Get property descriptor via instance
      var countDescriptor = instance.getPropertyDescriptor("count");
      this.assertNotNull(
        countDescriptor,
        "Property descriptor should not be null"
      );

      // Test using descriptor's set method directly (bound to instance)
      countDescriptor.set(42);
      this.assertEquals(42, instance.getCount(), "Value set via descriptor should be retrievable via getter");

      // Test using descriptor's get method directly (bound to instance)
      var value = countDescriptor.get();
      this.assertEquals(42, value, "Value should be retrievable via descriptor's get method");

      // Test with another property
      var labelDescriptor = instance.getPropertyDescriptor("label");

      // Set value via descriptor (no .call needed, already bound)
      labelDescriptor.set("test value");
      this.assertEquals(
        "test value",
        labelDescriptor.get(),
        "Property value set and get via descriptor should match"
      );

      // Verify the value is also accessible via normal getter
      this.assertEquals(
        "test value",
        instance.getLabel(),
        "Value set via descriptor should be accessible via normal getter"
      );

      // Verify change event was fired
      var eventFired = false;
      instance.addListener("changeLabel", function(e) {
        eventFired = true;
        this.assertEquals("new value", e.getData(), "Event data should match new value");
      }, this);

      labelDescriptor.set("new value");
      this.assertTrue(eventFired, "Change event should have been fired");

      instance.dispose();
    },

    testGetPropertyDescriptorInheritance() {
      // Define a base class with a property
      var BaseClass = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          baseProp: {
            init: "base",
            check: "String"
          }
        }
      });

      // Define a derived class with its own property
      var DerivedClass = qx.Class.define(null, {
        extend: BaseClass,
        properties: {
          derivedProp: {
            init: "derived",
            check: "String"
          }
        }
      });

      var instance = new DerivedClass();

      // Test that we can get the base class property from derived instance
      var baseDescriptor = instance.getPropertyDescriptor("baseProp");
      this.assertNotNull(
        baseDescriptor,
        "Base property should be accessible from derived instance"
      );

      this.assertEquals(
        "baseProp",
        baseDescriptor.getPropertyName(),
        "Base property name should match"
      );

      // Test that we can get the derived class property
      var derivedDescriptor = instance.getPropertyDescriptor("derivedProp");
      this.assertNotNull(
        derivedDescriptor,
        "Derived property should be accessible"
      );

      this.assertEquals(
        "derivedProp",
        derivedDescriptor.getPropertyName(),
        "Derived property name should match"
      );

      // Test static method with inheritance
      var staticBaseDescriptor = qx.Class.getPropertyDescriptor(
        DerivedClass,
        "baseProp"
      );

      this.assertNotNull(
        staticBaseDescriptor,
        "Base property should be accessible via static method on derived class"
      );

      instance.dispose();
    },

    testGetPropertyDescriptorStaticWithCall() {
      // Test that static method without instance parameter works with .call()
      var TestClass = qx.Class.define(null, {
        extend: qx.core.Object,
        properties: {
          value: {
            init: 0,
            check: "Integer"
          }
        }
      });

      var instance = new TestClass();

      // Get descriptor via static method WITHOUT instance parameter
      var descriptor = qx.Class.getPropertyDescriptor(TestClass, "value");
      this.assertNotNull(descriptor, "Descriptor should not be null");

      // Should work with .call() syntax
      descriptor.set.call(instance, 100);
      this.assertEquals(100, instance.getValue(), "Value should be set via .call()");

      var value = descriptor.get.call(instance);
      this.assertEquals(100, value, "Value should be retrievable via .call()");

      // Get descriptor via static method WITH instance parameter
      var boundDescriptor = qx.Class.getPropertyDescriptor(TestClass, "value", instance);
      this.assertNotNull(boundDescriptor, "Bound descriptor should not be null");

      // Should work with direct calls (no .call needed)
      boundDescriptor.set(200);
      this.assertEquals(200, instance.getValue(), "Value should be set directly");

      var boundValue = boundDescriptor.get();
      this.assertEquals(200, boundValue, "Value should be retrievable directly");

      instance.dispose();
    }
  }
});
