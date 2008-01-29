qx.Class.define("qx.ui2.core.ScrollArea",
{
  extend : qx.ui2.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui2.layout.HBox();
    this.setLayout(layout);

    // TODO: Real buttons are needed here.
    this._leftButton = new qx.ui2.core.Label("<").set({
      backgroundColor : "gray"
    });

    this._rightButton = new qx.ui2.core.Label(">").set({
      backgroundColor : "gray"
    });

    this._leftButton.exclude();
    this._rightButton.exclude();

    this._leftButton.addListener("click", this._scrollRight, this);
    this._rightButton.addListener("click", this._scrollLeft, this);

    this._pane = new qx.ui2.core.ScrollPane();
    this._pane.addListener("resize", this._onResize, this);
    this._pane.addListener("resizeContent", this._onResize, this);

    // Add children to layout
    layout.add(this._leftButton);
    layout.add(this._pane, {flex: 1});
    layout.add(this._rightButton);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

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
      this._pane.setContent(value);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @return {qx.ui2.core.Widget}
     */
    getContent : function() {
      return this._pane.getContent() || null;
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
      var content = this._pane.getContent();
      if (!content) {
        return;
      }

      // Compute the rendered inner width of this widget.
      var areaInsets = this.getInsets();
      var areaSize = this.getComputedLayout().width - areaInsets.left - areaInsets.right;

      // The final rendered width of the content
      var contentSize = content.getComputedLayout().width;

      if (contentSize > areaSize) {
        this._showArrows();
      } else {
        this._hideArrows();
      }
    },


    /**
     * Show the arrows (Called from resize event)
     *
     * @type member
     * @return {void}
     */
    _showArrows : function()
    {
      this._leftButton.show();
      this._rightButton.show();
    },


    /**
     * Hide the arrows (Called from resize event)
     *
     * @type member
     * @return {void}
     */
    _hideArrows : function()
    {
      this._leftButton.exclude();
      this._rightButton.exclude();

      this._pane.setScrollLeft(0);
    },


    /**
     * Scroll handler for left scrolling
     *
     * @type member
     * @return {void}
     */
    _scrollLeft : function() {
      this._pane.scrollLeftBy(20, true);
    },


    /**
     * Scroll handler for right scrolling
     *
     * @type member
     * @return {void}
     */
    _scrollRight : function() {
      this._pane.scrollLeftBy(-20, true);
    }
  }
});
