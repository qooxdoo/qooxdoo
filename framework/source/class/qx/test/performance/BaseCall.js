/* ************************************************************************

#ignore(qx.test.performance.Base)
#ignore(qx.test.performance.Extend)
#ignore(qx.test.performance.Base.prototype.foo_base)

************************************************************************ */

qx.Class.define("qx.test.performance.BaseCall",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  members :
  {
    ITERATIONS : 100000,

    testBaseCall : function()
    {
      var obj = new qx.test.performance.Extend();
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
      var obj = new qx.test.performance.Extend();
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
      var obj = new qx.test.performance.Extend();
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

qx.Class.define("qx.test.performance.Base", {
  extend : qx.core.Object,

  members : {
    foo_base : function(a,b,c) {}
  }
});

qx.Class.define("qx.test.performance.Extend", {
  extend : qx.test.performance.Base,

  members : {
    foo_base : function(a,b,c) {
      this.base(arguments, a, b, c);
    },

    foo_call : function(a, b, c) {
      qx.test.performance.Base.prototype.foo_base.call(this, a, b, c);
    },

    foo_apply : function(a, b, c) {
      qx.test.performance.Base.prototype.foo_base.apply(this, arguments);
    }
  }
});