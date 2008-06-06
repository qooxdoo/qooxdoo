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
   * @appearance splitpane
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // Create and add slider
    this._slider = new qx.ui.splitpane.Slider(this);
    this._slider.exclude();
    this._add(this._slider, {type : "slider"});

    // Create splitter
    this._splitter = new qx.ui.splitpane.Splitter(this);
    this._add(this._splitter, {type : "splitter"});

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    /*
     * Note that mouseUp and mouseDown events are added to the widget itself because
     * if the splitter is smaller than 5 pixels in length or height it is difficult
     * to click on it.
     * By adding events to the widget the splitter can be activated if the cursor is
     * near to the splitter widget.
     */
    this.addListener("mousedown", this._onMouseDown, this);
    this.addListener("mouseup", this._onMouseUp, this);
    this.addListener("mousemove", this._onMouseMove, this);

    this.addListener("losecapture", this._onLoseCapture, this);
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
    _applyOrientation : function(value, old)
    {
      this._setLayout(value === "vertical" ? new qx.ui.layout.VSplit : new qx.ui.layout.HSplit);
      this.debug("Use layout: " + this._getLayout());

      var splitter = this._splitter;
      var slider = this._slider;

      if (old)
      {
        splitter.removeState(old);
        slider.removeState(old);
      }

      if (value)
      {
        splitter.addState(value);
        slider.addState(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    add : function(widget, flex)
    {
      if (flex == null) {
        this._add(widget);
      } else {
        this._add(widget, {flex : flex});
      }
    },

    remove : function(widget) {
      this._remove(widget);
    },

    getBegin : function() {
      return this._getChildren()[2] || null;
    },

    getEnd : function() {
      return this._getChildren()[3] || null;
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    _onMouseDown : function(e)
    {
      if (!e.isLeftPressed() || !this._splitter.hasState("active")) {
        return;
      }

      // Synchronize slider to splitter size
      var bounds = this._splitter.getBounds();
      this._slider.setUserBounds(bounds.left, bounds.top, bounds.width, bounds.height);
      this._slider.setZIndex(this._splitter.getZIndex() + 1);
      this._slider.show();

      this.debug("SplitterLeft: " + bounds.left);

      // Enable session
      this.__activeDragSession = true;
      this.capture();

      // Updating slider position
      // this._onSlide(e);
    },

    _onMouseMove : function(e)
    {
      if (this.__activeDragSession)
      {
        this._onSlide(e);
      }
      else
      {
        var eventLeft = e.getDocumentLeft();
        var eventTop = e.getDocumentTop();

        var splitterElement = this._splitter.getContainerElement().getDomElement();
        var splitterLocation = qx.bom.element.Location.get(splitterElement);

        splitterLeft = splitterLocation.left;
        splitterRight = splitterLocation.right;

        this._splitterOffset = eventLeft - splitterLeft;

        if (splitterElement.offsetWidth < 5)
        {
          var sizeDiff = Math.floor((5 - splitterElement.offsetWidth) / 2);
          splitterLeft -= sizeDiff;
          splitterRight += sizeDiff;
        }

        if (eventLeft < splitterLeft || eventLeft > splitterRight)
        {
          this._splitter.removeState("active");
          return;
        }

        this._splitter.addState("active");
      }

      return;


      if(this.__activeDragSession)
      {
        var sliderElement = this._slider.getContainerElement().getDomElement();
        var paneElement = this.getContainerElement().getDomElement();
        var paneLocation = qx.bom.element.Location.get(paneElement);

        var begin = this.getBegin();
        var end = this.getEnd();

        var firstHint = begin.getSizeHint();
        var secondHint = end.getSizeHint();

          var firstWidth = e.getDocumentLeft() - paneLocation.left;
          var secondWidth = paneLocation.right - e.getDocumentLeft();

          if(
              firstWidth > 0 &&
              secondWidth > 0 &&

              firstWidth > firstHint.minWidth &&
              firstWidth < firstHint.maxWidth &&

              secondWidth > secondHint.minWidth &&
              secondWidth < secondHint.maxWidth
          ){
            qx.bom.element.Style.set(sliderElement, "left", firstWidth + "px");



          }
      }
    },



    _onSlide : function(e)
    {
      var eventLeft = e.getDocumentLeft();
      var eventTop = e.getDocumentTop();

      this.debug("ActiveMove: " + eventLeft + " :: " + this._splitterOffset);

      var paneElement = this.getContainerElement().getDomElement();
      var paneLocation = qx.bom.element.Location.get(paneElement);

      var firstWidth = eventLeft - paneLocation.left - this._splitterOffset;




      this._slider.getContainerElement().setStyle("left", firstWidth + "px", true);

    },



    _onMouseUp : function(e)
    {
      if (!this.__activeDragSession) {
        return;
      }

      this._slider.exclude();
      this.releaseCapture();

      delete this.__activeDragSession;
    },


    _onLoseCapture : function(e) {
      this._onMouseUp(e);
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

  destruct : function()
  {
    // TODO
  }
});
