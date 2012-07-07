qx.Class.define("qx.test.performance.widget.AbstractWidget",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMeasure,
  type : "abstract",

  members :
  {
    CREATE_ITERATIONS : 1000,
    RESIZE_ITERATIONS : 1000,
    DISPOSE_ITERATIONS : 1000,


    setUp : function()
    {
      this.base(arguments);
      this.flush();
    },


    _createWidget : function() {
      throw new Error("abstract method call");
    },


    testCreate : function()
    {
      var widgets = [];
      var that = this;
      this.measureRepeated(
        "create widget instance",
        function() {
          widgets.push(that._createWidget());
        },
        function() {
          for (var i=0; i<widgets.length; i++) {
            widgets[i].dispose();
          }
          this.flush();
        },
        this.CREATE_ITERATIONS
      );
    },


    testRender : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      this.getRoot().add(container);

      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        container.add(this._createWidget());
      }

      var that = this;
      this.measureRepeated(
        "render and flush widgets", function() {
          that.flush();
        },
        function() {
          container.destroy();
          this.flush();
        },
        1, this.CREATE_ITERATIONS
      );
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
      this.measureRepeated(
        "resize and flush widgets",
        function() {
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
        },
        function() {
          for (i=0; i<l; i++) {
            widgets[i].destroy();
          }
          this.flush();
        },
        1, this.RESIZE_ITERATIONS
      );
    },


    testRemove : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      this.getRoot().add(container);

      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        container.add(this._createWidget());
      }

      var that = this;
      this.measureRepeated(
        "remove and flush widgets",
        function() {
          container.removeAll();
          that.flush();
        },
        function() {
          container.destroy();
          this.flush();
        },
        1, this.CREATE_ITERATIONS
      );
    },


    testDisposeNonRendered : function()
    {
      var widgets = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++) {
        widgets.push(this._createWidget());
      }

      this.measureRepeated(
        "dispose not rendered widgets",
        function() {
          for (var i=0; i<widgets.length; i++) {
            widgets[i].dispose();
          }
        },
        function() {
          this.flush();
        },
        1, this.DISPOSE_ITERATIONS
      );
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
      this.measureRepeated(
        "dispose rendered widgets",
        function() {
          for (var i=0; i<widgets.length; i++) {
            widgets[i].destroy();
          }
          that.flush();
        },
        function() {
          this.flush();
        },
        1, this.DISPOSE_ITERATIONS
      );
    }
  }
});