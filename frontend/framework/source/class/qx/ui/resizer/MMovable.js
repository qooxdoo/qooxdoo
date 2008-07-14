/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Provides move behavior to any widget.
 */
qx.Mixin.define("qx.ui.resizer.MMovable",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    var control = this._getMovableTarget();
    control.addListener("mousedown", this._onMoveMouseDown, this);
    control.addListener("mouseup", this._onMoveMouseUp, this);
    control.addListener("mousemove", this._onMoveMouseMove, this);
    control.addListener("losecapture", this.__onMoveLoseCapture, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    movable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyMoveable"
    },

    useMoveFrame :
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
    __getMoveFrame : function()
    {
      var frame = this.__moveFrame;
      if (!frame)
      {
        frame = this.__moveFrame = new qx.ui.core.Widget();
        frame.setAppearance("move-frame");
        frame.exclude();

        qx.core.Init.getApplication().getRoot().add(frame);
      }

      return frame;
    },


    /**
     * Creates, shows and syncs the frame with the widget.
     */
    __showMoveFrame : function()
    {
      var bounds = this.getBounds();
      var frame = this.__getMoveFrame();
      frame.setUserBounds(bounds.left, bounds.top, bounds.width, bounds.height);
      frame.show();
      frame.setZIndex(this.getZIndex()+1);
    },




    /*
    ---------------------------------------------------------------------------
      MOVE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the new drag coordinates
     */
    __computeMoveCoordinates : function(e)
    {
      var range = this._dragRange;
      var mouseLeft = Math.max(range.left, Math.min(range.right, e.getDocumentLeft()));
      var mouseTop = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop()));

      return {
        left : this._dragLeft + mouseLeft,
        top : this._dragTop + mouseTop
      };
    },




    /*
    ---------------------------------------------------------------------------
      MOVE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Enables the capturing of the caption bar and prepares the drag session and the
     * appearance (translucent, frame or opaque) for the moving of the window.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse down event
     * @return {void}
     */
    _onMoveMouseDown : function(e)
    {
      if (!this.getMoveable()) {
        return;
      }

      // Compute drag range
      this._dragRange = this.getLayoutParent().getContentLocation();

      // Compute drag positions
      var widgetLocation = this.getContainerLocation();
      this._dragLeft = widgetLocation.left - e.getDocumentLeft();
      this._dragTop = widgetLocation.top - e.getDocumentTop();

      // Add state
      this.addState("drag");

      // Enable capturing
      this._getMovableTarget().capture();

      // Enable drag frame
      if (this.getUseMoveFrame()) {
        this.__showMoveFrame();
      }
    },


    /**
     * Does the moving of the window by rendering the position
     * of the window (or frame) at runtime using direct dom methods.
     *
     * @type member
     * @param e {qx.event.type.Event} mouse move event
     * @return {void}
     */
    _onMoveMouseMove : function(e)
    {
      // Only react when dragging is active
      if (!this.hasState("drag")) {
        return;
      }

      // Apply new coordinates using DOM
      var coords = this.__computeMoveCoordinates(e);
      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().setDomPosition(coords.left, coords.top);
      } else {
        this.setDomPosition(coords.left, coords.top);
      }
    },


    /**
     * Disables the capturing of the caption bar and moves the window
     * to the last position of the drag session. Also restores the appearance
     * of the window.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse up event
     * @return {void}
     */
    _onMoveMouseUp : function(e)
    {
      // Only react when dragging is active
      if (!this.hasState("drag")) {
        return;
      }

      // Remove drag state
      this.removeState("drag");

      // Disable capturing
      this._getMovableTarget().releaseCapture();

      // Apply them to the layout
      var coords = this.__computeMoveCoordinates(e);
      this.setLayoutProperties({ left: coords.left, top: coords.top });

      // Hide frame afterwards
      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().exclude();
      }
    },


    __onMoveLoseCapture : function(e)
    {
      // Check for active resize
      if (!this._resizeMode) {
        return;
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__moveFrame");
  }
});
