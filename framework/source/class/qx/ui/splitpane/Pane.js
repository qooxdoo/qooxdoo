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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A split panes divides a area into two panes. The ratio between the two
 * panes is configurable by the user using the splitter.
 */
qx.Class.define("qx.ui.splitpane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of a SplitPane. It allows the user to dynamically
   * resize the areas dropping the border between.
   *
   * @param orientation {String} The orientation of the split pane control.
   * Allowed values are "horizontal" (default) and "vertical".
   */
  construct : function(orientation)
  {
    this.base(arguments);

    this.__children = [];

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    // Note that mouseUp and mouseDown events are added to the widget itself because
    // if the splitter is smaller than 5 pixels in length or height it is difficult
    // to click on it.

    // By adding events to the widget the splitter can be activated if the cursor is
    // near to the splitter widget.
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("mousemove", this._onMouseMove);
    this.addListener("mouseout", this._onMouseOut);
    this.addListener("losecapture", this._onMouseUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "splitpane"
    },

    /**
     * Distance between mouse cursor and splitter when the cursor should change
     * and enable resizing.
     */
    offset :
    {
      check : "Integer",
      init : 6,
      apply : "_applyOffset"
    },

    /**
     * The orientation of the splitpane control.
     */
    orientation :
    {
      init  : "horizontal",
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __splitterOffset : null,
    __activeDragSession : false,
    __lastMouseX : null,
    __lastMouseY : null,
    __isHorizontal : null,
    __beginSize : null,
    __endSize : null,
    __children : null,

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        // Create and add slider
        case "slider":
          control = new qx.ui.splitpane.Slider(this);
          control.exclude();
          this._add(control, {type : id});
          break;

        // Create splitter
        case "splitter":
          control = new qx.ui.splitpane.Splitter(this);
          this._add(control, {type : id});
          control.addListener("move", this._onSplitterMove, this);

          // Opera seems to skip mouse move events. In order notice if the
          // mouse in on the splitter, a listener for mouseover is added.
          if (qx.bom.client.Engine.OPERA) {
            control.addListener("mouseover", this._onSplitterMouseOver, control);
          }
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply routine for the orientation property.
     *
     * Sets the pane's layout to vertical or horizontal split layout.
     *
     * @param value {String} The new value of the orientation property
     * @param old {String} The old value of the orientation property
     */
    _applyOrientation : function(value, old)
    {
      var slider = this.getChildControl("slider");
      var splitter = this.getChildControl("splitter")

      // Store boolean flag for faster access
      this.__isHorizontal = value === "horizontal";

      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }

      // Create new layout
      var newLayout = value === "vertical" ?
        new qx.ui.splitpane.VLayout : new qx.ui.splitpane.HLayout;
      this._setLayout(newLayout);

      // Update states for splitter and slider
      splitter.removeState(old);
      splitter.addState(value);
      splitter.getChildControl("knob").removeState(old);
      splitter.getChildControl("knob").addState(value);
      slider.removeState(old);
      slider.addState(value);
    },


    // property apply
    _applyOffset : function(value, old)
    {
      var splitter = this.getChildControl("splitter")

      if (old === 0)
      {
        // Remove listeners from splitter
        splitter.removeListener("mousedown", this._onMouseDown, this);
        splitter.removeListener("mousemove", this._onMouseMove, this);
        splitter.removeListener("mouseout", this._onMouseOut, this);
        splitter.removeListener("mouseup", this._onMouseUp, this);
        splitter.removeListener("losecapture", this._onMouseUp, this);


        // Add listeners to pane
        this.addListener("mousedown", this._onMouseDown);
        this.addListener("mouseup", this._onMouseUp);
        this.addListener("mousemove", this._onMouseMove);
        this.addListener("mouseout", this._onMouseOut);
        this.addListener("losecapture", this._onMouseUp);
      }

      if (value === 0)
      {
        // Remove listeners from pane
        this.removeListener("mousedown", this._onMouseDown);
        this.removeListener("mouseup", this._onMouseUp);
        this.removeListener("mousemove", this._onMouseMove);
        this.removeListener("mouseout", this._onMouseOut);
        this.removeListener("losecapture", this._onMouseUp);

        // Add listeners to splitter
        splitter.addListener("mousedown", this._onMouseDown, this);
        splitter.addListener("mousemove", this._onMouseMove, this);
        splitter.addListener("mouseout", this._onMouseOut, this);
        splitter.addListener("mouseup", this._onMouseUp, this);
        splitter.addListener("losecapture", this._onMouseUp, this);
      }
    },



    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a widget to the pane.
     *
     * Sets the pane's layout to vertical or horizontal split layout. Depending on the
     * pane's layout the first widget will be the left or top widget, the second one
     * the bottom or right widget. Adding more than two widgets will overwrite the
     * existing ones.
     *
     * @param widget {qx.ui.core.Widget} The widget to be inserted into pane.
     * @param flex {Number} The (optional) layout property for the widget's flex value.
     */
    add : function(widget, flex)
    {
      if (flex == null) {
        this._add(widget);
      } else {
        this._add(widget, {flex : flex});
      }
      this.__children.push(widget);
    },


    /**
     * Removes the given widget from the pane.
     *
     * @param widget {qx.ui.core.Widget} The widget to be removed.
     */
    remove : function(widget) {
      this._remove(widget);
      qx.lang.Array.remove(this.__children, widget);
    },


    /**
     * Returns an array containing the pane's content.
     *
     * @return {qx.ui.core.Widget[]} The pane's child widgets
     */
    getChildren : function() {
      return this.__children;
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
     * @param e {qx.event.type.Mouse} mouseDown event
     */
    _onMouseDown : function(e)
    {

      // Only proceed if left mouse button is pressed and the splitter is active
      if (!e.isLeftPressed() || !this._isNear()) {
        return;
      }

      var splitter = this.getChildControl("splitter");

      // Store offset between mouse event coordinates and splitter
      var splitterLocation = splitter.getContainerLocation();
      var paneLocation = this.getContentLocation();
      this.__splitterOffset = this.__isHorizontal ?
        e.getDocumentLeft() - splitterLocation.left + paneLocation.left :
        e.getDocumentTop() - splitterLocation.top + paneLocation.top ;

      // Synchronize slider to splitter size and show it
      var slider = this.getChildControl("slider");
      var splitterBounds = splitter.getBounds();
      slider.setUserBounds(splitterBounds.left, splitterBounds.top,
        splitterBounds.width, splitterBounds.height);

      slider.setZIndex(splitter.getZIndex() + 1);
      slider.show();

      // Enable session
      this.__activeDragSession = true;
      e.getCurrentTarget().capture();

      e.stop();
    },


    /**
     * Handler for mousemove event.
     *
     * @param e {qx.event.type.Mouse} mouseMove event
     */
    _onMouseMove : function(e)
    {
      this._setLastMousePosition(e.getDocumentLeft(), e.getDocumentTop());

      // Check if slider is already being dragged
      if (this.__activeDragSession)
      {
        // Compute new children sizes
        this.__computeSizes();

        // Update slider position
        var slider = this.getChildControl("slider");
        var pos = this.__beginSize;

        if(this.__isHorizontal) {
          slider.setDomLeft(pos);
        } else {
          slider.setDomTop(pos);
        }

        e.stop();
      }
      else
      {
        this.__updateCursor();
      }
    },


    /**
     * Handler for mouseout event
     *
     * @param e {qx.event.type.Mouse} mouseout event
     */
    _onMouseOut : function(e)
    {
      this._setLastMousePosition(-1, -1);
      this.__updateCursor();
    },


    /**
     * Handler for mouseup event
     *
     * Sets widget sizes if dragging session has been active.
     *
     * @param e {qx.event.type.Mouse} mouseup event
     */
    _onMouseUp : function(e)
    {
      if (!this.__activeDragSession) {
        return;
      }

      // Set sizes to both widgets
      this._finalizeSizes();

      // Hide the slider
      var slider = this.getChildControl("slider");
      slider.exclude();


      // Cleanup
      this.__activeDragSession = false;
      this.releaseCapture();

      // Update the cursor
      // Needed in cases where the splitter has not been moved
      this.__updateCursor();

      e.stop();
    },


    /**
     * Handler for move event of splitter
     *
     */
    _onSplitterMove : function() {
      this.__updateCursor();
    },


    /**
     * Helper function for Opera to add an "active" state if the mouse is on
     * the splitter.
     *
     */
    _onSplitterMouseOver : function() {
      this.addState("active");
    },


    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Updates widgets' sizes based on the slider position.
     */
    _finalizeSizes : function()
    {
      var beginSize = this.__beginSize;
      var endSize = this.__endSize;

      if (beginSize == null) {
        return;
      }

      var children = this._getChildren();
      var firstWidget = children[2];
      var secondWidget = children[3];

      // Read widgets' flex values
      var firstFlexValue = firstWidget.getLayoutProperties().flex;
      var secondFlexValue = secondWidget.getLayoutProperties().flex;

      // Both widgets have flex values
      if((firstFlexValue != 0) && (secondFlexValue != 0))
      {
        firstWidget.setLayoutProperties({ flex : beginSize });
        secondWidget.setLayoutProperties({ flex : endSize });
      }

      // Update both sizes
      else
      {
        // Set widths to static widgets
        if (this.__isHorizontal)
        {
          firstWidget.setWidth(beginSize);
          secondWidget.setWidth(endSize);
        }
        else
        {
          firstWidget.setHeight(beginSize);
          secondWidget.setHeight(endSize);
        }
      }
    },


    /**
     * Checks if mouse cursor is on or near the splitter widget.
     * This method will be used for horizontal orientation.
     *
     * @return {Boolean} True if mouse cursor is near to splitter, otherwise false.
     */
    _isNear : function()
    {
      var splitter = this.getChildControl("splitter");
      var splitterBounds = splitter.getBounds();
      var splitterLocation = splitter.getContainerLocation();
      var min = this.getOffset();

      // Check whether created
      if (!splitterLocation) {
        return;
      }

      // Check horizontal
      var mouse = this.__lastMouseX;
      var size = splitterBounds.width;
      var pos = splitterLocation.left;

      if (size < min)
      {
        pos -= Math.floor((min - size) / 2);
        size = min;
      }

      if (mouse < pos || mouse > (pos + size)) {
        return false;
      }

      // Check vertical
      var mouse = this.__lastMouseY;
      var size = splitterBounds.height;
      var pos = splitterLocation.top;

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


    /**
     * Updates the pane's cursor based on the mouse position
     *
     */
     __updateCursor :  function()
     {
       var splitter = this.getChildControl("splitter");
       var root = this.getApplicationRoot();

       // Whether the cursor is near enough to the splitter
       if (this.__activeDragSession || this._isNear())
       {
         var cursor = this.__isHorizontal ? "col-resize" : "row-resize";
         this.setCursor(cursor);
         root.setGlobalCursor(cursor);
         splitter.addState("active");
       }
       else if (splitter.hasState("active"))
       {
         this.resetCursor();
         root.resetGlobalCursor();
         splitter.removeState("active");
       }
     },


    /**
     * Computes widgets' sizes based on the mouse coordinate
     *
     */
    __computeSizes : function()
    {
      if (this.__isHorizontal) {
        var min="minWidth", size="width", max="maxWidth", mouse=this.__lastMouseX;
      } else {
        var min="minHeight", size="height", max="maxHeight", mouse=this.__lastMouseY;
      }

      var children = this._getChildren();
      var beginHint = children[2].getSizeHint();
      var endHint = children[3].getSizeHint();

      // Area given to both widgets
      var allocatedSize = children[2].getBounds()[size] + children[3].getBounds()[size];

      // Calculate widget sizes
      var beginSize = mouse - this.__splitterOffset;
      var endSize = allocatedSize - beginSize;

      // Respect minimum limits
      if (beginSize < beginHint[min])
      {
        endSize -= beginHint[min] - beginSize;
        beginSize = beginHint[min];
      }
      else if (endSize < endHint[min])
      {
        beginSize -= endHint[min] - endSize;
        endSize = endHint[min];
      }

      // Respect maximum limits
      if (beginSize > beginHint[max])
      {
        endSize += beginSize - beginHint[max];
        beginSize = beginHint[max];
      }
      else if (endSize > endHint[max])
      {
        beginSize += endSize - endHint[max];
        endSize = endHint[max];
      }

      // Store sizes
      this.__beginSize = beginSize;
      this.__endSize = endSize;
    },

    /**
     * Determines whether this is an active drag session
     *
     * @return {Boolean} True if active drag session, otherwise false.
     */
    _isActiveDragSession : function() {
      return this.__activeDragSession;
    },


    /**
     * Sets the last mouse position.
     *
     * @param x {Integer} the x position of the mouse cursor.
     * @param y {Integer} the y position of the mouse cursor.
     */
     _setLastMousePosition : function(x, y)
     {
       this.__lastMouseX = x;
       this.__lastMouseY = y;
     }
  },


  destruct : function() {
    this.__children = null;
  }
});
