qx.Class.define("qx.test.performance.decorator.AbstractDecorator",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,
  type: "abstract",

  members :
  {
    CREATE_ITTERATIONS : 5000,
    RENDER_ITTERATIONS : 5000,
    RESIZE_ITTERATIONS : 10000,


    setUp : function()
    {

    },

    tearDown : function() {
      document.body.innerHTML = "";
    },

    createDivs : function(count)
    {
      var divs = [];
      var container = document.createElement("div");
      for (var i = 0; i < count; i++) {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = "100px";
        div.style.height = "50px";

        container.appendChild(div);

        divs.push(div);
      };

      document.body.appendChild(container);
      return divs;
    },


    createDecorator : function() {
      // abstract method call
    },


    testCreate : function()
    {
      var self = this;
      this.measureRepeated(
        "create and initial getMarkup",
        function() {
          var decorator = self.createDecorator();
          decorator.getMarkup();
        },
        function() {},
        this.CREATE_ITTERATIONS
      );
    },


    testRender : function()
    {
      // warmup the decorator
      var decorator = this.createDecorator();
      decorator.getMarkup();

      var divs = this.createDivs(this.RENDER_ITTERATIONS);
      this.measureRepeated(
        "set inner HTML to markup",
        function(i) {
          divs[i].innerHTML = decorator.getMarkup();
        },
        function() {},
        this.RENDER_ITTERATIONS
      );
    },


    testResize : function()
    {
      var divs = this.createDivs(this.RESIZE_ITTERATIONS);

      var decorator = this.createDecorator();
      for (var i = 0; i < divs.length; i++) {
        divs[i].innerHTML = decorator.getMarkup();
      };
      var size = [100, 200];

      this.measureRepeated(
        "resize decorator",
        function(i) {
          var currentSize = size[i % 2];
          decorator.resize(divs[i].firstChild, currentSize, currentSize);
        },
        function() {},
        this.RESIZE_ITTERATIONS
      );
    }
  }
});