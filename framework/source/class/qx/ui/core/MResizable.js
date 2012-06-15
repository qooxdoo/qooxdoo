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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Provides resizing behavior to any widget.
 */
qx.Mixin.define("qx.ui.core.MResizable",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Register listeners to the container
    var container = this.getContainerElement();
    container.addListener("mousedown", this.__onResizeMouseDown, this, true);
    container.addListener("mouseup", this.__onResizeMouseUp, this);
    container.addListener("mousemove", this.__onResizeMouseMove, this);
    container.addListener("mouseout", this.__onResizeMouseOut, this);
    container.addListener("losecapture", this.__onResizeLoseCapture, this);

    // Get a reference of the drag and drop handler
    var domElement = this.getContainerElement().getDomElement();
    if (domElement == null) {
      domElement = window;
    }

    this.__dragDropHandler = qx.event.Registration.getManager(domElement).getHandler(qx.event.handler.DragDrop);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the top edge is resizable */
    resizableTop :
    {
      check : "Boolean",
      init : true
    },

    /** Whether the right edge is resizable */
    resizableRight :
    {
      check : "Boolean",
      init : true
    },

    /** Whether the bottom edge is resizable */
    resizableBottom :
    {
      check : "Boolean",
      init : true
    },

    /** Whether the left edge is resizable */
    resizableLeft :
    {
      check : "Boolean",
      init : true
    },

    /**
     * Property group to configure the resize behaviour for all edges at once
     */
    resizable :
    {
      group : [ "resizableTop", "resizableRight", "resizableBottom", "resizableLeft" ],
      mode  : "shorthand"
    },

    /** The tolerance to activate resizing */
    resizeSensitivity :
    {
      check : "Integer",
      init : 5
    },

    /** Whether a frame replacement should be used during the resize sequence */
    useResizeFrame :
    {
      check : "Boolean",
      init : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __dragDropHandler : null,
    __resizeFrame : null,
    __resizeActive : null,
    __resizeLeft : null,
    __resizeTop : null,
    __resizeStart : null,
    __resizeRange : null,


    RESIZE_TOP : 1,
    RESIZE_BOTTOM : 2,
    RESIZE_LEFT : 4,
    RESIZE_RIGHT : 8,


    /*
    ---------------------------------------------------------------------------
      CORE FEATURES
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget, which draws the resize/move frame. The resize frame is
     * shared by all widgets and is added to the root widget.
     *
     * @return {qx.ui.core.Widget} The resize frame
     */
    _getResizeFrame : function()
    {
      var frame = this.__resizeFrame;
      if (!frame)
      {
        frame = this.__resizeFrame = new qx.ui.core.Widget();
        frame.setAppearance("resize-frame");
        frame.exclude();

        qx.core.Init.getApplication().getRoot().add(frame);
      }

      return frame;
    },


    /**
     * Creates, shows and syncs the frame with the widget.
     */
    __showResizeFrame : function()
    {
      var location = this.__getLocation();
      var frame = this._getResizeFrame();
      frame.setUserBounds(
        location.left,
        location.top,
        location.right - location.left,
        location.bottom - location.top
      );
      frame.show();
      frame.setZIndex(this.getZIndex()+1);
    },




    /*
    ---------------------------------------------------------------------------
      RESIZE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the new boundaries at each interval
     * of the resize sequence.
     *
     * @param e {qx.event.type.Mouse} Last mouse event
     */
    __computeResizeResult : function(e)
    {
      // Detect mode
      var resizeActive = this.__resizeActive;

      // Read size hint
      var hint = this.getSizeHint();
      var range = this.__resizeRange;

      // Read original values
      var start = this.__resizeStart;
      var width = start.width;
      var height = start.height;
      var containerWidth = start.containerWidth;
      var containerHeight = start.containerHeight;
      var left = start.left;
      var top = start.top;
      var diff;

      if (
        (resizeActive & this.RESIZE_TOP) ||
        (resizeActive & this.RESIZE_BOTTOM)
      )
      {
        diff = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop())) - this.__resizeTop;

        if (resizeActive & this.RESIZE_TOP) {
          height -= diff;
          containerHeight -= diff;
        } else {
          height += diff;
          containerHeight += diff;
        }

        if (containerHeight < hint.minHeight) {
          height += (hint.minHeight - containerHeight);
          containerHeight = hint.minHeight;
        } else if (containerHeight > hint.maxHeight) {
          height -= (containerHeight - hint.maxHeight);
          containerHeight = hint.maxHeight;
        }

        if (resizeActive & this.RESIZE_TOP) {
          top += start.containerHeight - containerHeight;
        }
      }

      if (
        (resizeActive & this.RESIZE_LEFT) ||
        (resizeActive & this.RESIZE_RIGHT)
      )
      {
        diff = Math.max(range.left, Math.min(range.right, e.getDocumentLeft())) - this.__resizeLeft;

        if (resizeActive & this.RESIZE_LEFT) {
          width -= diff;
          containerWidth -= diff;
        } else {
          width += diff;
          containerWidth += diff;
        }

        if (containerWidth < hint.minWidth) {
          width += (hint.minWidth - containerWidth);
          containerWidth = hint.minWidth;
        } else if (width > hint.maxWidth) {
          width -= (containerWidth - hint.maxWidth);
          containerWidth = hint.maxWidth;
        }

        if (resizeActive & this.RESIZE_LEFT) {
          left += start.containerWidth - containerWidth;
        }
      }

      return {
        // left and top of the visible widget (content + decorator)
        viewportLeft : left,
        viewportTop : top,

        parentLeft : start.bounds.left + left - start.left,
        parentTop : start.bounds.top + top - start.top,

        // dimensions of the whole widget (container)
        containerWidth : containerWidth,
        containerHeight : containerHeight,
        // dimensions of the visible widget (content + decorator)
        width : width,
        height : height
      };
    },


    /**
     * {Map} Maps internal states to cursor symbols to use
     *
     * @lint ignoreReferenceField(__resizeCursors)
     */
    __resizeCursors :
    {
      1  : "n-resize",
      2  : "s-resize",
      4  : "w-resize",
      8  : "e-resize",

      5  : "nw-resize",
      6  : "sw-resize",
      9  : "ne-resize",
      10 : "se-resize"
    },


    /**
     * Returns the location to use. Either the location of the decorator
     * element, or the location of the content element.
     *
     * @return {Map} Location map. (see {@link qx.bom.element.Location#get})
     */
    __getLocation : function()
    {
      var decorator = this.getDecoratorElement();
      // use the decorator location if available (belongs to the resizable box)
      if (decorator && decorator.getDomElement()) {
        return qx.bom.element.Location.get(decorator.getDomElement());
      } else {
        return this.getContentLocation();
      }
    },


    /**
     * Updates the internally stored resize mode
     *
     * @param e {qx.event.type.Mouse} Last mouse event
     */
    __computeResizeMode : function(e)
    {
      var location = this.__getLocation();
      var mouseTolerance = this.getResizeSensitivity();

      var mouseLeft = e.getDocumentLeft();
      var mouseTop = e.getDocumentTop();

      var resizeActive = this.__computeResizeActive(
        location, mouseLeft, mouseTop, mouseTolerance
      );

      // check again in case we have a corner [BUG #1200]
      if (resizeActive > 0) {
        // this is really a | (or)!
        resizeActive = resizeActive | this.__computeResizeActive(
          location, mouseLeft, mouseTop, mouseTolerance * 2
        );
      }

      this.__resizeActive = resizeActive;
    },


    /**
     * Internal helper for computing the proper resize action based on the
     * given parameters.
     *
     * @param location {Map} The current location of the widget.
     * @param mouseLeft {Integer} The left position of the mouse.
     * @param mouseTop {Integer} The top position of the mouse.
     * @param mouseTolerance {Integer} The desired distance to the edge.
     * @return {Integer} The resize active number.
     */
    __computeResizeActive : function(location, mouseLeft, mouseTop, mouseTolerance) {
      var resizeActive = 0;

      // TOP
      if (
        this.getResizableTop() &&
        Math.abs(location.top - mouseTop) < mouseTolerance &&
        mouseLeft > location.left - mouseTolerance &&
        mouseLeft < location.right + mouseTolerance
      ) {
        resizeActive += this.RESIZE_TOP;

      // BOTTOM
      } else if (
        this.getResizableBottom() &&
        Math.abs(location.bottom - mouseTop) < mouseTolerance &&
        mouseLeft > location.left - mouseTolerance &&
        mouseLeft < location.right + mouseTolerance
      ) {
        resizeActive += this.RESIZE_BOTTOM;
      }

      // LEFT
      if (
        this.getResizableLeft() &&
        Math.abs(location.left - mouseLeft) < mouseTolerance &&
        mouseTop > location.top - mouseTolerance &&
        mouseTop < location.bottom + mouseTolerance
      ) {
        resizeActive += this.RESIZE_LEFT;

      // RIGHT
      } else if (
        this.getResizableRight() &&
        Math.abs(location.right - mouseLeft) < mouseTolerance &&
        mouseTop > location.top - mouseTolerance &&
        mouseTop < location.bottom + mouseTolerance
      ) {
        resizeActive += this.RESIZE_RIGHT;
      }
      return resizeActive;
    },


    /*
    ---------------------------------------------------------------------------
      RESIZE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the mouse down event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     */
    __onResizeMouseDown : function(e)
    {
      // Check for active resize
      if (!this.__resizeActive || !this.getEnabled()) {
        return;
      }

      // Add resize state
      this.addState("resize");

      // Store mouse coordinates
      this.__resizeLeft = e.getDocumentLeft();
      this.__resizeTop = e.getDocumentTop();

      // Cache bounds
      var containerLocation = this.getContainerLocation();
      var decoratorLocation = this.__getLocation();
      var bounds   = this.getBounds();
      this.__resizeStart = {
        top : decoratorLocation.top,
        left : decoratorLocation.left,
        containerWidth : containerLocation.right - containerLocation.left,
        containerHeight : containerLocation.bottom - containerLocation.top,
        width : decoratorLocation.right - decoratorLocation.left,
        height : decoratorLocation.bottom - decoratorLocation.top,
        bounds : qx.lang.Object.clone(bounds)
      };

      // Compute range
      var parent = this.getLayoutParent();
      var parentLocation = parent.getContentLocation();
      var parentBounds = parent.getBounds();

      this.__resizeRange = {
        left : parentLocation.left,
        top : parentLocation.top,
        right : parentLocation.left + parentBounds.width,
        bottom : parentLocation.top + parentBounds.height
      };

      // Show frame if configured this way
      if (this.getUseResizeFrame()) {
        this.__showResizeFrame();
      }

      // Enable capturing
      this.capture();

      // Stop event
      e.stop();
    },


    /**
     * Event handler for the mouse up event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMouseUp : function(e)
    {
      // Check for active resize
      if (!this.hasState("resize") || !this.getEnabled()) {
        return;
      }

      // Hide frame afterwards
      if (this.getUseResizeFrame()) {
        this._getResizeFrame().exclude();
      }

      // Compute bounds
      var bounds = this.__computeResizeResult(e);

      // Sync with widget
      this.setWidth(bounds.containerWidth);
      this.setHeight(bounds.containerHeight);

      // Update coordinate in canvas
      if (this.getResizableLeft() || this.getResizableTop())
      {
        this.setLayoutProperties({
          left : bounds.parentLeft,
          top : bounds.parentTop
        });
      }

      // Clear mode
      this.__resizeActive = 0;

      // Remove resize state
      this.removeState("resize");

      // Reset cursor
      this.resetCursor();
      this.getApplicationRoot().resetGlobalCursor();

      // Disable capturing
      this.releaseCapture();

      e.stopPropagation();
    },


    /**
     * Event listener for <code>losecapture</code> event.
     *
     * @param e {qx.event.type.Event} Lose capture event
     */
    __onResizeLoseCapture : function(e)
    {
      // Check for active resize
      if (!this.__resizeActive) {
        return;
      }

      // Reset cursor
      this.resetCursor();
      this.getApplicationRoot().resetGlobalCursor();

      // Remove drag state
      this.removeState("move");

      // Hide frame afterwards
      if (this.getUseResizeFrame()) {
        this._getResizeFrame().exclude();
      }
    },


    /**
     * Event handler for the mouse move event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMouseMove : function(e)
    {
      if (!this.getEnabled()) {
        return;
      }

      if (this.hasState("resize"))
      {
        var bounds = this.__computeResizeResult(e);

        // Update widget
        if (this.getUseResizeFrame())
        {
          // Sync new bounds to frame
          var frame = this._getResizeFrame();
          frame.setUserBounds(bounds.viewportLeft, bounds.viewportTop, bounds.width, bounds.height);
        }
        else
        {
          // Update size
          this.setWidth(bounds.containerWidth);
          this.setHeight(bounds.containerHeight);

          // Update coordinate in canvas
          if (this.getResizableLeft() || this.getResizableTop())
          {
            this.setLayoutProperties({
              left : bounds.parentLeft,
              top : bounds.parentTop
            });
          }
        }

        // Full stop for event
        e.stopPropagation();
      }
      else if (!this.hasState("maximized") && !this.__dragDropHandler.isSessionActive())
      {
        this.__computeResizeMode(e);

        var resizeActive = this.__resizeActive;
        var root = this.getApplicationRoot();

        if (resizeActive)
        {
          var cursor = this.__resizeCursors[resizeActive];
          this.setCursor(cursor);
          root.setGlobalCursor(cursor);
        }
        else if (this.getCursor())
        {
          this.resetCursor();
          root.resetGlobalCursor();
        }
      }
    },


    /**
     * Event handler for the mouse out event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     */
    __onResizeMouseOut : function(e)
    {
      // When the mouse left the window and resizing is not yet
      // active we must be sure to (especially) reset the global
      // cursor.
      if (this.getCursor() && !this.hasState("resize"))
      {
        this.resetCursor();
        this.getApplicationRoot().resetGlobalCursor();
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__resizeFrame != null && !qx.core.ObjectRegistry.inShutDown)
    {
      this.__resizeFrame.destroy();
      this.__resizeFrame = null;
    }

    this.__dragDropHandler = null;
  }
});
