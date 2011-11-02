/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.RowHeader",
{
  extend : qx.ui.core.Widget,


  construct : function(name)
  {
    this.base(arguments);

    this.setDecorator("main");

    var label = new qx.ui.basic.Label(name);
    this._setLayout(new qx.ui.layout.HBox);
    this._add(label);

    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("mousemove", this._onMouseMove);
    this.addListener("mouseout", this._onMouseOut);
    this.addListener("losecapture", this._onMouseUp);

  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastMouseX : null,
    __lastMouseY : null,
    __activeDragSession : null,
    __initialMouseX : null,
    __initialMouseY : null,


    /**
     * Updates the pane's cursor based on the mouse position
     *
     */
    __updateCursor : function()
    {
      // var splitter = this.getChildControl("splitter");
      // var root = this.getApplicationRoot();
      //
      // // Whether the cursor is near enough to the splitter
      // if (this.__activeDragSession || this.__isNear())
      // {
      //   var cursor = this.__isHorizontal ? "col-resize" : "row-resize";
      //   this.setCursor(cursor);
      //   root.setGlobalCursor(cursor);
      //   splitter.addState("active");
      // }
      // else if (splitter.hasState("active"))
      // {
      //   this.resetCursor();
      //   root.resetGlobalCursor();
      //   splitter.removeState("active");
      // }
    },


    /**
     * Checks if mouse cursor is on or near the splitter widget.
     * This method will be used for horizontal orientation.
     *
     * @return {Boolean} True if mouse cursor is near to splitter, otherwise false.
     */
    __isNear : function()
    {
      var bounds = this.getBounds();
      var location = this.getContainerLocation();
      var min = 6;

      // TOOD:
      // // Check horizontal
      // var mouse = this.__lastMouseX;
      // var size = bounds.width;
      // var pos = location.left;
      //
      // if (size < min)
      // {
      //   pos -= Math.floor((min - size) / 2);
      //   size = min;
      // }
      //
      // if (mouse < pos || mouse > (pos + size)) {
      //   return false;
      // }

      // Check vertical
      var mouse = this.__lastMouseY;
      var size = bounds.height;
      var pos = location.top;

      if (size < min)
      {
        pos -= Math.floor((min - size) / 2);
        size = min;
      }

      if (mouse < pos || mouse > (pos + size)) {
        return false;
      }

      // Finally return true
      return true;
    },






    /*
    ---------------------------------------------------------------------------
      MOUSE LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for mousedown event.
     *
     * Shows slider widget and starts drag session if mouse is near/on splitter widget.
     *
     * @param e {qx.event.type.MouseEvent} mouseDown event
     */
    _onMouseDown : function(e)
    {
      // Only proceed if left mouse button is pressed
      if (!e.isLeftPressed()) {
        return;
      }

      this.__initialMouseX = e.getDocumentLeft();
      this.__initialMouseY = e.getDocumentTop();


      // Enable session
      this.__activeDragSession = true;
      this.capture();
    },


    /**
     * Handler for mousemove event.
     *
     * @param e {qx.event.type.MouseEvent} mouseMove event
     */
    _onMouseMove : function(e)
    {
      // Update mouse position
      // Check if slider is already being dragged
      if (this.__activeDragSession)
      {
        var bounds = this.getBounds();
        var location = this.getContainerLocation();

        this.__lastMouseX = e.getDocumentLeft();
        this.__lastMouseY = e.getDocumentTop();

        var offsetX = location.left + bounds.width - this.__initialMouseX;
//        var offsetY = this.__lastMouseY - this.__initialMouseY;



        this.setWidth(bounds.width + offsetX);
      }
      else
      {
        this.__updateCursor();
      }
    },


    /**
     * Handler for mouseout event
     *
     * @param e {qx.event.type.MouseEvent} mouseout event
     */
    _onMouseOut : function(e)
    {
      // Force mouse positions to -1
      this.__lastMouseX = -1;
      this.__lastMouseY = -1;

      // Update cursor
      this.__updateCursor();
    },


    /**
     * Handler for mouseup event
     *
     * Sets widget sizes if dragging session has been active.
     *
     * @param e {qx.event.type.MouseEvent} mouseup event
     */
    _onMouseUp : function(e)
    {
      if (!this.__activeDragSession) {
        return;
      }

      // Cleanup
      delete this.__activeDragSession;
      this.releaseCapture();

      // Update the cursor
      // Needed in cases where the splitter has not been moved
      this.__updateCursor();
    }


  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    //this._disposeObjects();
  }

});
