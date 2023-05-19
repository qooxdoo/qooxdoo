/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * @ignore(qx.test.cpnfv8.*)
 */
qx.Class.define("qx.test.ClassPropertyNewFeaturesVersion8", {
  extend: qx.dev.unit.TestCase,

  members: {
    setUp() {
      qx.Class.define("qx.test.cpnfv8.Object", {
        extend: Object
      });

      qx.Class.define("qx.test.cpnfv8.Superclass", {
        extend: qx.test.cpnfv8.Object,

        construct(bRunning = true) {
          console.log(`Superclass constructor: bRunning=${bRunning}`);
          this.running = bRunning;
        },

        properties: {
          running: {
            init: undefined,
            check: "Boolean",
            event: "changeRunning",
            apply: "_applyRunning",
            isEqual(a, b) {
              return a === b;
            }
          },

          nullableProp: {
            init: 10,
            check: "Number",
            nullable: true
          },

          nonNullableProp: {
            init: 10,
            check: "Number",
            nullable: false
          },

          jsdocProp: {
            initFunction: () => [10, 20, 30],
            check: "Array<Number>"
          },

          mustBe42: {
            init: 0,
            check: "value === 42"
          },

          positive: {
            init: 1,
            check: "Number",
            validate(value) {
              if (value <= 0) {
                throw new Error("value must be greater than 0");
              }
            }
          },

          readOnly: {
            initFunction: () => 42,
            immutable: "readonly"
          }
        },

        members: {
          num: 23,
          str: "hello world",

          publicMethod() {
            console.log("superclass publicMethod called");
          },

          _applyRunning(value, old) {
            if (value === old) {
              throw new Error(
                "superclass: _applyRunning called with identical value"
              );
            }

            console.log(
              `superclass apply running: value changing from ${old} to ${value}`
            );
          }
        }
      });

      qx.Class.define("qx.test.cpnfv8.ExternalStorage", {
        extend: qx.test.cpnfv8.Object,
        implement: qx.core.propertystorage.IStorage,

        statics: {
          _subclassStorage: null,

          init(prop, property) {
            qx.test.cpnfv8.ExternalStorage._subclassStorage = {
              externallyStored: 0
            };
          },

          get(prop) {
            console.log("in externallyStored getter");
            return qx.test.cpnfv8.ExternalStorage._subclassStorage[prop];
          },

          set(prop, value) {
            console.log("in externallyStored setter");
            qx.test.cpnfv8.ExternalStorage._subclassStorage[prop] = value;
          },

          dereference(prop, property) {}
        }
      });

      qx.Class.define("qx.test.cpnfv8.Subclass", {
        extend: qx.test.cpnfv8.Superclass,

        construct(num, bRunning) {
          console.log(`Subclass constructor: num=${num} bRunning=${bRunning}`);
          super(bRunning); // super();
          this.initExternallyStored();
          this.num = num;
          this.publicMethod();
        },

        statics: {
          staticEntry: "I am static"
        },

        members: {
          publicMethod() {
            console.log("subclass publicMethod called");
            super.publicMethod();
          },

          _applyRunning(value, old) {
            console.log(
              `subclass apply running: value changing from ${old} to ${value}`
            );

            super._applyRunning(value, old);
          }
        },

        properties: {
          // running :
          // {
          //   refine : true,
          //   init : 42,
          //   check : "Number",
          //   apply : "_applyRunning"
          // },

          externallyStored: {
            init: 10,
            storage: qx.test.cpnfv8.ExternalStorage
          },

          delay: {
            init: 0,
            async: true,
            get: async () => {
              let p;
              p = new qx.Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1200);
              });
              return p;
            },
            apply: async () => {
              let p;
              p = new qx.Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1200);
              });
              return p;
            }
          }
        }
      });

      //
      // Simulate qx.data.Array to demonstrate native-like access to array elements
      //
      qx.Class.define("qx.test.cpnfv8.Arr", {
        extend: qx.test.cpnfv8.Object,

        // Show how qx.data.Array could be indexed rather than getItem()
        delegate: {
          get(prop) {
            // If the property is a number or string representing a number...
            if (+prop === +prop) {
              // ... then use the method for retrieving an item
              return this.getItem(prop);
            } else {
              // otherwise, use the default action
              return this[prop];
            }
          },

          set(prop, value) {
            // If the property is a number or string representing a number...
            if (+prop === +prop) {
              // ... then use the method for modifying an item
              this.setItem(prop, value);
            } else {
              // otherwise, use the default action
              this[prop] = value;
            }
          },

          delete(prop) {
            this.remove(prop);
          }
        },

        properties: {
          arr: {
            initFunction(key) {
              console.log(
                `Allocating a new array object for property '${key}'`
              );

              return [];
            }
          }
        },

        construct() {
          super();
          for (let i = 0; i < 3; i++) {
            this.setItem(i, "Item " + i);
          }
        },

        members: {
          getItem(i) {
            return this.getArr()[i];
          },

          setItem(i, value) {
            this.getArr()[i] = value;
          },

          remove(i) {
            var index = i in this.getArr() ? i : -1;

            if (index != -1) {
              this.getArr().splice(index, 1);
              return i;
            }

            return undefined;
          }
        }
      });

      qx.Class.define("qx.test.cpnfv8.Singleton", {
        type: "singleton",
        extend: qx.test.cpnfv8.Superclass,

        construct() {
          super(true);
          console.log(
            `constructor displayname: ${this.constructor.$$displayName}`
          );

          console.log(`instance displayname: ${this.$$displayName}`);
        }
      });

      qx.Class.define("qx.test.cpnfv8.Abstract", {
        type: "abstract",
        extend: qx.test.cpnfv8.Superclass,

        construct() {
          super(true);
          console.log(`$displayname: ${this.$$displayName}`);
        },

        members: {
          doSomething() {
            throw new Error(`${this.$$displayName} is abstract}`);
          }
        }
      });

      qx.Class.define("qx.test.cpnfv8.SubclassOfAbstract", {
        extend: qx.test.cpnfv8.Abstract,

        environment: {
          "qx.test.cpnfv8.greeting": "hi there"
        },

        properties: {
          recentGreeting: {
            check: "String",
            init: "uninitialized"
          }
        },

        events: {
          myNormalEvent: "qx.event.type.Event",
          myDataEvent: "qx.event.type.Data"
        },

        members: {
          getGreeting() {
            this.recentGreeting = qx.core.Environment.get(
              "qx.test.cpnfv8.greeting"
            );

            return this.getRecentGreeting();
          }
        },

        defer(clazz, members, properties) {
          // console.log("Class keys:");
          // Object.keys(clazz).forEach((key) => console.log(`\t${key}`));
          // console.log("Member keys:");
          // Object.keys(members).forEach((key) => console.log(`\t${key}`));
          // console.log("Propeties:");
          // console.log(JSON.stringify(properties, null, "  "));
        }
      });

      qx.Class.define("qx.test.cpnfv8.ImmutableArray", {
        extend: qx.test.cpnfv8.Object,

        properties: {
          a: {
            check: "Array",
            initFunction: () => [],
            storage: qx.core.propertystorage.ImmutableArray
          }
        }
      });

      qx.Class.define("qx.test.cpnfv8.ImmutableObject", {
        extend: qx.test.cpnfv8.Object,

        properties: {
          a: {
            check: "Object",
            initFunction: () => {
              let ret = {};
              return ret;
            },
            immutable: "replace"
            // storage : qx.core.propertystorage.ImmutableObject // same as immutable:"replace"
          }
        }
      });
    },

    tearDown() {
      qx.Class.undefine("qx.test.cpnfv8.Object");
      qx.Class.undefine("qx.test.cpnfv8.Superclass");
      qx.Class.undefine("qx.test.cpnfv8.ExternalStorage");
      qx.Class.undefine("qx.test.cpnfv8.Subclass");
      qx.Class.undefine("qx.test.cpnfv8.Arr");
      qx.Class.undefine("qx.test.cpnfv8.Singleton");
      qx.Class.undefine("qx.test.cpnfv8.Abstract");
      qx.Class.undefine("qx.test.cpnfv8.SubclassOfAbstract");
      qx.Class.undefine("qx.test.cpnfv8.ImmutableArray");
      qx.Class.undefine("qx.test.cpnfv8.ImmutableObject");
      qx.Class.undefine("qx.test.cpnfv8.ToBeUndefined");
    },

    testClassUndefine() {
      qx.Class.define("qx.test.cpnfv8.ToBeUndefined", {
        extend: qx.test.cpnfv8.Object
      });

      this.assertNotUndefined(
        window.qx.test.cpnfv8.ToBeUndefined,
        "qx.test.cpnfv8.ToBeUndefined exists"
      );

      qx.Class.undefine("qx.test.cpnfv8.ToBeUndefined");

      this.assertUndefined(
        window.qx.test.cpnfv8.ToBeUndefined,
        "qx.test.cpnfv8.ToBeUndefined no longer exists"
      );
    },

    testImmutableArray() {
      let immutableArray = new qx.test.cpnfv8.ImmutableArray();
      let a1 = immutableArray.a;
      console.log(`immutable array a1=`, a1);
      immutableArray.a = [10, 20];
      let a2 = immutableArray.a;
      console.log(`immutable array a2=`, a2);
      this.assertIdentical(
        a1,
        a2,
        "immutable array remains unchanged after set"
      );
    },

    testImmutableObject() {
      let immutableObject = new qx.test.cpnfv8.ImmutableObject();
      let o1 = immutableObject.a;
      console.log(`immutable object o1=`, o1);
      immutableObject.a = { x: 10, y: 20 };
      let o2 = immutableObject.a;
      console.log(`immutable object o2=`, o2);
      this.assertIdentical(
        o1,
        o2,
        "immutable object remains unchanged after set"
      );
    },

    testMemberVariableAccess() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);
      this.assertEquals(23, superinstance.num, "superinstance.num == 23");
      this.assertEquals(
        "hello world",
        superinstance.str,
        "superinstance.str == 'hello world'"
      );
    },

    testPropertySetGetFunctionalAndFirstClass() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      this.assertFalse(
        superinstance.getRunning(),
        "running initial value (functional) === false"
      );

      this.assertFalse(
        superinstance.running,
        "running initial value (first class) === false"
      );

      // Test functional property set
      superinstance.setRunning(true);

      this.assertTrue(
        superinstance.getRunning(),
        "running after setter (functional) === true"
      );

      this.assertTrue(
        superinstance.running,
        "running after setter (first class) === true"
      );

      superinstance.running = false;
      this.assertFalse(
        superinstance.getRunning(),
        "running after assignment (functional) === false"
      );

      this.assertFalse(
        superinstance.running,
        "running after assignment (first class) === false"
      );

      // test check: "Boolean"'s togglePropertyName and isPropertyName functions
      superinstance.toggleRunning();
      this.assertTrue(superinstance.running, "running after toggle === true");
      this.assertTrue(
        superinstance.isRunning(),
        "isRunning() after toggle === true"
      );
    },

    testSubinstance() {
      let subinstance = new qx.test.cpnfv8.Subclass(23, true);

      this.assertEquals(
        "I am static",
        qx.test.cpnfv8.Subclass.staticEntry,
        "staticEntry === 'I am static'"
      );

      this.assertEquals(23, subinstance.num, "sub num === 23");
      subinstance.num = 24;
      this.assertEquals(24, subinstance.num, "sub num === 24");
      this.assertEquals(
        "hello world",
        subinstance.str,
        "sub str == 'hello world'"
      );

      this.assertTrue(subinstance.getRunning(), "sub getRunning() === true");
      subinstance.running = false;
      this.assertFalse(
        subinstance.getRunning(),
        "sub after setting to false, sub getRunning() === false"
      );
    },

    testExternalStorage() {
      let subinstance = new qx.test.cpnfv8.Subclass(23, true);

      this.assertEquals(
        10,
        qx.test.cpnfv8.ExternalStorage._subclassStorage.externallyStored,
        "initial value of externallyStored === 10"
      );

      subinstance.externallyStored = 20;

      this.assertEquals(
        20,
        qx.test.cpnfv8.ExternalStorage._subclassStorage.externallyStored,
        "post-change value of externallyStored === 20"
      );

      this.assertEquals(
        20,
        subinstance.externallyStored,
        "retrieved value of externallyStored === 20"
      );
    },

    // Demonstrate how qx.data.Array could be modified so that its
    // getter and setter for array elements could be via first-class
    // access rather than functional, e.g., `arr[3] = 23;` instead of
    // `arr.setItem(3, 23);`. As of the time of writing (Version 8.0),
    // qx.data.Array has not yet been so modified, as confirming that
    // it doesn't break anything and writing tests for it will be a
    // deep rabbit hole to explore.
    testQxDataArraySimulationFirstClassAccess() {
      let arr = new qx.test.cpnfv8.Arr();

      arr.setItem(3, 42);
      this.assertEquals(
        "Item 0,Item 1,Item 2,42",
        arr.getArr().toString(),
        "arr.getArr() === 'Item 0,Item 1,Item 2,42'"
      );

      console.log("\nAbout to set arr[3] = 23");
      arr[3] = 23;
      console.log("\nJust set arr[3] = 23");
      console.log("arr=", arr.getArr());

      this.assertEquals(23, arr[3], "arr[3]=23 yields arr[3] === 23");
      this.assertEquals(
        "Item 0,Item 1,Item 2,23",
        arr.getArr().toString(),
        "arr.getArr() === 'Item 0,Item 1,Item 2,23'"
      );

      console.log("\nAbout to delete arr[2]");
      delete arr[2];
      this.assertEquals(
        "Item 0,Item 1,23",
        arr.getArr().toString(),
        "arr.getArr() === 'Item 0,Item 1,23'"
      );
    },

    testNativeClassExtend() {
      class NativeClass extends qx.test.cpnfv8.Subclass {
        constructor(num = 13) {
          super(num, false);
          qx.core.Assert.assertEquals(
            num,
            this.num,
            `native class super(): num === ${num}`
          );

          this.num = 42;
          qx.core.Assert.assertEquals(
            42,
            this.num,
            "native class assignment: num === 42"
          );
        }
      }

      let native = new NativeClass(23);

      // if (!qx.Bootstrap._allowedNonStaticKeys.extendNativeClass) {
      //   // As of Version 8.0, extending a native class is not
      //   // operational, and this test is skipped.
      //   this.skip();
      // }

      // qx.test.cpnfv8.SubNative = qx.Class.define(null, {
      //   extend: NativeClass,
      //   extendNativeClass: true,

      //   construct() {
      //     super();
      //     qx.core.Assert.assertEquals(
      //       42,
      //       this.num,
      //       "Class extended from native class: this.num === 42"
      //     );
      //   }
      // });

      // let subNativeClass = new qx.test.cpnfv8.SubNative();
    },

    testSingleton() {
      try {
        let singleton = new qx.test.cpnfv8.Singleton();

        // Fail. Shoould not have gotten here. Should have thrown.
        this.assertTrue(
          false,
          "new qx.test.cpnfv8.Singleton() threw as expected"
        );
      } catch (e) {
        // This is the success case. `new qx.test.cpnfv8.Singleton()` should have thrown.
        this.assertTrue(
          true,
          "new qx.test.cpnfv8.Singleton() threw as expected"
        );
      }

      let singleton = qx.test.cpnfv8.Singleton.getInstance();
      this.assertTrue(true, "qx.test.cpnfv8.Singleton.getInstance() succeeded");
    },

    testAbstractClass() {
      try {
        let abstractClass = new qx.test.cpnfv8.AbstractClass();

        // Fail. Shoould not have gotten here. Should have thrown.
        this.assertTrue(false, "new qx.test.cpnfv8.Abstract() threw");
      } catch (e) {
        // This is the success case. `new qx.test.cpnfv8.Abstract()` should have thrown.
        this.assertTrue(true, "new qx.test.cpnfv8.Abstract() threw");
      }

      try {
        let subclassOfAbstract = new qx.test.cpnfv8.SubclassOfAbstract();
        this.assertTrue(
          true,
          "new qx.test.cpnfv8.SubclassOfAbstract() succeeded"
        );

        // Test environment settings
        let greeting = subclassOfAbstract.getGreeting();
        this.assertEquals(
          "hi there",
          greeting,
          "greeting from environment === 'hi there'"
        );

        // Ensure events got added
        this.assertEquals(
          "{" +
            '"changeRecentGreeting":"qx.event.type.Data",' +
            '"myNormalEvent":"qx.event.type.Event",' +
            '"myDataEvent":"qx.event.type.Data"' +
            "}",
          JSON.stringify(subclassOfAbstract.constructor.$$events),
          "events list is created correctly"
        );
      } catch (e) {
        this.assertTrue(
          false,
          "new qx.test.cpnfv8.SubclassOfAbstract() succeeded"
        );
      }
    },

    testNullable() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      try {
        superinstance.nullableProp = null;
        this.assertTrue(true, "nullable property can be set to null");
      } catch (e) {
        this.assertTrue(false, "nullable property can be set to null");
      }

      try {
        superinstance.nonNullableProp = null;
        this.assertTrue(false, "non-nullable property can not be set to null");
      } catch (e) {
        this.assertTrue(true, "non-nullable property can not be set to null");
      }
    },

    testValidate() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      try {
        superinstance.positive = 1;
        this.assertTrue(true, "validated property can be set to legal value");
      } catch (e) {
        this.assertTrue(false, "validated property can be set to legal value");
      }

      try {
        superinstance.setPositive(-1);
        this.assertTrue(
          false,
          "validated property can not be set to illegal value"
        );
      } catch (e) {
        this.assertTrue(
          true,
          "validated property can not be set to illegal value"
        );
      }
    },

    testReadOnly() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      try {
        superinstance.readOnly = 0;
        this.assertTrue(false, "readonly property can not be set");
      } catch (e) {
        this.assertTrue(true, "readonly property can not be set", true);
      }
    },

    testChecks() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      try {
        superinstance.running = 23;
        this.assertTrue(false, "check 'Boolean' failed as it should");
      } catch (e) {
        this.assertTrue(true, "check 'Boolean' failed as it should");
      }

      try {
        superinstance.running = true;
        superinstance.running = false;
        this.assertTrue(true, "check 'Boolean' succeeded as it should");
      } catch (e) {
        this.assertTrue(false, "check 'Boolean' succeded as it should");
      }

      try {
        superinstance.jsdocProp = [2, 4, 6];
        this.assertTrue(
          false,
          "check JSDoc failed as expected (not yet implemented)"
        );
      } catch (e) {
        this.assertTrue(
          true,
          "check JSDoc failed as expected (not yet implemented)"
        );
      }

      try {
        superinstance.mustBe42 = 42;
        this.assertTrue(true, "check-string succeeded as it should");
      } catch (e) {
        this.assertTrue(false, "check-string succeeded as it should");
      }

      try {
        superinstance.mustBe42 = 43;
        this.assertTrue(false, "check-string failed as it should");
      } catch (e) {
        this.assertTrue(true, "check-string failed as it should");
      }
    },

    testPropertyDescriptor() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);
      let propertyDescriptorPositive =
        superinstance.getPropertyDescriptor("positive");

      console.log("Property descriptor=", propertyDescriptorPositive);
      superinstance.positive = 1;
      propertyDescriptorPositive.set(2);
      this.assertEquals(
        2,
        superinstance.positive,
        "property descriptor set works"
      );
    },

    testMemberDetectSameClassProperty() {
      try {
        let clazz = qx.Class.define(null, {
          extend: qx.core.Object,
          members: {
            x: 23
          },

          properties: {
            x: { init: 42 }
          }
        });

        // class definition should have have thrown; should not get here
        throw new Error("Failed to detect same name in member and property");
      } catch (e) {
        this.assertEquals(
          'Error: null: Overwriting member "x" with property "x"',
          e.toString(),
          "Property and member of same name in same class not detected"
        );
      }
    },

    testMemberDetectSuperclassProperty() {
      try {
        let clazzA = qx.Class.define(null, {
          extend: qx.core.Object,
          properties: {
            x: { init: 42 }
          }
        });

        let clazzB = qx.Class.define(null, {
          extend: clazzA,
          members: {
            x: 23
          }
        });

        // class definition should have have thrown; should not get here
        throw new Error(
          "Failed to detect same name in member and superclass property"
        );
      } catch (e) {
        this.assertEquals(
          'Error: Overwriting member or property "x" of Class "null" is not allowed. ' +
            "(Members and properties are in the same namespace.)",
          e.toString(),
          "Member of same name as property in superclass not detected"
        );
      }
    },

    testPropertyDetectSuperclassMember() {
      try {
        let clazzA = qx.Class.define(null, {
          extend: qx.core.Object,
          members: {
            x: 23
          }
        });

        let clazzB = qx.Class.define(null, {
          extend: clazzA,
          properties: {
            x: { init: 42 }
          }
        });

        // class definition should have have thrown; should not get here
        throw new Error(
          "Failed to detect same name in member and superclass property"
        );
      } catch (e) {
        this.assertEquals(
          'Error: Overwriting member or property "x" of Class "null" is not allowed. ' +
            "(Members and properties are in the same namespace.)",
          e.toString(),
          "Member of same name as property in superclass not detected"
        );
      }
    },

    testMemberOverloadObjectName() {
      try {
        let clazzA = qx.Class.define(null, {
          extend: qx.core.Object,
          members: {
            toString() {
              return "clazzA";
            }
          }
        });

        let instance = new clazzA();
        this.assertEquals("clazzA", instance.toString());
      } catch (e) {
        throw new Error("Failed to allow  member overload of Object method");
      }
    },

    testPropertyOverloadObjectNameNoRefine() {
      try {
        let clazzA = qx.Class.define(null, {
          extend: qx.core.Object,
          properties: {
            toString: { init: () => "clazzA" }
          }
        });

        // class definition should have have thrown; should not get here
        throw new Error("Failed to detect Object method name in properties");
      } catch (e) {
        this.assertEquals(
          'Error: Overwriting member or property "toString" of Class "null" is not allowed. ' +
            "(Members and properties are in the same namespace.)",
          e.toString(),
          "Property of same name as Object method"
        );
      }
    },

    testPropertyOverloadObjectNameWithRefine() {
      try {
        let clazzA = qx.Class.define(null, {
          extend: qx.core.Object,
          properties: {
            toString: { refine: true, init: () => "clazzA" }
          }
        });

        // class definition should have have thrown; should not get here
        throw new Error("Failed to detect Object method name in properties");
      } catch (e) {
        this.assertEquals(
          'Error: Overwriting member or property "toString" of Class "null" is not allowed. ' +
            "(Members and properties are in the same namespace.)",
          e.toString(),
          "Property of same name as Object method"
        );
      }
    }
  }
});
