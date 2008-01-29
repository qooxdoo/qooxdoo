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
    this._lButton = new qx.ui2.core.Label("<").set({
      backgroundColor : "gray",
      visibility :"exclude"
    });

    this._rButton = new qx.ui2.core.Label(">").set({
      backgroundColor : "gray",
      visibility : "exclude"
    });

    this._lButton.addListener("click", this._scrollRight, this);
    this._rButton.addListener("click", this._scrollLeft, this);

    this._pane = new qx.ui2.core.ScrollPane();
    this._pane.addListener("resize", this._onResize, this);

    // Add children to layout
    layout.add(this._lButton);
    layout.add(this._pane, {flex: 1});
    layout.add(this._rButton);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    setContent : function(content)
    {
      var layout = this._pane.getLayout();
      layout.setContent(content);
      this._content = content;

      content.addListener("resize", this._onResize, this);
    },

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

    _showArrows: function()
    {
      this._lButton.setVisibility("show");
      this._rButton.setVisibility("show");
    },

    _hideArrows: function()
    {
      this._lButton.setVisibility("exclude");
      this._rButton.setVisibility("exclude");
      this._pane._contentElement.setAttribute("scrollLeft", 0);
    },

    _scrollLeft : function() {
      this._pane.scrollLeftBy(20, true);
    },

    _scrollRight : function() {
      this._pane.scrollLeftBy(-20, true);
    }
  }
});
