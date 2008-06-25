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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 *
 * @appearance splitpane-pane
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
   * @param orientation {String} The orientation of the splitpane control.
   * Allowed values are "horizontal" (default) and "vertical".
   * This is the same type as used in {@link qx.ui.layout.HBox#orientation}.
   */
  construct : function(orientation)
  {
    this.base(arguments);
    
    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    // Add events
    
    // Note that mouseUp and mouseDown events are added to the widget itself because
    // if the splitter is smaller than 5 pixels in length or height it is difficult
    // to click on it.
    
    // By adding events to the widget the splitter can be activated if the cursor is
    // near to the splitter widget.
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("mousemove", this._onMouseMove);
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
     * The orientation of the splitpane control.  
     */
    orientation :
    {
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
     * @type member
     * @param value {String} The new value of the orientation property
     * @param old {String} The old value of the orientation property
     */
    _applyOrientation : function(value, old)
    {
      var slider = this._getChildControl("slider");
      var splitter = this._getChildControl("splitter")

      // Store boolean flag for faster access
      this._isHorizontal = value === "horizontal";
      
      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }
      
      // Create new layout
      var newLayout = value === "vertical" ? 
        new qx.ui.layout.VSplit : new qx.ui.layout.HSplit;
      this._setLayout(newLayout);

      // Update states for splitter and slider
      splitter.replaceState(old, value);
      slider.replaceState(old, value);
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
     * the bottom or left widget. Adding more than two widgets will overwrite the
     * existing ones. 
     *
     * @type member
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
    },
    

    /**
     * Removes the given widget from the pane.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} The widget to be removed.
     */
    remove : function(widget) {
      this._remove(widget);
    },
    

    /**
     * Returns the pane's first widget. 
     *
     * Depending on the pane's orientation the first widget is the top or left widget.
     *
     * @type member
     * @return {qx.ui.core.Widget} The first widget.
     */
    getBegin : function() {
      return this._getChildren()[2] || null;
    },
    

    /**
     * Returns the pane's second widget. 
     *
     * Depending on the pane's orientation the second widget is the bottom or right widget.
     *
     * @type member
     * @return {qx.ui.core.Widget} The second widget.
     */
    getEnd : function() {
      return this._getChildren()[3] || null;
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
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseDown event
     */
    _onMouseDown : function(e)
    {
      // Only proceed if left mouse button is pressed
      if (!e.isLeftPressed()) {
        return; 
      }
      
      // Only proceed if the splitter is active
      var splitter = this._getChildControl("splitter");
      if (!splitter.hasState("active")) {
        return;
      }

      var slider = this._getChildControl("slider");
      var splitterElement = splitter.getContainerElement().getDomElement();
      var splitterLocation = qx.bom.element.Location.get(splitterElement);
      var splitterBounds = splitter.getBounds();
      var paneLocation = qx.bom.element.Location.get(this.getContentElement().getDomElement());      
      
      // Store offset between mouse event coordinates and splitter
      this.__splitterOffset = this._isHorizontal ? 
        e.getDocumentLeft() - splitterLocation.left + paneLocation.left : 
        e.getDocumentTop() - splitterLocation.top + paneLocation.top ;
      
      // Synchronize slider to splitter size and show it
      slider.setUserBounds(splitterBounds.left, splitterBounds.top, 
        splitterBounds.width, splitterBounds.height);
        
      slider.setZIndex(splitter.getZIndex() + 1);
      slider.show();

      // Enable session
      this.__activeDragSession = true;
      this.capture();
    },


    /**
     * Handler for mousemove event.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseMove event
     */
    _onMouseMove : function(e)
    {
      // Update mouse position
      this._lastMousePosition = this._isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();

      // Check if slider is already being dragged
      if (this.__activeDragSession) 
      {
        this.__computeSizes("minWidth", "width", "maxWidth");
              
        if(this._isHorizontal) {
          this._getChildControl("slider").getContainerElement().setStyle("left", this._beginSize + "px", true);
        } else {
          this._getChildControl("slider").getContainerElement().setStyle("top", this._beginSize + "px", true);
        }
      } 
      else 
      {
        var splitter = this._getChildControl("splitter");

        if (this.__isNear()) 
        {
          this.setCursor(this._isHorizontal ? "col-resize" : "row-resize");
          splitter.addState("active");
        } 
        else 
        {
          this.resetCursor();
          splitter.removeState("active");
        }
      }
    },


    /**
     * Handler for mouseup event
     *
     * Sets widget sizes if dragging session has been active.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
     */
    _onMouseUp : function(e)
    {
      if (!this.__activeDragSession) {
        return;
      }

      // Set sizes to both widgets
      this.__finalizeSizes();

      // Hide the slider       
      var slider = this._getChildControl("slider");
      slider.exclude();

      // Cleanup
      delete this.__activeDragSession;
      this.releaseCapture();
    },



    
    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Updates widgets' sizes bases on slider position.
     *
     * @type member
     */
    __finalizeSizes : function()
    {
      var beginSize = this._beginSize;
      var endSize = this._endSize;
      
      var firstWidget = this.getBegin();
      var secondWidget = this.getEnd();

      // Read widgets' flex values
      var firstFlexValue = firstWidget.getLayoutProperties().flex;
      var secondFlexValue = secondWidget.getLayoutProperties().flex;
      
      // Both widgets have flex values
      if((firstFlexValue != 0) && (secondFlexValue != 0))
      {
        var sum = beginSize + endSize;
        // Update flex values
        firstWidget.setLayoutProperties({ flex : (beginSize / sum) });
        secondWidget.setLayoutProperties({ flex : (endSize / sum) });
      }
      
      // Only first widget has a flex value
      else if(firstFlexValue != 0)
      {
        // Set width to static widget
        if (this._isHorizontal) {
          secondWidget.setWidth(endSize);
        } else {
          secondWidget.setHeight(endSize);
        }
      }
      
      // Only second widget has a flex value
      else if(secondFlexValue != 0)
      {
        // Set width to static widget
        if (this._isHorizontal) {
          firstWidget.setWidth(beginSize);
        } else {
          firstWidget.setHeight(beginSize);
        }
      }
      
      // Both widgets have static values
      else
      {
        // Set widths to static widgets
        if (this._isHorizontal) 
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
     * @type member
     * @return {Boolean} True if mouse cursor is near to splitter, otherwise false.
     */
    __isNear : function()
    {
      var splitter = this._getChildControl("splitter");
      var splitterElement = splitter.getContainerElement().getDomElement();
      var splitterLocation = qx.bom.element.Location.get(splitterElement);
      
      if (this._isHorizontal)
      {
        var splitterSize = splitterElement.offsetWidth;
        if (splitterSize < 5)
        {
          var sizeDiff = Math.floor((5 - splitterSize) / 2);
          
          splitterLocation.left -= sizeDiff;
          splitterLocation.right += sizeDiff;          
        }       
        
        return !(this._lastMousePosition < splitterLocation.left || this._lastMousePosition > splitterLocation.right);
      }
      else
      {
        var splitterSize = splitterElement.offsetHeight;
        if (splitterSize < 5)
        {
          var sizeDiff = Math.floor((5 - splitterSize) / 2);
          
          splitterLocation.top -= sizeDiff;
          splitterLocation.bottom += sizeDiff;          
        }        
        
        return !(this._lastMousePosition < splitterLocation.top || this._lastMousePosition > splitterLocation.bottom);
      }
    },
    
    
    __computeSizes : function(min, size, max)
    {
      var beginHint = this.getBegin().getSizeHint();
      var endHint = this.getEnd().getSizeHint();
      
      // Area given to both widgets
      var allocatedSize = this.getBegin().getBounds()[size] + this.getEnd().getBounds()[size];
      
      // Calculate widget sizes
      var beginSize = this._lastMousePosition - this.__splitterOffset;
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
      this._beginSize = beginSize;
      this._endSize = endSize;
    }
  }
});
