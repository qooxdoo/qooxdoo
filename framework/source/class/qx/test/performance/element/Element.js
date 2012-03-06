qx.Class.define("qx.test.performance.element.Element",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  members :
  {

    setUp : function()
    {
      var helper = document.createElement("div");
      document.body.appendChild(helper);

      this._doc = new qx.html.Root(helper);
      this._doc.setAttribute("id", "doc");
    },


    tearDown : function()
    {
      qx.html.Element.flush();
      var div = document.getElementById("doc");
      document.body.removeChild(div);

      this.children = this._doc.getChildren();
      qx.util.DisposeUtil.disposeArray(this, "children");

      this._doc.dispose();
    },


    CREATE_ITERATIONS : 1000,
    RESIZE_ITERATIONS : 500,
    DISPOSE_ITERATIONS : 1000,

    _createElement : function() {
      return new qx.html.Element("div");
    },


    testCreate : function()
    {
      var elements = [];
      var that = this;
      this.measureRepeated(
        "create element instance",
        function() {
          elements.push(that._createElement());
        },
        function() {
          for (var i=0; i<elements.length; i++) {
            elements[i].dispose();
          }
          this.flush();
        },
        this.CREATE_ITERATIONS
      );
    },


    flush : function() {
      qx.html.Element.flush();
    },


    testRender : function()
    {
      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        this._doc.add(this._createElement());
      }

      var that = this;
      this.measureRepeated(
        "render/flush elements",
        function() {
          that.flush();
        },
        function() {},
        1, this.CREATE_ITERATIONS
      );
    },


    testResizeAndFlush : function()
    {
      var elements = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++)
      {
        var element = this._createElement();
        this._doc.add(element);
        elements.push(element);
      }
      this.flush();

      var l = elements.length;
      var that = this;
      this.measureRepeated(
        "resize/flush elements",
        function() {
          for (i=0; i<l; i++) {
            elements[i].setStyles({
              width: "300px",
              height: "100px"
            });
          }
          that.flush();

          for (i=0; i<l; i++) {
            elements[i].setStyles({
              width: "100px",
              height: "30px"
            });
          }
          that.flush();
        },
        function() {},
        1, this.RESIZE_ITERATIONS
      );
    },


    testRemove : function()
    {
      for (var i=0; i<this.CREATE_ITERATIONS; i++) {
        this._doc.add(this._createElement());
      }
      this.elements = qx.lang.Array.clone(this._doc.getChildren());

      var that = this;
      this.measureRepeated(
        "remove/flush elements",
        function() {
          that._doc.removeAll();
          that.flush();
        },
        function() {
          qx.util.DisposeUtil.disposeArray(this, "elements");
        },
        1, this.CREATE_ITERATIONS
      );
    },


    testDisposeNonRendered : function()
    {
      var elements = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++) {
        elements.push(this._createElement());
      }

      this.measureRepeated(
        "dispose not rendered elements",
        function() {
          for (var i=0; i<elements.length; i++) {
            elements[i].dispose();
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
      var elements = [];
      for (var i=0; i<this.DISPOSE_ITERATIONS; i++)
      {
        elements.push(this._createElement());
        this._doc.add(elements[i]);
      }
      this.flush();

      var that = this;
      this.measureRepeated(
        "dispose rendered elements",
        function() {
          for (var i=0; i<elements.length; i++) {
            elements[i].dispose();
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