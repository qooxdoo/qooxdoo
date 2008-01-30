qx.Class.define("qx.ui2.core.ScrollArea",
{
  extend : qx.ui2.core.Widget,

  construct : function()
  {
    this.base(arguments);


    this._hScrollBar = new qx.ui2.core.ScrollBar("horizontal").set({
      visibility: "excluded"
    });

    this._vScrollBar = new qx.ui2.core.ScrollBar("vertical").set({
      visibility: "excluded"
    });

    this._hScrollBar.addListener("scroll", this._onHorizontalScroll, this);
    this._vScrollBar.addListener("scroll", this._onVerticalScroll, this);

    this._hBarHeight = this._hScrollBar.getSizeHint().height;
    this._vBarWidth = this._vScrollBar.getSizeHint().width;

    this._scrollPane = new qx.ui2.core.ScrollPane();

    this._scrollPane.addListener("resize", this._onResize, this);
    this._scrollPane.addListener("resizeContent", this._onResize, this);

    this._cornerWidget = new qx.ui2.core.Widget().set({
      width: this._vBarWidth,
      height: this._hBarHeight,
      backgroundColor: "green",
      visibility: "excluded"
    });


    var grid = new qx.ui2.layout.Grid();
    this.setLayout(grid);
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);

    grid.add(this._scrollPane, 0, 0);
    grid.add(this._vScrollBar, 0, 1);
    grid.add(this._hScrollBar, 1, 0);
    grid.add(this._cornerWidget, 1, 1);
  },


  properties :
  {
    overflowX :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_applyOverflowX",
      event : "changeOverflowX"
    },

    overflowY :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_applyOverflowY",
      event : "changeOverflowY"
    },

    overflow : {
      group : [ "overflowX", "overflowY" ]
    }

  },


  members :
  {
    /**
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui2.core.Widget} Widget to insert
     * @return {void}
     */
    setContent : function(value) {
      this._scrollPane.setContent(value);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @return {qx.ui2.core.Widget}
     */
    getContent : function() {
      return this._scrollPane.getContent() || null;
    },


    _onHorizontalScroll : function(e) {
      console.log("scroll", e);
      this._scrollPane.setScrollLeft(e.getValue());
    },


    _onVerticalScroll : function(e) {
      this._scrollPane.setScrollTop(e.getValue());
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queueing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @type member
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var content = this._scrollPane.getContent();
      if (!content) {
        return;
      }

      // Compute the rendered inner width of this widget.
      var areaInsets = this.getInsets();
      var areaSize = this.getComputedLayout();
      var areaWidth = areaSize.width - areaInsets.left - areaInsets.right;
      var areaHeight = areaSize.heught - areaInsets.top - areaInsets.bottom;

      // The final rendered width of the content
      var contentSize = content.getComputedLayout();

      if (contentSize.width > areaWidth) {
        this._setScrollBarVisibility("horizontal", true);
        this._hScrollBar.setMaximum(contentSize.width - areaWidth);
      } else {
        this._setScrollBarVisibility("horizontal", false);
      }
    },


    _setScrollBarVisibility : function(orientation, visibility)
    {
      if (orientation == "horizontal")
      {
        var scrollBar = this._hScrollBar;
        var otherScrollBar = this._vScrollBar;
      }
      else
      {
        var scrollBar = this._vScrollBar;
        var otherScrollBar = this._hScrollBar;
      }

      if (visibility)
      {
        scrollBar.show();
        if (otherScrollBar.getVisibility() == "visible") {
          this._cornerWidget.show();
        }
      }
      else
      {
        scrollBar.exclude();
        this._cornerWidget.exclude();
      }
    }


  }
});