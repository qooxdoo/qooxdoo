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

qx.Class.define("qx.test.lang.Type", {
  extend: qx.dev.unit.TestCase,

  members: {
    testIsString() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isString(""));
      this.assertTrue(Type.isString("Juhu"));
      /* eslint-disable-next-line no-new-wrappers */
      this.assertTrue(Type.isString(new String("Juhu")));
      this.assertTrue(Type.isString(new qx.locale.LocalizedString("Juhu")));
      this.assertTrue(Type.isString(new qx.type.BaseString("juhu")));

      this.assertFalse(Type.isString());
      this.assertFalse(Type.isString(function () {}));
      this.assertFalse(Type.isString(null));
      this.assertFalse(Type.isString(2));
      this.assertFalse(Type.isString({}));
      this.assertFalse(Type.isString([]));
      this.assertFalse(Type.isString(/juhu/));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isString(document.getElementById("ReturenedNull")));
    },

    testIsPojo() {
      var isPojo = qx.lang.Type.isPojo;

      //Class Person extends Object
      function Person() {
        this.name = "Mary";
        this.surname = "Berry";
      }

      Person.prototype.getFullName = function () {
        return this.name + " " + this.surname;
      };

      Person.prototype.properties = function () {
        return "Properties";
      };

      //Class Child extends Person
      function Child() {
        Person.call(this);
      }

      Child.prototype = Object.create(Person.prototype);
      Child.prototype.constructor = Child;

      Child.prototype.childMethod = function () {
        return "Child method";
      };

      // Simple POJO, should return true
      this.assertTrue(isPojo({ foo: 1 }));

      //Arrays, strings, numbers, and booleans are not POJOs
      this.assertFalse(isPojo([]));
      this.assertFalse(isPojo(null));
      this.assertFalse(isPojo(new qx.data.Array()));
      this.assertFalse(isPojo("hello"));
      this.assertFalse(isPojo(12));
      this.assertFalse(isPojo(true));

      //Class instance which does not inherit
      var nonInheritance = new Person();
      this.assertFalse(isPojo(nonInheritance));

      //Class instance with class that inherits
      var withInheritance = new Child();
      this.assertFalse(isPojo(withInheritance));

      //POJO with class prototype
      var pojoWithClassPrototype = { age: 22 };
      Object.setPrototypeOf(pojoWithClassPrototype, Person.prototype);
      this.assertFalse(isPojo(pojoWithClassPrototype));

      //POJO with an object prototype
      //Should return true
      var pojoWithObjectPrototype = { extraproperty: "Nuts" };
      var proto = {
        protoMethod() {
          return "protomethod";
        }
      };
      Object.setPrototypeOf(pojoWithObjectPrototype, proto);
      this.assertTrue(isPojo(pojoWithObjectPrototype));

      //Object which has a POJO prototype, which in turn has a class prototype
      //Should return false
      var prototypeIsObjectThenConstructor = { extraproperty: "Nuts" };
      var proto = {
        protoMethod() {
          return "protomethod";
        }
      };

      Object.setPrototypeOf(prototypeIsObjectThenConstructor, proto);
      Object.setPrototypeOf(proto, Person.prototype);
      this.assertFalse(isPojo(prototypeIsObjectThenConstructor));

      //Object which has a POJO prototype, which in turn has a POJO prototype
      //Should return true
      var obj = {
        nuts: 345
      };

      var proto1 = {
        myMethod() {
          return "proto1.myMethod";
        }
      };

      Object.setPrototypeOf(obj, proto1);
      var proto2 = {
        myMethod() {
          return "proto2.myMethod";
        },

        method2() {
          return "proto2.method2";
        }
      };

      Object.setPrototypeOf(proto1, proto2);

      this.assertEquals("proto1.myMethod", obj.myMethod());
      this.assertEquals("proto2.method2", obj.method2());
      this.assertTrue(isPojo(obj));

      //Object which is instance of a class, where the class has a prototype which is not Object.prototype
      //Must return false
      function NonObjectPrototype() {
        this.foo = "foo";
      }

      var proto = {
        myMethod() {
          return "proto.myMethod";
        }
      };

      NonObjectPrototype.prototype = proto;
      NonObjectPrototype.prototype.constructor = NonObjectPrototype;
      NonObjectPrototype.prototype.extraMethod = function () {
        return "extraMethod";
      };

      var obj = new NonObjectPrototype();

      this.assertEquals("proto.myMethod", obj.myMethod());
      this.assertEquals("extraMethod", obj.extraMethod());
      this.assertEquals("foo", obj.foo);
      this.assertFalse(isPojo(obj));

      //Qooxdoo objects must not be POJOs
      var obj = new qx.core.Object();
      this.assertFalse(isPojo(obj));

      //ES6 class must not be a POJO
      class ES6Class {
        constructor() {
          this.foo = "bar";
        }

        method() {
          return "method: " + this.foo;
        }
      }

      var obj = new ES6Class();
      this.assertFalse(isPojo(obj));
    },

    testIsArray() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isArray([]));
      /* eslint-disable-next-line no-array-constructor */
      this.assertTrue(Type.isArray(new Array()));
      this.assertTrue(Type.isArray(new qx.type.BaseArray()));

      this.assertFalse(Type.isArray());
      this.assertFalse(Type.isArray(function () {}));
      this.assertFalse(Type.isArray(""));
      this.assertFalse(Type.isArray(null));
      this.assertFalse(Type.isArray(2));
      this.assertFalse(Type.isArray({}));
      this.assertFalse(Type.isArray(true));
      this.assertFalse(Type.isArray(/juhu/));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isArray(document.getElementById("ReturenedNull")));
    },

    testIsObject() {
      //note: old testIsObject
      var Type = qx.lang.Type;

      this.assertTrue(Type.isObject({}));
      /* eslint-disable-next-line no-new-object */
      this.assertTrue(Type.isObject(new Object()));
      var qxObj = new qx.core.Object();
      this.assertTrue(Type.isObject(qxObj));
      qxObj.dispose();

      this.assertFalse(Type.isObject(), "undefined is not an object");
      this.assertFalse(
        Type.isObject(function () {}),
        "function is not an object"
      );

      this.assertFalse(Type.isObject(""), "string is not an object");
      this.assertFalse(Type.isObject(null), "null is not an object");
      this.assertFalse(Type.isObject(undefined), "undefined is not an object");
      this.assertFalse(Type.isObject(2), "number is not an object");
      this.assertFalse(Type.isObject([]), "array is not an object");
      this.assertFalse(Type.isObject(true), "boolean is not an object");
      this.assertFalse(Type.isObject(/juhu/), "regexp is not an object");

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isObject(document.getElementById("ReturenedNull")));
    },

    testIsRegExp() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isRegExp(/juhu/));
      this.assertTrue(Type.isRegExp(new RegExp()));

      this.assertFalse(Type.isRegExp());
      this.assertFalse(Type.isRegExp(function () {}));
      this.assertFalse(Type.isRegExp(""));
      this.assertFalse(Type.isRegExp(null));
      this.assertFalse(Type.isRegExp(2));
      this.assertFalse(Type.isRegExp([]));
      this.assertFalse(Type.isRegExp(true));
      this.assertFalse(Type.isRegExp({}));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isRegExp(document.getElementById("ReturenedNull")));
    },

    testIsNumber() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isNumber(1));
      this.assertTrue(Type.isNumber(1.1));
      /* eslint-disable-next-line no-new-wrappers */
      this.assertTrue(Type.isNumber(new Number(1)));
      this.assertTrue(Type.isNumber(0));

      this.assertFalse(Type.isNumber());
      this.assertFalse(Type.isNumber(function () {}));
      this.assertFalse(Type.isNumber(""));
      this.assertFalse(Type.isNumber(null));
      this.assertFalse(Type.isNumber(/g/));
      this.assertFalse(Type.isNumber([]));
      this.assertFalse(Type.isNumber(true));
      this.assertFalse(Type.isNumber({}));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isNumber(document.getElementById("ReturenedNull")));
    },

    testIsBoolean() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isBoolean(true));
      this.assertTrue(Type.isBoolean(false));
      /* eslint-disable-next-line no-new-wrappers */
      this.assertTrue(Type.isBoolean(new Boolean()));

      this.assertFalse(Type.isBoolean());
      this.assertFalse(Type.isBoolean(function () {}));
      this.assertFalse(Type.isBoolean(""));
      this.assertFalse(Type.isBoolean(null));
      this.assertFalse(Type.isBoolean(/g/));
      this.assertFalse(Type.isBoolean([]));
      this.assertFalse(Type.isBoolean(2));
      this.assertFalse(Type.isBoolean({}));

      // test IE issue with a null returned from DOM
      this.assertFalse(
        Type.isBoolean(document.getElementById("ReturenedNull"))
      );
    },

    testIsFunction() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isFunction(function () {}));
      this.assertTrue(Type.isFunction(Object));

      this.assertFalse(Type.isFunction());
      this.assertFalse(Type.isFunction(true));
      this.assertFalse(Type.isFunction(""));
      this.assertFalse(Type.isFunction(null));
      this.assertFalse(Type.isFunction(/g/));
      this.assertFalse(Type.isFunction([]));
      this.assertFalse(Type.isFunction(2));
      this.assertFalse(Type.isFunction({}));

      // test IE issue with a null returned from DOM
      this.assertFalse(
        Type.isFunction(document.getElementById("ReturenedNull"))
      );
    },

    testIsDate() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isDate(new Date()));
      this.assertTrue(Type.isDate(new Date(1981, 1, 10)));
      this.assertTrue(Type.isDate(new Date(1981, 1, 10, 6, 1, 2)));
      this.assertTrue(Type.isDate(new Date(516848615165861)));

      this.assertFalse(Type.isDate());
      this.assertFalse(Type.isDate(true));
      this.assertFalse(Type.isDate(""));
      this.assertFalse(Type.isDate(null));
      this.assertFalse(Type.isDate(undefined));
      this.assertFalse(Type.isDate(/g/));
      this.assertFalse(Type.isDate([]));
      this.assertFalse(Type.isDate(2));
      this.assertFalse(Type.isDate({}));
      this.assertFalse(Type.isDate(new Error()));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isDate(document.getElementById("ReturenedNull")));
    },

    testIsError() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isError(new Error()));
      this.assertTrue(Type.isError(new Error("")));
      this.assertTrue(Type.isError(new Error("test")));
      this.assertTrue(Type.isError(new EvalError()));
      this.assertTrue(Type.isError(new RangeError()));

      this.assertFalse(Type.isError());
      this.assertFalse(Type.isError(true));
      this.assertFalse(Type.isError(""));
      this.assertFalse(Type.isError(null));
      this.assertFalse(Type.isError(undefined));
      this.assertFalse(Type.isError(/g/));
      this.assertFalse(Type.isError([]));
      this.assertFalse(Type.isError(2));
      this.assertFalse(Type.isError({}));
      this.assertFalse(Type.isError(new Date()));

      // test IE issue with a null returned from DOM
      this.assertFalse(Type.isError(document.getElementById("ReturenedNull")));
    },

    /**
     * @ignore(Promise)
     */
    testIsPromise() {
      var Type = qx.lang.Type;

      this.assertTrue(Type.isPromise(new Promise(function () {})));
      this.assertTrue(Type.isPromise(new qx.Promise(function () {})));

      this.assertFalse(Type.isPromise());
      this.assertFalse(Type.isPromise(true));
      this.assertFalse(Type.isPromise(""));
      this.assertFalse(Type.isPromise({}));
      this.assertFalse(Type.isPromise(null));
      this.assertFalse(Type.isPromise(undefined));
      this.assertFalse(Type.isPromise(/g/));
      this.assertFalse(Type.isPromise([]));
      this.assertFalse(Type.isPromise(2));
      this.assertFalse(Type.isPromise({}));
      this.assertFalse(Type.isPromise(new Error()));
    }
  }
});
