qx.Class.define("performance.test.widget.AbstractWidget",
{
  extend : qx.test.ui.LayoutTestCase,
  include : performance.test.MMeasure,
  type : "abstract",
  
  members :
  {
    CREATE_ITERATIONS : 200,
    RESIZE_ITERATIONS : 200,
    DISPOSE_ITERATIONS : 200,
    
  
    _createWidget : function() {
      throw new Error("abstract method call");
    },
    
    
    testCreate : function()
    {
      var widgets = [];
      var that = this;
      this.measureRepeated("create widget instance", function() {
        widgets.push(that._createWidget());
      }, this.CREATE_ITERATIONS);
      
      for (var i=0; i<widgets.length; i++) {
        widgets[i].dispose();
      }
      this.flush();
    },
    
    
    testRender : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      this.getRoot().add(container);
      
      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        container.add(this._createWidget());
      }
      
      var that = this;
      this.measureRepeated("render/flush widgets", function() {
        that.flush();
      }, 1, this.CREATE_ITERATIONS);

      container.destroy();
      this.flush();
    },
    
    
    testResizeAndFlush : function()
    {
      var widgets = [];
      for (var i=0; i<this.RESIZE_ITERATIONS; i++) {
        var widget = this._createWidget();
        widgets.push(widget);
        this.getRoot().add(widget);
      }

      this.flush();
      
      var that = this;
      var l=widgets.length;
      this.measureRepeated("resize/flush widgets", function() {
        for (i=0; i<l; i++) {
          widgets[i].setWidth(300);
          widgets[i].setHeight(100)
        };
        that.flush();
        
        for (i=0; i<l; i++) {
          widgets[i].setWidth(100);
          widgets[i].setHeight(30);
        }
        that.flush();
      }, 1, this.RESIZE_ITERATIONS);

      for (i=0; i<l; i++) {
        widgets[i].destroy();
      }
      this.flush();
    },
    
    
    testRemove : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      this.getRoot().add(container);
      
      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        container.add(this._createWidget());
      }
      
      var that = this;
      this.measureRepeated("remove/flush widgets", function() {
        container.removeAll();
        that.flush();
      }, 1, this.CREATE_ITERATIONS);

      container.destroy();
      this.flush();      
    },
    
    
    testDisposeNonRendered : function()
    {
      var widgets = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++) {
        widgets.push(this._createWidget());
      }
      
      this.measureRepeated("dispose not rendered widgets", function() {
        for (var i=0; i<widgets.length; i++) {
          widgets[i].dispose();
        }
      }, 1, this.DISPOSE_ITERATIONS);

      this.flush();
    },
    
    
    testDisposeRendered : function()
    {
      var widgets = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++)
      {
        widgets.push(this._createWidget());
        this.getRoot().add(widgets[i]);
      }
      this.flush();
      
      var that = this;
      this.measureRepeated("dispose rendered widgets", function() {
        for (var i=0; i<widgets.length; i++) {
          widgets[i].destroy();
        }
        that.flush();
      }, 1, this.DISPOSE_ITERATIONS);

      this.flush();      
    }
  }  
});