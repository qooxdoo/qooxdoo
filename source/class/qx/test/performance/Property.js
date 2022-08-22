qx.Class.define("qx.test.performance.Property", {
  extend: qx.dev.unit.TestCase,
  include: qx.dev.unit.MMeasure,

  members: {
    SET_ITERATIONS: 10000,

    testPropertySet() {
      qx.Class.undefine("demo.MyClass");
      var Clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            check: "String",
            event: "changeAlpha"
          }
        }
      });

      var obj = new Clazz();
      obj.addListener("changeAlpha", () => {});
      var self = this;
      this.measure(
        "property set",
        function () {
          for (var i = 0; i < self.SET_ITERATIONS; i++) {
            obj.setAlpha("value #" + i);
          }
        },
        function () {
          obj.dispose();
          qx.Class.undefine("demo.MyClass");
        },
        this.SET_ITERATIONS
      );
    },

    testAsyncPropertySet() {
      if (qx.core.Environment.get("qx.promise.longStackTraces")) {
        (console.log || this.warn)(
          "Long Stack Traces are enabled - this will significantly slow down the test"
        );
      }
      qx.Class.undefine("demo.MyClass");
      var Clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
        properties: {
          alpha: {
            init: null,
            nullable: true,
            check: "String",
            event: "changeAlpha",
            async: true,
            apply: () => {},
            get: () => { return null; }
          }
        }
      });

      var obj = new Clazz();
      obj.addListener("changeAlpha", () => {});
      var self = this;
      this.measure(
        "property set",
        function () {
          for (var i = 0; i < self.SET_ITERATIONS; i++) {
            obj.setAlpha("value #" + i);
          }
        },
        function () {
          obj.dispose();
          qx.Class.undefine("demo.MyClass");
        },
        this.SET_ITERATIONS
      );
    }
  }
});