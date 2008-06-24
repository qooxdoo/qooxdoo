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

/*

TODOS: 
- Convert to sub-control support
- Use global cursor to control cursor

*/

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
    this.addListener("losecapture", this._onLoseCapture);
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
      var splitter = this._getChildControl("splitter");
      var slider = this._getChildControl("slider");
      
      // Only proceed if left mouse button is pressed and mouse is on/near splitter widget
      if (!e.isLeftPressed() || !splitter.hasState("active")) {
        return;
      }

      var splitterElement = splitter.getContainerElement().getDomElement();
      var splitterLocation = qx.bom.element.Location.get(splitterElement);
      var splitterWidht = qx.bom.element.Dimension.getWidth(splitterElement);
      var splitterHeight = qx.bom.element.Dimension.getHeight(splitterElement);

      // Store offset between mouse event coordinates and splitter
      this._sizes = 
      {
        left : e.getDocumentLeft() - splitterLocation.left,
        right : (splitterLocation.left + splitterWidht) - e.getDocumentLeft(),
        top : e.getDocumentTop() - splitterLocation.top,
        bottom : (splitterLocation.top + splitterHeight) - e.getDocumentTop()
      };

      // Synchronize slider to splitter size and show it
      var bounds = splitter.getBounds();
      slider.setUserBounds(bounds.left, bounds.top, bounds.width, bounds.height);
      slider.setZIndex(splitter.getZIndex() + 1);
      slider.show();

      // Enable session
      this.__active = true;
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
      this._lastCoords = 
      {
        x : e.getDocumentLeft(),
        y : e.getDocumentTop()
      };

      // Check if slider is already being dragged
      if (this.__active) 
      {
        var paneElement = this.getContainerElement().getDomElement();
        var paneLocation = qx.bom.element.Location.get(paneElement);

        var begin = this.getBegin();
        var end = this.getEnd();

        var firstHint = begin.getSizeHint();
        var secondHint = end.getSizeHint();

        if(this._isHorizontal) {
          this._updateSliderHorizontal(paneLocation, begin, end, firstHint, secondHint);
        } else {
          this._updateSliderVertical(paneLocation, begin, end, firstHint, secondHint);
        }
      } 
      else 
      {
        var splitter = this._getChildControl("splitter");
        var splitterElement = splitter.getContainerElement().getDomElement();
        var splitterLocation = qx.bom.element.Location.get(splitterElement);

        this._updateState(this._lastCoords, splitterElement, splitterLocation);
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
      var slider = this._getChildControl("slider");

      if (!this.__active) {
        // Check if mouse cursor is on splitter element
        if(e.getType() == "losecapture")
        {
          var sliderElement = slider.getContainerElement().getDomElement();
          var sliderLocation = qx.bom.element.Location.get(sliderElement);

          this._updateState(this._mouseUpCoords, sliderElement, sliderLocation);
        }
        return;
      }

      // Set sizes to both widgets
      this._setSizes();

      // Hide the slider       
      //this._syncBounds(slider);
      slider.setOpacity(0.7)
      //slider.exclude();

      // Cleanup
      delete this.__active;
      this._mouseUpCoords =
      {
        "x" : e.getDocumentLeft(),
        "y" : e.getDocumentTop()
      };

      this._sizes = null;
      this.releaseCapture();
    },


    /**
     * Handler for losecapture event.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} A valid mouse event
     */
    _onLoseCapture : function(e) {
      this._onMouseUp(e);
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
    _setSizes : function()
    {
      var sizes = this._sizes;
      
      // Only proceed if the mouse has been moved
      if (!sizes || !sizes.first) {
        return;
      }

      var firstWidget = this.getBegin();
      var secondWidget = this.getEnd();

      // Read widgets' flex values
      var firstFlexValue = firstWidget.getLayoutProperties().flex;
      var secondFlexValue = secondWidget.getLayoutProperties().flex;
      
      // Both widgets have flex values
      if((firstFlexValue != 0) && (secondFlexValue != 0))
      {
        var sum = sizes.first + sizes.second;
        // Update flex values
        firstWidget.setLayoutProperties({ flex : (sizes.first / sum) });
        secondWidget.setLayoutProperties({ flex : (sizes.second / sum) });
      }
      
      // Only first widget has a flex value
      else if(firstFlexValue != 0)
      {
        // Set width to static widget
        if (this._isHorizontal) {
          secondWidget.setWidth(sizes.second);
        } else {
          secondWidget.setHeight(sizes.second);
        }
      }
      
      // Only second widget has a flex value
      else if(secondFlexValue != 0)
      {
        // Set width to static widget
        if (this._isHorizontal) {
          firstWidget.setWidth(sizes.first);
        } else {
          firstWidget.setHeight(sizes.first);
        }
      }
      
      // Both widgets have static values
      else
      {
        // Set widths to static widgets
        if (this._isHorizontal) 
        {
          firstWidget.setWidth(sizes.first);
          secondWidget.setWidth(sizes.second);
        }
        else
        {
          firstWidget.setHeight(sizes.first);
          secondWidget.setHeight(sizes.second);
        }
      }
    },
    
    
    _minActiveRange : 5,
    
    
    /**
     * Checks if mouse cursor is on or near the splitter widget.
     * This method will be used for horizontal orientation. 
     *
     * @type member
     * @param x {Integer} Mouse cursor's x coordinate
     * @param splitterElement {Object} DOM element of the container widget of the Splitter
     * @param splitterLocation {Map} The location map of the splitterElement
     * @return {Boolean} True if mouse cursor is near to splitter, otherwise false.
     */
    __nearHorizontal : function(x, splitterElement, splitterLocation)
    {
      var splitterSize = splitterElement.offsetWidth;
      var min = this._minActiveRange;

      if (splitterSize < min)
      {
        var sizeDiff = Math.floor((min - splitterSize) / 2);
        splitterLocation.left -= sizeDiff;
        splitterLocation.right += sizeDiff;
      }
  
      // Check if mouse is on/near splitter and indicate status 
      return !(x < splitterLocation.left || x > splitterLocation.right);
    },
    
    
    /**
     * Checks if mouse cursor is on or near the splitter widget.
     * This method will be used for vertical orientation. 
     *
     * @type member
     * @param y {Integer} Mouse cursor's y coordinate
     * @param splitterElement {Object} DOM element of the container widget of the Splitter
     * @param splitterLocation {Map} The location map of the splitterElement
     * @return {Boolean} True if mouse cursor is near to splitter, otherwise false.
     */
    __nearVertical : function(y, splitterElement, splitterLocation)
    {
      var splitterSize = splitterElement.offsetHeight;
      var min = this._minActiveRange;

      if (splitterSize < min)
      {
        var sizeDiff = Math.floor((min - splitterSize) / 2);
        splitterLocation.top -= sizeDiff;
        splitterLocation.bottom += sizeDiff;
      }
  
      // Check if mouse is on/near splitter and indicate status 
      return !(y < splitterLocation.top || y > splitterLocation.bottom);
    },


    /**
     * Moves the slider widget and stores the current widget sizes.
     * This method will be used for horizontal orientation. 
     *
     * @type member
     * @param paneLocation {Map} The location map of the SplitPane
     * @param begin {qx.ui.core.Widget} The first widget.
     * @param end {qx.ui.core.Widget} The second widget.
     * @param firstHint {Map} The first widget's size hint map
     * @param secondHint {Map} The second widget's size hint map
     */
    _updateSliderHorizontal : function(paneLocation, begin, end, firstHint, secondHint)
    {
      // Calculate widget sizes
      var eventLeft = this._lastCoords.x;
      
      var firstWidth = eventLeft - paneLocation.left - this._sizes.left;
      var secondWidth = paneLocation.right - this._sizes.right - eventLeft;
      
      var diff = 0;
      var slider = this._getChildControl("slider");

      // Check if current sizes are valid
      if(firstWidth > firstHint.minWidth && firstWidth < firstHint.maxWidth && 
         secondWidth > secondHint.minWidth && secondWidth < secondHint.maxWidth)
      {
        // Stores sizes
        this._sizes.first = firstWidth;
        this._sizes.second = secondWidth;
      }

      // Move slider widget
      slider.getContainerElement().setStyle("left", this._sizes.first + "px", true);
    },


    /**
     * Moves the slider widget and stores the current widget sizes.
     * This method will be used for vertical orientation. 
     *
     * @type member
     * @param paneLocation {Map} The location map of the SplitPane
     * @param begin {qx.ui.core.Widget} The first widget.
     * @param end {qx.ui.core.Widget} The second widget.
     * @param firstHint {Map} The first widget's size hint map
     * @param secondHint {Map} The second widget's size hint map
     */
    _updateSliderVertical : function(paneLocation, begin, end, firstHint, secondHint)
    {
      // Calculate widget sizes
      var eventTop = this._lastCoords.y;
      
      var slider = this._getChildControl("slider");
      var firstHeight = eventTop - paneLocation.top - this._sizes.top;
      var secondHeight = paneLocation.bottom - this._sizes.bottom - eventTop;

      // Check if current sizes are valid
      if(firstHeight > firstHint.minHeight && firstHeight < firstHint.maxHeight && 
         secondHeight > secondHint.minHeight && secondHeight < secondHint.maxHeight)
      {
        // Stores sizes
        this._sizes.first = firstHeight;
        this._sizes.second = secondHeight;
      }

      // Check min sizes:
      if (firstHeight < firstHint.minHeight) {
        firstHeight = firstHint.minHeight;
      }

      if (secondHeight < secondHint.minHeight) 
      {
        var diff = secondHint.minHeight - secondHeight;
        secondHeight = secondHint.minHeight;
        firstHeight = firstHeight - diff;
      }

      // Move slider widget
      slider.getContainerElement().setStyle("top", firstHeight + "px", true);
    },

    
    /**
     * Synchronizes the given widget to its user bounds.
     *
     * @type member
     * @param widget {qx.ui.core.Widget} The widget
     */
    _syncBounds : function(widget)
    {
      var bounds = widget.getBounds();
      var el = widget.getContainerElement();
      
      var left = el.setStyle("left", bounds.left + "px");
      var top = el.setStyle("top", bounds.top + "px");
    },


    /**
     * Sets the SplitPane's state depending on the mouse position.
     *
     * @type member
     * @param coords {Map} Current mouse position
     * @param splitterElement {Object} DOM element of the container widget of the Splitter
     * @param splitterLocation {Map} The location map of the splitterElement
     */
    _updateState : function(coords, splitterElement, splitterLocation)
    {
      var splitter = this._getChildControl("splitter");
      var near = this._isHorizontal ?
        this.__nearHorizontal(coords.x, splitterElement, splitterLocation) : 
        this.__nearVertical(coords.y, splitterElement, splitterLocation); 

      if (near) 
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


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeMap("_sizes");
  }
});
