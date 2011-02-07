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
 * A split panes divides an area into two panes. The ratio between the two
 * panes is configurable by the user using the splitter.
 *
 * @childControl slider {qx.ui.splitpane.Slider} shown during resizing the splitpane
 * @childControl splitter {qx.ui.splitpane.Splitter} splitter to resize the splitpane
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

    // add all mouse listener to the blocker
    this.__blocker.addListener("mousedown", this._onMouseDown, this);
    this.__blocker.addListener("mouseup", this._onMouseUp, this);
    this.__blocker.addListener("mousemove", this._onMouseMove, this);
    this.__blocker.addListener("mouseout", this._onMouseOut, this);
    this.__blocker.addListener("losecapture", this._onMouseUp, this);
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
    __blocker : null,


    // overridden
    _createChildControlImpl : function(id, hash)
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
          control.addListener("move", this.__onSplitterMove, this);
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Move handler for the spliiter which takes care of the external
     * triggered resize of children.
     *
     * @param e {qx.event.type.Data} The data even of move.
     */
    __onSplitterMove : function(e) {
      this.__setBlockerPosition(e.getData());
    },


    /**
     * Creates a blocker for the splitter which takes all bouse events and
     * also handles the offset and cursor.
     *
     * @param orientation {String} The orientation of the pane.
     */
    __createBlocker : function(orientation) {
      this.__blocker = new qx.ui.splitpane.Blocker(orientation);
      this.getContentElement().add(this.__blocker);

      var splitter = this.getChildControl("splitter");
      var splitterWidth = splitter.getWidth();
      if (!splitterWidth) {
        splitter.addListenerOnce("appear", function() {
          this.__setBlockerPosition();
        }, this);
      }

      // resize listener to remove the blocker in case the splitter
      // is removed.
      splitter.addListener("resize", function(e) {
        var bounds = e.getData();
        if (bounds.height == 0 || bounds.width == 0) {
          this.__blocker.hide();
        } else {
          this.__blocker.show();
        }
      }, this);
    },


    /**
     * Returns the blocker used over the splitter. this could be used for
     * adding event listeners like click or dblclick.
     *
     * @return {qx.ui.splitpane.Blocker} The used blocker element.
     *
     * @internal
     */
    getBlocker : function() {
      return this.__blocker;
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
      var splitter = this.getChildControl("splitter");

      // Store boolean flag for faster access
      this.__isHorizontal = value === "horizontal";

      if (!this.__blocker) {
        this.__createBlocker(value);
      }

      // update the blocker
      this.__blocker.setOrientation(value);

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

      // flush (needs to be done for the blocker update) and update the blocker
      qx.ui.core.queue.Manager.flush();
      this.__setBlockerPosition();
    },


    // property apply
    _applyOffset : function(value, old) {
      this.__setBlockerPosition();
    },


    /**
     * Helper for setting the blocker to the right position, which depends on
     * the offset, orientation and the current position of the splitter.
     *
     * @param bounds {Map?null} If the bounds of the splitter are known,
     *   they can be added.
     */
    __setBlockerPosition : function(bounds) {
      var splitter = this.getChildControl("splitter");
      var offset = this.getOffset();
      var splitterBounds = splitter.getBounds();
      var splitterElem = splitter.getContainerElement().getDomElement();

      // do nothing if the splitter is not ready
      if (!splitterElem) {
        return;
      }

      // recalculate the dimensions of the blocker
      if (this.__isHorizontal) {
        // get the width either of the given bounds or of the read bounds
        var width = null;
        if (bounds) {
          width = bounds.width;
        } else if (splitterBounds) {
          width = splitterBounds.width;
        }
        var left = bounds && bounds.left;

        if (width) {
          if (isNaN(left)) {
            left = qx.bom.element.Location.getPosition(splitterElem).left;
          }
          this.__blocker.setWidth(offset, width);
          this.__blocker.setLeft(offset, left);
        }

      // vertical case
      } else {
        // get the height either of the given bounds or of the read bounds
        var height = null;
        if (bounds) {
          height = bounds.height;
        } else if (splitterBounds) {
          height = splitterBounds.height;
        }
        var top =  bounds && bounds.top;

        if (height) {
          if (isNaN(top)) {
            top = qx.bom.element.Location.getPosition(splitterElem).top;
          }
          this.__blocker.setHeight(offset, height);
          this.__blocker.setTop(offset, top);
        }
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
    remove : function(widget)
    {
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
      if (!e.isLeftPressed()) {
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
      slider.setUserBounds(
        splitterBounds.left, splitterBounds.top,
        splitterBounds.width, splitterBounds.height
      );

      slider.setZIndex(splitter.getZIndex() + 1);
      slider.show();

      // Enable session
      this.__activeDragSession = true;
      this.__blocker.capture();

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
          this.__blocker.setStyle("left", (pos - this.getOffset()) + "px");
        } else {
          slider.setDomTop(pos);
          this.__blocker.setStyle("top", (pos - this.getOffset()) + "px");
        }

        e.stop();
      }
    },


    /**
     * Handler for mouseout event
     *
     * @param e {qx.event.type.Mouse} mouseout event
     */
    _onMouseOut : function(e)
    {
      this._setLastMousePosition(e.getDocumentLeft(), e.getDocumentTop());
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

      e.stop();
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
     * Computes widgets' sizes based on the mouse coordinate.
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
