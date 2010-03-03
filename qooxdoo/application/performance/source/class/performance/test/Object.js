qx.Class.define("performance.test.Object",
{
  extend : qx.dev.unit.TestCase,
  include : performance.test.MMeasure,
  
  members :
  {
  
    setUp : function()
    {
    },
  
  
    tearDown : function()
    {
    },
    
  
    CREATE_ITERATIONS : 100000,
    BASE_ITERATIONS : 100000,
    
    
    testObjectCreate : function()
    {
      var objects = this.__objects = [];
      var self = this;
      this.measure(
        "create qx.core.Object",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            objects.push(new qx.core.Object());
          }
        },
        function() {
          self._disposeArray("__objects");
        },
        this.CREATE_ITERATIONS
      );
    },
    
    
    testBaseCall : function() 
    {
      var obj = new performance.test.Extend();
      this.measure(
        "call this.base()"
      )
    }
  }  
});

qx.Class.define("performance.test.Base", {
  extend : Object,
  
  members : {
    foo : function(a,b,c) {}
  }
});

qx.Class.define("performance.test.Extend", {
  extend : performance.test.Base,
  
  members : {
    foo : function(a,b,c) {
      this.base(arguments, a, b, c);
    },
    
    bar : function(a, b, c) {
      performance.test.Base.prototype.foo.call(this, a, b, c)
    }
  }
});