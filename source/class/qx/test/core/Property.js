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
 * @ignore(qx.test.cpnfv8.*)
 */

qx.Class.define("qx.test.core.Property", {
  extend: qx.dev.unit.TestCase,

  members: {
    setUp() {
      qx.Class.define("qx.test.cpnfv8.Object", {
        extend: qx.core.Object
      });

      qx.Class.define("qx.test.cpnfv8.Superclass", {
        extend: qx.test.cpnfv8.Object,

        construct(bRunning = true) {
          super();
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

          anyProp: {
            init: null,
            nullable: true
          },

          asyncProp: {
            init: null,
            nullable: true,
            check: "Number"
          },

          promiseProp: {
            check: "Promise"
          },

          mustBe42: {
            init: 0,
            check: v => v === 42
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
              throw new Error("superclass: _applyRunning called with identical value");
            }

            console.log(`superclass apply running: value changing from ${old} to ${value}`);
          }
        }
      });

      qx.Bootstrap.define("qx.test.cpnfv8.ExternalStorage", {
        extend: Object,
        implement: qx.core.property.IPropertyStorage,

        members: {
          /**@override */
          init(prop, property) {
            qx.test.cpnfv8.ExternalStorage._subclassStorage = {
              externallyStored: 0
            };
          },

          /**@override */
          getAsync() {},

          /**@override */
          setAsync() {},

          /**@override */
          reset(thisObj, property, value) {
            console.log("in externallyStored reset");
            qx.test.cpnfv8.ExternalStorage._subclassStorage[property.getPropertyName()] = value;
          },

          /**@override */
          isAsyncStorage() {
            return false;
          },

          /**@override */
          get(thisObj, prop) {
            console.log("in externallyStored getter");
            return qx.test.cpnfv8.ExternalStorage._subclassStorage[prop.getPropertyName()];
          },

          /**@override */
          set(thisObj, property, value) {
            console.log("in externallyStored setter");
            qx.test.cpnfv8.ExternalStorage._subclassStorage[property.getPropertyName()] = value;
          },

          /**@override */
          dereference(prop, property) {}
        },

        statics: {
          _subclassStorage: {}
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
            console.log(`subclass apply running: value changing from ${old} to ${value}`);

            super._applyRunning(value, old);
          }
        },

        properties: {
          externallyStored: {
            init: 10,
            storage: qx.test.cpnfv8.ExternalStorage
          },

          delay: {
            init: 0,
            async: true,
            getAsync: async (prop, self) => {
              let p;
              p = new qx.Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1200);
              });
              return p;
            },
            apply: () =>
              new qx.Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve(true);
                }, 1200);
              })
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
              console.log(`Allocating a new array object for property '${key}'`);

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
          console.log(`constructor displayname: ${this.constructor.$$displayName}`);

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
            this.recentGreeting = qx.core.Environment.get("qx.test.cpnfv8.greeting");

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
            storage: qx.core.property.ImmutableArrayStorage
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
            // storage : qx.core.property.ImmutableObjectStorage // same as immutable:"replace"
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

    testBasic() {
      // Check instance
      var inst = new qx.test.core.PropertyHelper();
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

    testBuiltinTypes() {
      // Check instance
      var inst = new qx.test.core.PropertyHelper();
      this.assertNotUndefined(inst, "instance");

      // Type checks: String
      this.assertIdentical(
        "Hello",
        inst.setStringProp("Hello"),
        "string property, set"
      );

      this.assertIdentical(
        "Hello",
        inst.getStringProp(),
        "string property, get"
      );

      // Type checks: Boolean, true
      this.assertIdentical(
        true,
        inst.setBooleanProp(true),
        "boolean property, set"
      );

      this.assertIdentical(
        true,
        inst.getBooleanProp(),
        "boolean property, get"
      );

      // Type checks: Boolean, false
      this.assertIdentical(
        false,
        inst.setBooleanProp(false),
        "boolean property, set"
      );

      this.assertIdentical(
        false,
        inst.getBooleanProp(),
        "boolean property, get"
      );

      // Type checks: Number, int
      this.assertIdentical(3, inst.setNumberProp(3), "number property, set");
      this.assertIdentical(3, inst.getNumberProp(), "number property, get");

      // Type checks: Number, float
      this.assertIdentical(
        3.14,
        inst.setNumberProp(3.14),
        "number property, set"
      );

      this.assertIdentical(3.14, inst.getNumberProp(), "number property, get");

      // Type checks: Object, inline
      var obj = {};
      this.assertIdentical(
        obj,
        inst.setObjectProp(obj),
        "object property, set"
      );

      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Object, new
      var obj = new Object();
      this.assertIdentical(
        obj,
        inst.setObjectProp(obj),
        "object property, set"
      );

      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Array, inline
      var arr = [];
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      // Type checks: Array, new
      var arr = new Array();
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      inst.dispose();
    },

    testInheritance() {
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

      ch2.setEnabled(false); // reset local value
      this.assertFalse(chh1.getEnabled(), "d2");
      ch2.setEnabled("inherit");
      this.assertTrue(ch2.getEnabled(), "c2");
      this.assertTrue(chh1.getEnabled(), "c2");

      pa.dispose();
      ch1.dispose();
      ch2.dispose();
      ch3.dispose();
      chh1.dispose();
      chh2.dispose();
      chh3.dispose();
    },

    testParent() {
      var pa = new qx.test.core.InheritanceDummy();
      var ch1 = new qx.test.core.InheritanceDummy();
      var ch2 = new qx.test.core.InheritanceDummy();
      var ch3 = new qx.test.core.InheritanceDummy();

      this.assertIdentical(pa.getEnabled(), null, "d1");
      this.assertIdentical(ch1.getEnabled(), null, "d2");
      this.assertIdentical(ch2.getEnabled(), null, "d3");
      this.assertIdentical(ch3.getEnabled(), null, "d4");

      pa.add(ch1);

      this.assertTrue(pa.setEnabled(true), "a1"); // ch1 gets enabled, too
      this.assertFalse(ch3.setEnabled(false), "a2");

      this.assertTrue(pa.getEnabled(), "b1");
      this.assertTrue(ch1.getEnabled(), "b2");
      this.assertIdentical(ch2.getEnabled(), null, "b3");
      this.assertFalse(ch3.getEnabled(), "b4");

      pa.add(ch2); // make ch2 enabled_ through inheritance
      pa.add(ch3); // keep ch2 disabled, user value has higher priority

      this.assertTrue(pa.getEnabled(), "c1");
      this.assertTrue(ch1.getEnabled(), "c2");
      this.assertTrue(ch2.getEnabled(), "c3");
      this.assertFalse(ch3.getEnabled(), "c4");

      pa.dispose();
      ch1.dispose();
      ch2.dispose();
      ch3.dispose();
    },

    testMultiValues() {
      // Check instance
      var inst = new qx.test.core.PropertyHelper();
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
      this.assertIdentical(
        inst.setThemedAppearanceProp("black"),
        "black",
        "c1"
      );

      this.assertIdentical(inst.getAppearanceProp(), "black", "c2");
      this.assertIdentical(inst.setAppearanceProp("white"), "white", "c3");
      this.assertIdentical(inst.getAppearanceProp(), "white", "c4");
      this.assertIdentical(inst.resetAppearanceProp(), undefined, "c5");
      this.assertIdentical(inst.getAppearanceProp(), "black", "c6");

      // No prop
      this.assertIdentical(inst.getNoProp(), null, "c1");

      inst.dispose();
    },

    testInitApply() {
      var inst = new qx.test.core.PropertyHelper();
      this.assertNotUndefined(inst, "instance");

      this.assertUndefined(inst.lastApply);
      this.assertEquals("hello", inst.getInitApplyProp3(), "init value");
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

    testInit() {
      // now test the init functions
      var self = this;
      var inst = new qx.test.core.PropertyHelper(function (inst) {
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

    testDefinesThanSubClassWithInterface() {
      // see bug #2162 for details
      if (qx.test.A) {
        qx.Class.undefine("qx.test.A");
        delete qx.test.A;
      }
      if (qx.test.B) {
        qx.Class.undefine("qx.test.B");
        delete qx.test.B;
      }

      qx.Class.define("qx.test.A", {
        extend: qx.core.Object,

        properties: {
          enabled: {}
        }
      });

      var a = new qx.test.A();

      qx.Interface.define("qx.test.IForm", {
        members: {
          setEnabled(value) {}
        }
      });

      qx.Class.define("qx.test.B", {
        extend: qx.test.A,
        implement: qx.test.IForm
      });

      var b = new qx.test.B();
      b.setEnabled(true);
      a.dispose();
      b.dispose();
    },

    // BC break for qooxdoo v8: properties, members, and internals are
    // all in the same namespace now. `classname` is an internal member
    // name, so can't be used as a property name.
    // testPropertyNamedClassname() {
    //   qx.Class.define("qx.test.clName", {
    //     extend: qx.core.Object,
    //     properties: {
    //       classname: {}
    //     }
    //   });

    //   delete qx.test.clName;
    // },

    testWrongPropertyDefinitions() {
      if (qx.core.Environment.get("qx.debug")) {
        // class config maps must be separately defined to not produce compiler errors

        // date
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: new Date()
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("Invalid key.*The value needs to be a map"),
          "123"
        );

        delete qx.test.clName;

        // array
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: [1, 2, 3]
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("Invalid key.*The value needs to be a map"),
          "123"
        );

        delete qx.test.clName;

        // qooxdoo class
        var o = new qx.core.Object();
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: o
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("Can't use qx.core.Object descendent as property map"),
          "123"
        );

        delete qx.test.clName;
        o.dispose();

        // RegExp
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: new RegExp()
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("Invalid key.*The value needs to be a map"),
          "123"
        );

        delete qx.test.clName;

        // null
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: null
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("Invalid key.*The value needs to be a map"),
          "123"
        );

        delete qx.test.clName;

        // boolean
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: true
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("typeof value for key.* must be"),
          "123"
        );

        delete qx.test.clName;

        // number
        this.assertException(
          function () {
            var config = {
              extend: qx.core.Object,
              properties: 123
            };

            qx.Class.define("qx.test.clName", config);
          },
          Error,
          new RegExp("typeof value for key.* must be"),
          "123"
        );

        delete qx.test.clName;
      }
    },

    testRecursive() {
      qx.Class.undefine("qx.Node");
      qx.Class.define("qx.Node", {
        extend: qx.core.Object,

        construct() {
          super();
          this._min = 0;
        },

        properties: {
          value: { apply: "applyValue" }
        },

        members: {
          applyValue(value, old) {
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

    testEventWithInitOldData() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,

        properties: {
          prop: {
            check: "Boolean",
            init: false,
            event: "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertFalse(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(true);
        },
        function (e) {
          self.assertTrue(e.getData(), "Wrong data in the event!");
          self.assertFalse(e.getOldData(), "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      object.dispose();
    },

    testEventWithoutInitOldData() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,

        properties: {
          prop: {
            check: "Boolean",
            nullable: true,
            event: "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertNull(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(true);
        },
        function (e) {
          self.assertTrue(e.getData(), "Wrong data in the event!");
          self.assertNull(e.getOldData(), "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      object.dispose();
    },

    testEventWithInitAndInheritableOldData() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,

        properties: {
          prop: {
            check: "Boolean",
            init: false,
            inheritable: true,
            event: "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertFalse(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(true);
        },
        function (e) {
          self.assertTrue(e.getData(), "Wrong data in the event!");
          self.assertFalse(e.getOldData(), "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      object.dispose();
    },

    testEventWithoutInitAndInheritableOldData() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,

        properties: {
          prop: {
            check: "Boolean",
            nullable: true,
            inheritable: true,
            event: "changeProp"
          }
        }
      });

      var object = new qx.TestProperty();

      // test for the default (false)
      this.assertNull(object.getProp());

      // check for the event
      var self = this;
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(true);
        },
        function (e) {
          self.assertTrue(e.getData(), "Wrong data in the event!");
          self.assertNull(e.getOldData(), "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

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
    __isNegativeZero(value) {
      return value === 0 && 1 / value < 0; // 1/-0 => -Infinity
    },

    /**
     * Check whether the (numeric) value is positive zero (+0)
     *
     * @param value {number} Value to check
     * @return {Boolean} whether the value is <code>+0</code>
     */
    __isPositiveZero(value) {
      return value === 0 && 1 / value > 0; // 1/+0 => +Infinity
    },

    testWrongIsEqualDefinitions() {
      if (qx.core.Environment.get("qx.debug")) {
        var re = new RegExp("defined with wrong value type for key 'isEqual'");
        var o = new qx.core.Object();

        [
          new Date(), // date
          [1, 2, 3], // array
          {}, // object
          o, // qooxdoo class
          new RegExp(), // RegExp
          null, // null
          true,
          false, // boolean
          123 // number
        ].forEach(function (isEqualTestValue, i) {
          var msg = "case[" + i + "] (" + String(isEqualTestValue) + ")";
          this.assertException(
            function () {
              qx.Class.undefine("qx.TestProperty");
              qx.Class.define("qx.TestProperty", {
                extend: qx.core.Object,
                properties: {
                  prop: {
                    check: "Number",
                    isEqual: isEqualTestValue
                  }
                }
              });

              new qx.TestProperty().set({ prop: 0 });
            },
            Error,
            re,
            msg
          );

          qx.Class.undefine("qx.TestProperty");
        }, this);

        o.dispose();
      } // end-if (qx.core.Environment.get("qx.debug"))
    },

    testIsEqualInline() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual: "Object.is(a, b)"
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
      this.assertEventNotFired(
        object,
        "changeProp",
        function () {
          object.setProp(0);
          object.setProp(+0);
        },
        function (e) {},
        "'changeProp' event fired!"
      );

      // Change expected
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(-0);
        },
        function (e) {
          var isNegativeZero = self.__isNegativeZero(e.getData());
          var isPositiveZero = self.__isPositiveZero(e.getOldData());
          self.assertTrue(isNegativeZero, "Wrong data in the event!");
          self.assertTrue(isPositiveZero, "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },

    testIsEqualFunction() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual(x, y) {
              return Object.is(x, y);
            }
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
      this.assertEventNotFired(
        object,
        "changeProp",
        function () {
          object.setProp(0);
          object.setProp(+0);
        },
        function (e) {},
        "'changeProp' event fired!"
      );

      // Change expected
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(-0);
        },
        function (e) {
          var isNegativeZero = self.__isNegativeZero(e.getData());
          var isPositiveZero = self.__isPositiveZero(e.getOldData());
          self.assertTrue(isNegativeZero, "Wrong data in the event!");
          self.assertTrue(isPositiveZero, "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },

    testIsEqualMember() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual: "__fooBar"
          }
        },

        members: {
          __fooBar(foo, bar) {
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
      this.assertEventNotFired(
        object,
        "changeProp",
        function () {
          object.setProp(0);
          object.setProp(+0);
        },
        function (e) {},
        "'changeProp' event fired!"
      );

      // Change expected
      this.assertEventFired(
        object,
        "changeProp",
        function () {
          object.setProp(-0);
        },
        function (e) {
          var isNegativeZero = self.__isNegativeZero(e.getData());
          var isPositiveZero = self.__isPositiveZero(e.getOldData());
          self.assertTrue(isNegativeZero, "Wrong data in the event!");
          self.assertTrue(isPositiveZero, "Wrong old data in the event!");
        },
        "Change event not fired!"
      );

      // @todo: check 'apply' and 'transform', too

      object.dispose();
    },

    testIsEqualInlineContext() {
      var context, object;

      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual: "(this._checkCtx(a,b))"
          }
        },

        members: {
          _checkCtx(foo, bar) {
            context = this;
          }
        }
      });

      object = new qx.TestProperty();
      object.set({ prop: 4711 });

      this.assertIdentical(object, context);

      object.dispose();
    },

    testIsEqualFunctionContext() {
      var context, object;

      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual(x, y) {
              context = this;
            }
          }
        }
      });

      object = new qx.TestProperty().set({ prop: 4711 });

      this.assertIdentical(object, context);

      object.dispose();
    },

    testIsEqualMemberContext() {
      var context, object;

      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual: "__checkCtx"
          }
        },

        members: {
          __checkCtx(foo, bar) {
            context = this;
          }
        }
      });

      object = new qx.TestProperty().set({ prop: 4711 });

      this.assertIdentical(object, context);

      object.dispose();
    },

    testIsEqualBaseClassMember() {
      var context, object;

      qx.Class.undefine("qx.Super");
      qx.Class.define("qx.Super", {
        extend: qx.core.Object,
        members: {
          __checkCtx(foo, bar) {
            context = this;
          }
        }
      });

      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.Super,
        properties: {
          prop: {
            check: "Number",
            nullable: true,
            event: "changeProp",
            isEqual: "__checkCtx"
          }
        }
      });

      object = new qx.TestProperty().set({ prop: 4711 });

      this.assertIdentical(object, context);

      object.dispose();
    },

    testTransform() {
      qx.Class.undefine("qx.TestProperty");
      qx.Class.define("qx.TestProperty", {
        extend: qx.core.Object,
        construct() {
          super();
          this.initPropTwo(new qx.data.Array());
        },
        properties: {
          prop: {
            check: "qx.data.Array",
            nullable: true,
            event: "changeProp",
            transform: "__transform"
          },

          propTwo: {
            check: "qx.data.Array",
            nullable: true,
            event: "changePropTwo",
            transform: "__transform",
            deferredInit: true
          }
        },

        members: {
          __transform(value, oldValue) {
            if (oldValue === undefined) {
              return value;
            }
            if (!value) {
              oldValue.removeAll();
            } else {
              oldValue.replace(value);
            }
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
      this.assertArrayEquals(["2", "3"], arr.toArray());

      var savePropTwo = object.getPropTwo();
      object.setPropTwo(arr2);
      this.assertIdentical(savePropTwo, object.getPropTwo());
      this.assertArrayEquals(["2", "3"], savePropTwo.toArray());
    },

    testPromises() {
      const promiseDelay = (delay, fn) =>
        new qx.Promise(resolve => {
          setTimeout(async () => {
            await fn();
            resolve();
          }, delay);
        });

      qx.Class.undefine("qxl.TestPromises");
      qx.Class.define("qxl.TestPromises", {
        extend: qx.core.Object,

        construct() {
          super();
          this.state = [];
        },

        properties: {
          propOne: {
            init: null,
            nullable: true,
            apply: "_applyPropOne",
            event: "changePropOne"
          },

          propTwo: {
            init: null,
            nullable: true,
            async: true,
            apply: "_applyPropTwo",
            event: "changePropTwo"
          }
        },

        members: {
          state: null,

          _applyPropOne(value) {
            promiseDelay(10, () => {
              this.state.push("apply-one");
            });
            return "apply-one";
          },
          async _applyPropTwo(value) {
            await promiseDelay(10, () => {
              this.state.push("apply-two");
            });
            return "apply-two";
          }
        }
      });

      const createTestPromise = () => {
        let tp = new qxl.TestPromises();
        tp.addListener("changePropOne", async evt => {
          await promiseDelay(1, () => {
            evt.getTarget().state.push("event-one");
          });
          return "event-one";
        });
        tp.addListener("changePropTwo", async evt => {
          await promiseDelay(1, () => {
            evt.getTarget().state.push("event-two");
          });
          return "event-two";
        });
        return tp;
      };

      const testImpl = async () => {
        let tmp;
        let tp;
        let result;

        tp = createTestPromise();
        tmp = tp.setPropOne(12);
        this.assertTrue(tmp === 12);
        this.assertArrayEquals(tp.state, []);

        tp = createTestPromise();
        tmp = tp.setPropOne(qx.Promise.resolve(14));
        this.assertTrue(qx.lang.Type.isPromise(tmp));
        this.assertArrayEquals(tp.state, []);

        tp = createTestPromise();
        tmp = tp.setPropTwoAsync(16);
        this.assertTrue(qx.lang.Type.isPromise(tmp));
        this.assertArrayEquals(tp.state, []);
        result = await tmp;
        this.assertTrue(result === 16);
        this.assertArrayEquals(tp.state, ["apply-two", "event-two"]);

        tp = createTestPromise();
        tmp = tp.setPropTwoAsync(qx.Promise.resolve(18));
        this.assertTrue(qx.lang.Type.isPromise(tmp));
        this.assertArrayEquals(tp.state, []);
        result = await tmp;
        this.assertTrue(result === 18);
        this.assertArrayEquals(tp.state, ["apply-two", "event-two"]);
      };
      testImpl().finally(() => this.resume());
      this.wait(1000);
    },

    testPseudoProperties() {
      let classPseudoProperty = qx.Class.define(null, {
        extend: qx.core.Object,

        events: {
          changePseudoProp: "qx.event.type.Data"
        },

        members: {
          __pseudoProp: 23,

          getPseudoProp() {
            return this.__pseudoProp;
          },

          setPseudoProp(value) {
            this.__pseudoProp = value;
          }
        }
      });

      let classPseudoPropertyNoEvent = qx.Class.define(null, {
        extend: qx.core.Object,

        members: {
          __pseudoProp: 23,

          getPseudoProp() {
            return this.__pseudoProp;
          },

          setPseudoProp(value) {
            this.__pseudoProp = value;
          }
        }
      });

      let classPseudoPropertyNoGetter = qx.Class.define(null, {
        extend: qx.core.Object,

        events: {
          changePseudoProp: "qx.event.type.Data"
        },

        members: {
          __pseudoProp: 23,

          setPseudoProp(value) {
            this.__pseudoProp = value;
          }
        }
      });

      let classPseudoPropertyNoSetter = qx.Class.define(null, {
        extend: qx.core.Object,

        events: {
          changePseudoProp: "qx.event.type.Data"
        },

        members: {
          __pseudoProp: 23,

          getPseudoProp() {
            return this.__pseudoProp;
          }
        }
      });

      let pp = new classPseudoProperty();
      this.assertEquals(23, pp.pseudoProp);
      pp.pseudoProp = 42;
      this.assertEquals(42, pp.pseudoProp);
      this.assertEquals(42, pp.getPseudoProp());

      pp = new classPseudoPropertyNoEvent();
      this.assertUndefined(pp.pseudoProp);

      pp = new classPseudoPropertyNoGetter();
      this.assertUndefined(pp.pseudoProp);

      pp = new classPseudoPropertyNoSetter();
      this.assertUndefined(pp.pseudoProp);
    },

    testImmutableArray() {
      let immutableArray = new qx.test.cpnfv8.ImmutableArray();
      let a1 = immutableArray.a;
      console.log(`immutable array a1=`, a1);
      immutableArray.a = [10, 20];
      let a2 = immutableArray.a;
      console.log(`immutable array a2=`, a2);
      this.assertIdentical(a1, a2, "immutable array remains unchanged after set");
    },

    testImmutableObject() {
      let immutableObject = new qx.test.cpnfv8.ImmutableObject();
      let o1 = immutableObject.a;
      console.log(`immutable object o1=`, o1);
      immutableObject.a = { x: 10, y: 20 };
      let o2 = immutableObject.a;
      console.log(`immutable object o2=`, o2);
      this.assertIdentical(o1, o2, "immutable object remains unchanged after set");
    },

    testMemberVariableAccess() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);
      this.assertEquals(23, superinstance.num, "superinstance.num == 23");
      this.assertEquals("hello world", superinstance.str, "superinstance.str == 'hello world'");
    },

    testPropertySetGetFunctionalAndFirstClass() {
      let superinstance = new qx.test.cpnfv8.Superclass(false);

      this.assertFalse(superinstance.getRunning(), "running initial value (functional) === false");

      this.assertFalse(superinstance.running, "running initial value (first class) === false");

      // Test functional property set
      superinstance.setRunning(true);

      this.assertTrue(superinstance.getRunning(), "running after setter (functional) === true");

      this.assertTrue(superinstance.running, "running after setter (first class) === true");

      superinstance.running = false;
      this.assertFalse(superinstance.getRunning(), "running after assignment (functional) === false");

      this.assertFalse(superinstance.running, "running after assignment (first class) === false");

      // test check: "Boolean"'s togglePropertyName and isPropertyName functions
      superinstance.toggleRunning();
      this.assertTrue(superinstance.running, "running after toggle === true");
      this.assertTrue(superinstance.isRunning(), "isRunning() after toggle === true");
    },

    testSubinstance() {
      let subinstance = new qx.test.cpnfv8.Subclass(23, true);

      this.assertEquals("I am static", qx.test.cpnfv8.Subclass.staticEntry, "staticEntry === 'I am static'");

      this.assertEquals(23, subinstance.num, "sub num === 23");
      subinstance.num = 24;
      this.assertEquals(24, subinstance.num, "sub num === 24");
      this.assertEquals("hello world", subinstance.str, "sub str == 'hello world'");

      this.assertTrue(subinstance.getRunning(), "sub getRunning() === true");
      subinstance.running = false;
      this.assertFalse(subinstance.getRunning(), "sub after setting to false, sub getRunning() === false");
    },

    testExternalStorage() {
      let subinstance = new qx.test.cpnfv8.Subclass(23, true);

      this.assertEquals(10, qx.test.cpnfv8.ExternalStorage._subclassStorage.externallyStored, "initial value of externallyStored === 10");

      subinstance.externallyStored = 20;

      this.assertEquals(
        20,
        qx.test.cpnfv8.ExternalStorage._subclassStorage.externallyStored,
        "post-change value of externallyStored === 20"
      );

      this.assertEquals(20, subinstance.externallyStored, "retrieved value of externallyStored === 20");
    },

    testNativeClassExtend() {
      class NativeClass extends qx.test.cpnfv8.Subclass {
        constructor(num = 13) {
          super(num, false);
          qx.core.Assert.assertEquals(num, this.num, `native class super(): num === ${num}`);

          this.num = 42;
          qx.core.Assert.assertEquals(42, this.num, "native class assignment: num === 42");
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
        this.assertTrue(false, "new qx.test.cpnfv8.Singleton() threw as expected");
      } catch (e) {
        // This is the success case. `new qx.test.cpnfv8.Singleton()` should have thrown.
        this.assertTrue(true, "new qx.test.cpnfv8.Singleton() threw as expected");
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
        this.assertTrue(true, "new qx.test.cpnfv8.SubclassOfAbstract() succeeded");

        // Test environment settings
        let greeting = subclassOfAbstract.getGreeting();
        this.assertEquals("hi there", greeting, "greeting from environment === 'hi there'");

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
        this.assertTrue(false, "new qx.test.cpnfv8.SubclassOfAbstract() succeeded");
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

      superinstance.positive = 2;
      this.assertEquals(2, superinstance.getPositive(), "property can be set natively");
      this.assertEquals(2, superinstance.positive, "property can be set natively");

      try {
        superinstance.setPositive(-1);
        this.assertTrue(false, "validated property can not be set to illegal value");
      } catch (e) {
        this.assertTrue(true, "validated property can not be set to illegal value");
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
        superinstance.running = "lalala";
        this.assertTrue(false, "check 'Boolean' failed as it should");
      } catch (e) {
        this.assertTrue(true, "check 'Boolean' failed as it should");
      }

      try {
        superinstance.running = true;
        superinstance.running = false;
        superinstance.running = "true";
        superinstance.running = 0;
        this.assertFalse(superinstance.running, "check 'Boolean' succeeded as it should");
        superinstance.running = -1;
        this.assertTrue(superinstance.running, "check 'Boolean' succeeded as it should");
        superinstance.running = 1;
        this.assertTrue(superinstance.running, "check 'Boolean' succeeded as it should");
        this.assertTrue(true, "check 'Boolean' succeeded as it should");
      } catch (e) {
        this.assertTrue(false, "check 'Boolean' succeded as it should");
      }

      superinstance.jsdocProp = [2, 4, 6];

      try {
        superinstance.mustBe42 = 42;
        this.assertTrue(true, "check-function succeeded as it should");
      } catch (e) {
        this.assertTrue(false, "check-function succeeded as it should");
      }

      try {
        superinstance.mustBe42 = 43;
        this.assertTrue(false, "check-function failed as it should");
      } catch (e) {
        this.assertTrue(true, "check-function failed as it should");
      }
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
          `Error: Overwriting member or property "x" of Class "null" is not allowed. (Members and properties are in the same namespace.)`,
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
        throw new Error("Failed to detect same name in member and superclass property");
      } catch (e) {
        this.assertEquals(
          'Error: null: Overwriting member or property "x" of Class "null" is not allowed! ' +
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
        throw new Error("Failed to detect same name in member and superclass property");
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
          'Error: Overwriting member or property "toString" of Class "null" is not allowed. (Members and properties are in the same namespace.)',
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
    },

    testSetAsPromise() {
      const doit = async () => {
        let a = new qx.test.cpnfv8.Superclass();
        let p = Promise.resolve("hello");
        a.setPromiseProp(p);
        this.assertEquals(p, a.getPromiseProp(), "setPromiseProp with Promise works");
        a.setAnyProp(Promise.resolve("hello"));
        try {
          a.setNullableProp(Promise.resolve(42));
          this.assertTrue(false, "Should throw an error when setting a Promise to a number property");
        } catch (ex) {
          this.assertTrue(true, "Should throw an error when setting a Promise to a number property");
        }

        try {
          await a.setAsyncPropAsync(Promise.resolve(42));
          this.assertTrue(false, "Should throw an error when setting a Promise to a number property");
        } catch (ex) {
          this.assertTrue(true, "Should throw an error when setting a Promise to a number property");
        }
      };

      doit().finally(() => {
        this.resume();
      });
      this.wait(1000);
    },

    testResetAsync() {
      let apply = 0;
      qx.Class.undefine("qx.test.cpnfv8.ResetAsyncTest");
      var Clazz = qx.Class.define("qx.test.cpnfv8.ResetAsyncTest", {
        extend: qx.core.Object,
        properties: {
          foo: {
            async: true,
            init: 7,
            apply: function (value, old) {
              return new qx.Promise((resolve, reject) => {
                setTimeout(() => {
                  apply++;
                  resolve(value);
                }, 100);
              });
            }
          }
        }
      });

      const doit = async () => {
        let instance = new Clazz();
        await instance.setFooAsync(42);
        await instance.resetFooAsync();
        this.assertEquals(7, instance.getFoo(), "resetFooAsync should reset to initial value");
        this.assertEquals(2, apply, "apply should be called twice");
      };

      doit().then(() => {
        this.resume();
      });
      this.wait(1000);
    }
  }
});
