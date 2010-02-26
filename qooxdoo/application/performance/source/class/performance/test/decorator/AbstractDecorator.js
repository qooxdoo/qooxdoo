qx.Class.define("performance.test.decorator.AbstractDecorator",
{
  extend : qx.dev.unit.TestCase,
  include : performance.test.MMeasure,
  
  members :
  {
    setUp : function()
    {
      var div = this.div = document.createElement("div");
      div.style.position = "absolute";
      div.style.width = "100px";
      div.style.height = "50px";
      this.divs.push(div);
      container.appendChild(div);
      
      document.body.appendChild(div);
    },
    
    
    tearDown : function() {
      document.body.removeChild(this.div);
    },
    
    
    createDecorator : function() {
      // abstract method call
    },
    
    
    testRender : function()
    {
      var decorator = this.createDecorator();
      decorator.getMarkup();
      
      var div = this.div;
      
      var that = this;
      this.measureRepeated(
        "create and render decorator",
        function() {
          div.innerHTML = decorator.getMarkup();
        },
        function() {},
        2000
      );      
    }
  }  
});