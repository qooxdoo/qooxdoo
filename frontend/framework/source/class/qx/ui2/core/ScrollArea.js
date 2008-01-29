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
      backgroundColor : "gray",
      visibility :"exclude"
    });

    this._rightButton = new qx.ui2.core.Label(">").set({
      backgroundColor : "gray",
      visibility : "exclude"
    });

    this._leftButton.addListener("click", this._scrollRight, this);
    this._rightButton.addListener("click", this._scrollLeft, this);

    this._pane = new qx.ui2.core.ScrollPane();
    this._pane.addListener("resize", this._onResize, this);

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
     * Configures the content
     */
    setContent : function(content)
    {
      var layout = this._pane.getLayout();
      layout.setContent(content);
      this._content = content;

      content.addListener("resize", this._onResize, this);
    },


    /**
     * Listener for resize event
     *
     * @type member
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var paneSize = this.getComputedLayout();
      var contentSize = this._content.getComputedLayout();

      if (contentSize.width > paneSize.width) {
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
