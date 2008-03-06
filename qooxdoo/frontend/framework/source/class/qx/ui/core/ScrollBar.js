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
 * A scroll bar for the scroll pane.
 */
qx.Class.define("qx.ui.core.ScrollBar",
{
  extend : qx.ui.core.Widget,

  construct : function(orientation)
  {
    this.base(arguments);

    this._barPane = new qx.ui.core.Widget().set({
      appearance : "scrollbar-slider-pane",
      layout : new qx.ui.layout.Canvas()
    });

    this._barPane.addListener("click", this._onClickBarPane, this);
    this._barPane.addListener("resize", this._onResizeBarPane, this);


    this._sliderPos = 0;
    this._scrollSize = 0;
    this._sliderSize = 0;
    this._slider = new qx.ui.core.Widget().set({
      appearance : "scrollbar-slider"
    });
    this._barPane.getLayout().add(this._slider);

    this._slider.getContainerElement().addListener("dragstart", this._onDragstartSlider, this);
    this._slider.getContainerElement().addListener("dragmove", this._onDragmoveSlider, this);
    this._slider.getContainerElement().addListener("dragstop", this._onDragstopSlider, this);


    this._btnBegin = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button-start"
    });
    this._btnBegin.addListener("execute", this._scrollToBegin, this);


    this._btnEnd = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button-end"
    });
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
    },

    appearance :
    {
      refine : true,
      init : "scrollbar"
    }

  },


  members :
  {
    _onClickBarPane : function(e)
    {
      if (e.getTarget() !== this._barPane) {
        return;
      }

      var paneLocation = qx.bom.element.Location.get(this._barPane.getContainerElement().getDomElement());

      var isHorizontal = this.getOrientation() === "horizontal";
      var halfSliderSize = Math.round(this._sliderSize / 2);
      if (isHorizontal) {
        this._setSliderPosition(e.getDocumentLeft() - paneLocation.left - halfSliderSize, true);
      } else {
        this._setSliderPosition(e.getDocumentTop() - paneLocation.top - halfSliderSize, true);
      }
    },


    _onResizeBarPane : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";

      var barPaneSize = this._barPane.getComputedLayout();
      this._scrollSize = isHorizontal ? barPaneSize.width : barPaneSize.height;

      var sliderSize = this._slider.getComputedLayout();
      this._sliderSize = isHorizontal ? sliderSize.width : sliderSize.height;

      this._updateSliderPosition();
    },


    _onDragstartSlider : function(e) {
      this._sliderStartPos = this._sliderPos;
    },


    _onDragstopSlider : function(e) {
    },


    _onDragmoveSlider : function(e)
    {
      var dragOffsetLeft = e.getDragOffsetLeft();
      var dragOffsetTop = e.getDragOffsetTop();

      var isHorizontal = this.getOrientation() === "horizontal";
      var sliderPos = isHorizontal ? this._sliderStartPos + dragOffsetLeft : this._sliderStartPos + dragOffsetTop;

      this._setSliderPosition(sliderPos, true);
    },


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
        this.addState("horizontal");
        slider.addState("horizontal");
        this._barPane.addState("horizontal");
        this._btnBegin.addState("horizontal");
        this._btnEnd.addState("horizontal");
      }
      else
      {
        slider.removeState("horizontal");
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
    }

  }
});
