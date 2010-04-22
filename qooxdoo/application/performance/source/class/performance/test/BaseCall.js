qx.Class.define("performance.test.BaseCall",
{
  extend : qx.dev.unit.TestCase,
  include : performance.test.MMeasure,

  members :
  {
    ITERATIONS : 100000,

    testBaseCall : function()
    {
      var obj = new performance.test.Extend();
      var self = this;
      this.measure(
        "this.base()",
        function() {
          for (var i=0; i<self.ITERATIONS; i++) {
            obj.foo_base();
          }
        },
        function() {},
        this.ITERATIONS
      );
    },

    testPlainCall : function()
    {
      var obj = new performance.test.Extend();
      var self = this;
      this.measure(
          "Base.prototype.foo_base.call",
          function() {
            for (var i=0; i<self.ITERATIONS; i++) {
              obj.foo_call();
            }
          },
          function() {},
          this.ITERATIONS
      );
    },

    testPlainApply : function()
    {
      var obj = new performance.test.Extend();
      var self = this;
      this.measure(
        "Base.prototype.foo_base.apply",
        function() {
          for (var i=0; i<self.ITERATIONS; i++) {
            obj.foo_apply();
          }
        },
        function() {},
        this.ITERATIONS
      );
    }
  }
});

qx.Class.define("performance.test.Base", {
  extend : qx.core.Object,

  members : {
    foo_base : function(a,b,c) {}
  }
});

qx.Class.define("performance.test.Extend", {
  extend : performance.test.Base,

  members : {
    foo_base : function(a,b,c) {
      this.base(arguments, a, b, c);
    },

    foo_call : function(a, b, c) {
      performance.test.Base.prototype.foo_base.call(this, a, b, c);
    },

    foo_apply : function(a, b, c) {
      performance.test.Base.prototype.foo_base.apply(this, arguments);
    }
  }
});