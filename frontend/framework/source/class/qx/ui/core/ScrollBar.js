/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#use(qx.event.handler.DragDrop)
*/

/**
 * A preliminary scroll bar for the scroll pane. This is nothing more than
 * an early prototype.
 */
qx.Class.define("qx.ui.core.ScrollBar",
{
  extend : qx.ui.core.Widget,

  construct : function(orientation)
  {
    this.base(arguments);

    this._barPane = new qx.ui.core.Widget();
    this._barPane.setBackgroundColor("#EEE");
    this._barPane.setLayout(new qx.ui.layout.Canvas());

    this._barPane.addListener("resize", this._updateSliderLength, this);
    this._barPane.addListener("click", this._onClickBarPane, this);

    this._sliderPos = 0;
    this._scrollSize = 0;
    this._sliderSize = 0;
    this._slider = new qx.ui.core.Widget().set({
      backgroundColor : "blue"
    });
    this._barPane.getLayout().add(this._slider);
    this._slider.getContainerElement().addListener("dragstart", this._onDragstartSlider, this);
    this._slider.getContainerElement().addListener("dragmove", this._onDragmoveSlider, this);
    this._slider.getContainerElement().addListener("dragstop", this._onDragstopSlider, this);
/*    this._slider.addListener("mousedown", this._onMousedownSlider, this);
    this._slider.addListener("mouseup", this._onMouseupSlider, this);
    this._slider.addListener("losecapture", this._onMouseupSlider, this);
*/

    this._btnBegin = new qx.ui.form.RepeatButton().set({
      backgroundColor : "gray",
      padding : 3
    });

    this._btnEnd = new qx.ui.form.RepeatButton().set({
      backgroundColor : "gray",
      padding : 3
    });

    this._btnBegin.addListener("execute", this._scrollToBegin, this);
    this._btnEnd.addListener("execute", this._scrollToEnd, this);

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue",
      event : "scroll"
    },

    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum"
    }
  },


  members :
  {
    _onClickBarPane : function(e)
    {
      var paneLocation = qx.bom.element.Location.get(this._barPane.getContainerElement().getDomElement());

      var isHorizontal = this.getOrientation() === "horizontal";
      if (isHorizontal) {
        this._setSliderPosition(e.getDocumentLeft() - paneLocation.left, true);
      } else {
        this._setSliderPosition(e.getDocumentTop() - paneLocation.top, true);
      }
    },


    _onDragstartSlider : function(e) {
      console.log("drag start");
      this._sliderStartPos = this._sliderPos;
    },


    _onDragstopSlider : function(e) {
      console.log("drag stop");
    },


    _onDragmoveSlider : function(e)
    {
      var dragOffsetLeft = e.getDragOffsetLeft();
      var dragOffsetTop = e.getDragOffsetTop();

      console.log("drag move", dragOffsetLeft, dragOffsetTop);

      var isHorizontal = this.getOrientation() === "horizontal";
      var sliderPos = isHorizontal ? this._sliderStartPos + dragOffsetLeft : this._sliderStartPos + dragOffsetTop;

      this._setSliderPosition(sliderPos, true);
    },

/*
    _onMousedownSlider : function(e)
    {
      this._slider.capture();
      this._slider.addListener("mousemove", this._onMousemoveSlider, this);

      this._sliderStartPos = this._sliderPos;

      this._dragStartLeft = e.getDocumentLeft();
      this._dragStartTop = e.getDocumentTop();
    },


    _onMouseupSlider : function(e)
    {
      this._slider.releaseCapture();
      this._slider.removeListener("mousemove", this._onMousemoveSlider, this);
    },


    _onMousemoveSlider : function(e)
    {
      var el = this._barPane.getContainerElement().getDomElement();
      //var panePosition = qx.bom.element.Location.get(el);
      //console.log(e.getViewportTop() - panePosition.top);

      var dragOffsetLeft = e.getDocumentLeft() - this._dragStartLeft;
      var dragOffsetTop = e.getDocumentTop() - this._dragStartTop;

      var isHorizontal = this.getOrientation() === "horizontal";
      var sliderPos = isHorizontal ? this._sliderStartPos + dragOffsetLeft : this._sliderStartPos + dragOffsetTop;

      this._setSliderPosition(sliderPos, true);
    },
*/


    _setSliderPosition : function(sliderPosition, updateValue)
    {
      var range = this._scrollSize - this._sliderSize;
      this._sliderPos = Math.min(range, Math.max(0, sliderPosition));

      var isHorizontal = this.getOrientation() === "horizontal";
      var layout = this._barPane.getLayout();

      if (isHorizontal) {
        layout.addLayoutProperty(this._slider, "left", this._sliderPos);
      } else {
        layout.addLayoutProperty(this._slider, "top", this._sliderPos);
      }

      if (updateValue) {
        this.setValue(Math.round(this.getMaximum() * sliderPosition / range));
      }
    },


    _updateSliderPosition : function()
    {
      var value = this.getValue();

      var range = this._scrollSize - this._sliderSize;
      this._setSliderPosition(Math.round(range * value / this.getMaximum()), false);
    },


    _updateSliderOrientation : function(isHorizontal)
    {
      var slider = this._slider;

      if (isHorizontal)
      {
        slider.addState("horizontal");
        slider.setMinWidth(10);
        slider.setMinHeight(0);
      }
      else
      {
        slider.removeState("horizontal");
        slider.setMinWidth(0);
        slider.setMinHeight(10);
      }

      var layout = this._barPane.getLayout();
      if (isHorizontal)
      {
        layout.addLayoutProperty(slider, "top", 0);
        layout.addLayoutProperty(slider, "bottom", 0);
      }
      else
      {
        layout.addLayoutProperty(slider, "left", 0);
        layout.addLayoutProperty(slider, "right", 0);
      }
    },


    _updateSliderLength : function()
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var parentSize = this._barPane.getComputedLayout();
      if (!parentSize) {
        return;
      }

      this._scrollSize = isHorizontal ? parentSize.width : parentSize.height;
      //this._sliderSize = Math.round((this._scrollSize * this._scrollSize) / this.getMaximum());
      this._sliderSize = 20;

      if (isHorizontal)
      {
        this._slider.setWidth(this._sliderSize);
      } else {
        this._slider.setHeight(this._sliderSize);
      }
    },


    _applyOrientation : function(value, old)
    {
      if (old) {
        throw new Error("Modification of orientation is not allowed!");
      }

      var hori = value === "horizontal";

      this.setAllowGrowX(hori);
      this.setAllowShrinkX(hori);
      this.setAllowGrowY(!hori);
      this.setAllowShrinkY(!hori);

      var layout = hori ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;
      this.setLayout(layout);

      if (hori) {
        this._barPane.setHeight(18);
      } else {
        this._barPane.setWidth(18);
      }

      // Add children to layout
      layout.add(this._btnBegin);
      layout.add(this._barPane, {flex: 1});
      layout.add(this._btnEnd);

      this._updateSliderOrientation(hori);
    },

    _scrollToBegin : function() {
      this.scrollBy(-10);
    },

    _scrollToEnd : function() {
      this.scrollBy(10);
    },

    scrollBy : function(value)
    {
      var old = this.getValue();
      this.scrollTo(old + value);
    },

    scrollTo : function(value)
    {
      var max = this.getMaximum();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }

      this.setValue(value);
    },

    _applyValue : function(value, old) {
      this._updateSliderPosition();
    },

    _applyMaximum : function(value, old) {
      this._updateSliderLength();
    }

  }
});
