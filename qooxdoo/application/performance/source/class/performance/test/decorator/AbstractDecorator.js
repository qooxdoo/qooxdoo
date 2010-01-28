qx.Class.define("performance.test.decorator.AbstractDecorator",
{
  extend : qx.dev.unit.TestCase,
  include : performance.test.MMeasure,
  
  members :
  {
    setUp : function()
    {
      this.divs = [];
      
      for (var i=0; i<1000; i++) {
        var div = document.createElement("div");
        div.style.positoin = "absolute";
      }
    }
  }  
});