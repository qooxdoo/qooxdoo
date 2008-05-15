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

qx.Class.define("qx.ui.splitpane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of a SplitPane. It allows the user to dynamically resize
   * the areas dropping the border between.
   *
   * Please note that the usage of percents may be problematic because you must respect the
   * divider, too. To create a typical 50,50 split please use flex units instead e.g. "1*", "1*"
   *
   * new qx.ui.splitpane.SplitPane(orientation)
   * new qx.ui.splitpane.SplitPane(orientation, firstSize, secondSize)
   *
   * @appearance splitpane
   *
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   * @param firstSize {String} The size of the left (top) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   * @param secondSize {String} The size of the right (bottom) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   */
  construct : function(orientation, firstSize, secondSize)
  {
    this.base(arguments);

    this.__orientation = orientation == "vertical" ? "vertical" : "horizontal";
    this.__minSplitterSize = 5;
    this.__splitterCoords = {};
    
    // Create and add container
    this._setLayout(new qx.ui.layout.Split(this.__orientation));
    
    // Create and add slider
    this._slider = new qx.ui.splitpane.Slider(this);
    this._slider.setBackgroundColor("red");
    this._slider.setOpacity(0.5)
    this._slider.exclude();
    this._add(this._slider);

    // Create splitter
    this._splitter = new qx.ui.splitpane.Splitter(this).set({
      width : 5,
      backgroundColor : "#ababab"
    });

    // Create areas
    this._firstArea = new qx.ui.core.Widget().set({
      decorator: "black",
      backgroundColor: "yellow",
      height : 200,
      minHeight : 20,
      minWidht: 40
    });

    this._secondArea = new qx.ui.core.Widget().set({
      decorator: "black",
      backgroundColor: "green"
    });

    // Add widgets to container
    this._add(
      this._firstArea,
      {
        mode : "first",
        size : firstSize
      }
    );
    
    this._add(
      this._splitter,
      {
        mode : "splitter"
      }
    );
    
    this._add(
      this._secondArea,
      {
        mode : "second",
        size : secondSize
      }
    );

    
    this.__isMouseDown = false,
    
    /*
     * Add events to widgets
     */

    /*
     * Note that mouseUp and mouseDown events are added to the widget itself because 
     * if the splitter is smaller than 5 pixels in length or height it is difficult
     * to click on it.
     * By adding events to the widget the splitter can be activated if the cursor is
     * near to the splitter widget.
     */
    this.addListener("mousedown", this.__mouseDown, this);
    this.addListener("mouseup", this.__mouseUp, this);

    this.addListener("mousemove", this.__mouseMove, this);
    
    
    // TODO: losecapture needed?
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Appearance change
     */
    appearance :
    {
      refine : true,
      init : "splitpane"
    },

    /**
     * The size of the first (left/top) area.
     */
    firstSize :
    {
      apply : "_applyFirstSize",
      init : 1
    },


    /**
     * The size of the second (right/bottom) area.
     */
    secondSize :
    {
      apply : "_applySecondSize",
      init : 1
    },


    /**
     * Size of the splitter
     */
    splitterSize :
    {
      check : "Integer",
      init : 5,
      apply : "_applySplitterSize",
      themeable : true
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sets given widget as first area.
     *
     * @type member
     * @param widget {qx.core.ui.Widget} Widget
     * @return {Bool} true on sucess, false on failure
     */
    setFirst : function(widget)
    {
      this.setFirstArea(widget);
    },


    /**
     * Sets given widget as second area.
     *
     * @type member
     * @param widget {qx.core.ui.Widget} Widget
     * @return {Bool} true on sucess, false on failure
     */
    setSecond : function(widget)
    {
      this.setSecondArea(widget);
    },


    /**
     * Returns the splitter.
     *
     * @type member
     * @return {qx.legacy.ui.core.Widget} The splitter.
     */
    getSplitter : function() {
      return this._splitter;
    },


    /**
     * Returns the first area (CanvasLayout)
     *
     * @type member
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getFirstArea : function() {
      return this._firstArea;
    },


    /**
     * Returns the second area (CanvasLayout)
     *
     * @type member
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getSecondArea : function() {
      return this._secondArea;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    __mouseDown : function(evt)
    {

      if (!evt.isLeftPressed()) {
        return;
      }

      var splitterElement = this._splitter.getContainerElement().getDomElement();
      var splitterElementBounds = qx.bom.element.Location.get(splitterElement);
      var left = evt.getDocumentLeft();
      var top = evt.getDocumentTop();

      var splitterClicked = false;

      /*
       * Check if splitter widget is big enough to be be easily clicked on 
       */
      if(
          (this.__orientation == "horizontal" && qx.bom.element.Dimension.getHeight(splitterElement) > this.__minSplitterSize) ||
          (qx.bom.element.Dimension.getWidth(splitterElement) > this.__minSplitterSize)
      ){

        /* Check if cursor is on splitter */
        if(
            ( (left >= splitterElementBounds.left) && (left <= splitterElementBounds.right) ) &&
            ( (top >= splitterElementBounds.top) && (top <= splitterElementBounds.bottom) )
        ){
          splitterClicked = true;
        }

      }
      else
      {
        /*
         * Check if mouse is near to splitter 
         */
        //TODO
      }
      
      
/*
      if(
        this._near(evt.getDocumentLeft(), qx.bom.element.Location.getLeft(splitterElement)) &&
        this._near(evt.getDocumentTop(), qx.bom.element.Location.getTop(splitterElement))
      ){
        console.warn("yeeeeeee")
      }
*/

      if(splitterClicked)
      {

        var bounds = this._splitter.getBounds();    
        this._slider.show();

        this._slider.setUserBounds(
          bounds.left,
          bounds.top,
          bounds.width,
          bounds.height
        );
        this._slider.setZIndex(this._splitter.getZIndex() + 1);

        this.__splitterCoords.top = bounds.top;
        this.__splitterCoords.left = bounds.left;
        this.__isMouseDown = true;
      }

    },

    __mouseUp : function(evt)
    {
      var paneElement = this.getContainerElement().getDomElement();
      var paneLocation = qx.bom.element.Location.get(paneElement);

      if(this.__orientation == "horizontal")
      {
        //debugger;
        this._firstArea.setWidth(evt.getDocumentLeft() - paneLocation.left);
        this._secondArea.setWidth(0);
      }
      else
      {
        ;;
      }
      
      //this._slider.exclude();
      this.__isMouseDown = false;
    },

    __mouseMove : function(evt)
    {

      if(this.__isMouseDown)
      {
        var sliderElement = this._slider.getContainerElement().getDomElement();
        var paneElement = this.getContainerElement().getDomElement();
        var paneLocation = qx.bom.element.Location.get(paneElement);

        if (this.__orientation == "horizontal") {
          qx.bom.element.Style.set(sliderElement, "left", (evt.getDocumentLeft() - paneLocation.left) + "px");
        } else {
          qx.bom.element.Style.set(sliderElement, "top", (evt.getDocumentTop() - paneLocation.top) + "px");
        }
        
      }

      // stop event
      evt.stopPropagation();
    },

    /**
     * Checks whether the two arguments are near to each other. Returns true if
     * the absolute difference is less than five.
     *
     * @param p {Integer} first value
     * @param e {Integer} second value
     * @return {Bollean} Whether the two arguments are near to each other
     */
    _near : function(p, e) {
      return e > (p - 5) && e < (p + 5);
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    // TODO
  }
});
