/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Pérez Carmona
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Provides resizing behavior to any widget.
 * The widget that includes this mixin, must implement the {@link qx.ui.resizer.IResizable} interface.
 */
qx.Mixin.define("qx.ui.resizer.MResizable",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.addListener("mousedown", this.__onResizeMousedown, this, true);
    this.addListener("mouseup", this.__onResizeMouseup, this);
    this.addListener("losecapture", this.__onResizeMouseup, this);
    this.addListener("mousemove", this.__onResizeMousemove, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * It is resizable in the left direction.
     *
     * Note: This does only work if the widget is added to a
     * {@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas} layout.
     */
    resizableWest :
    {
      check : "Boolean",
      init : false,
      apply : "_applyResizable"
    },


    /**
     * It is resizable in the top direction.
     *
     * Note: This does only work if the widget is added to a
     * {@link qx.ui.layout.Basic} or {@link qx.ui.layout.Canvas} layout.
     */
    resizableNorth :
    {
      check : "Boolean",
      init : false,
      apply : "_applyResizable"
    },


    /**
     * It is resizable in the right direction.
     */
    resizableEast :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /**
     * It is resizable in the bottom direction.
     */
    resizableSouth :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },


    /** If the window is resizable */
    resizable :
    {
      group : [ "resizableNorth", "resizableEast", "resizableSouth", "resizableWest" ],
      mode  : "shorthand"
    },


    /** The resize method to use */
    resizeMethod :
    {
      init : "frame",
      check : [ "opaque", "frame", "translucent" ],
      event : "changeResizeMethod"
    },


    /** Toggle the ability to resize the widget */
    disableResize :
    {
      init : false,
      check : "Boolean"
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adjust so that it returns a boolean instead of an array.
     *
     * @type member
     * @return {Boolean} TODOC
     */
    isResizable : function() {
      return this.getResizableWest() || this.getResizableEast() || this.getResizableNorth() || this.getResizableSouth();
    },


    /**
     * Get the widget, which draws the resize/move frame. The resize frame is
     * shared by all widgets and is added to the root widget.
     *
     * @return {qx.ui.core.Widget} The resize frame
     */
    _getFrame : function()
    {
      var MResizable = qx.ui.resizer.MResizable;
      if (MResizable.__frame) {
        return MResizable.__frame;
      }

      var frame = new qx.ui.core.Widget();
      frame.setAppearance("resizer-frame");
      frame.exclude();

      qx.core.Init.getApplication().getRoot().add(frame);

      MResizable.__frame = frame;
      return frame;
    },


    /**
     * Event handler for the mouse down event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     */
    __onResizeMousedown : function(e)
    {
      if (!(this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast))
      {
        delete this._resizeSession;
        return;
      }

      // enable capturing
      this.capture();

      // activate global cursor
      // TODO: global cursor support
      //this.getTopLevelWidget().setGlobalCursor(this.getCursor());

      var bounds = this.getBounds();
      var location = qx.bom.element.Location.get(this.getContainerElement().getDomElement());

      // handle frame and translucently
      switch(this.getResizeMethod())
      {
        case "translucent":
          this.setOpacity(0.5);
          break;

        case "frame":
          var frame = this._getFrame();
          frame.show();
          frame.setUserBounds(
            location.left,
            location.top,
            location.right-location.left,
            location.bottom - location.top
          );
          frame.setZIndex(this.getZIndex() + 1);
          break;
      }

      var right = bounds.left + bounds.width;
      var bottom = bounds.top + bounds.height;

      this._resizeSession = {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
        elementLocation: location,

        right: right,
        bottom: bottom,

        lastTop: bounds.top,
        lastLeft: bounds.left,
        lastWidth: bounds.width,
        lastHeight: bounds.height,

        mouseStartLeft: e.getDocumentLeft(),
        mouseStartTop: e.getDocumentTop()
      };

      // stop event
      e.stopPropagation();
    },


    /**
     * Event handler for the mouse up event
     *
     * @type member
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMouseup : function(e)
    {
      var s = this._resizeSession;

      if (!s) {
        return;
      }

      this.releaseCapture();

      // deactivate global cursor
      // TODO
      //this.getTopLevelWidget().setGlobalCursor(null);

      // sync sizes to frame
      switch(this.getResizeMethod())
      {
        case "frame":
          this._getFrame().hide();

          if (s.lastLeft !== s.left || s.lastTop !== s.top) {
            this.setLayoutProperties({"left" : s.lastLeft, "top" : s.lastTop});
          }
          this.setWidth(s.lastWidth);
          this.setHeight(s.lastHeight);
          break;

        case "translucent":
          this.setOpacity(null);
          break;
      }

      // cleanup session
      delete this._resizeSession;

      // stop event
      if (e.getType() == "mouseup") {
        e.stopPropagation();
      }
    },


    /**
     * Checks whether the two arguments are near to each other. Returns true if
     * the absolute difference is less than five.
     *
     * @param p {Integer} first value
     * @param e {Integer} second value
     * @return {Boolean} Whether the two arguments are near to each other
     */
    _near : function(p, e) {
      return e > (p - 5) && e < (p + 5);
    },


    /**
     * Updates the cursor and stores the possible actions.
     *
     * @param documentLeft {Integer} The left mouse position
     * @param documentTop {Integer} The top mouse position
     */
    _updateCursor : function(documentLeft, documentTop)
    {
      var resizeMode = "";
      var el = this.getContentElement().getDomElement();

      this._resizeNorth = this._resizeSouth = this._resizeWest = this._resizeEast = false;

      var elLoc = qx.bom.element.Location.get(el);

      if (this._near(elLoc.top, documentTop))
      {
        if (this.getResizableNorth())
        {
          resizeMode = "n";
          this._resizeNorth = true;
        }
      }
      else if (this._near(elLoc.bottom, documentTop))
      {
        if (this.getResizableSouth())
        {
          resizeMode = "s";
          this._resizeSouth = true;
        }
      }

      if (this._near(elLoc.left, documentLeft))
      {
        if (this.getResizableWest())
        {
          resizeMode += "w";
          this._resizeWest = true;
        }
      }
      else if (this._near(elLoc.right, documentLeft))
      {
        if (this.getResizableEast())
        {
          resizeMode += "e";
          this._resizeEast = true;
        }
      }

      if (this._resizeNorth || this._resizeSouth || this._resizeWest || this._resizeEast) {
        this.setCursor(resizeMode + "-resize");
      } else {
        this.resetCursor();
      }
    },


    /**
     * Event handler for the mouse move event
     *
     * @type member
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMousemove : function(e)
    {
      if (this.getDisableResize()) {
        return;
      }

      var s = this._resizeSession;

      if (!s)
      {
        this._updateCursor(e.getDocumentLeft(), e.getDocumentTop());
        return;
      }

      var mouseOffsetLeft = e.getDocumentLeft() - s.mouseStartLeft;
      var mouseOffsetTop = e.getDocumentTop() - s.mouseStartTop;

      var hint = this.getSizeHint();

      var maxWidth = this.getMaxWidth() != null ? hint.maxWidth : Infinity;
      var maxHeight = this.getMaxHeight() != null ? hint.maxHeight : Infinity;

      if (this._resizeWest)
      {
        s.lastWidth = qx.lang.Number.limit(s.width - mouseOffsetLeft, hint.minWidth, maxWidth);
        s.lastLeft = s.left + s.width - s.lastWidth;
      }
      else if (this._resizeEast)
      {
        s.lastWidth = qx.lang.Number.limit(s.width + mouseOffsetLeft, hint.minWidth, maxWidth);
      }

      if (this._resizeNorth)
      {
        s.lastHeight = qx.lang.Number.limit(s.height - mouseOffsetTop, hint.minHeight, maxHeight);
        s.lastTop = s.top + s.height - s.lastHeight;
      }
      else if (this._resizeSouth)
      {
        s.lastHeight = qx.lang.Number.limit(s.height + mouseOffsetTop, hint.minHeight, maxHeight);
      }

      switch(this.getResizeMethod())
      {
        case "opaque":
        case "translucent":
          this.setWidth(s.lastWidth);
          this.setHeight(s.lastHeight);
          this.setLayoutProperties({"left" : s.lastLeft, "top" : s.lastTop});
          break;

        case "frame":
          this._getFrame().setUserBounds(
            s.elementLocation.left + s.lastLeft - s.left,
            s.elementLocation.top + s.lastTop - s.top,
            s.lastWidth,
            s.lastHeight
          );
      }

      // stop event
      e.stopPropagation();
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__frame");
  }
});
