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

/**
 * A scroll bar for the scroll pane.
 */
qx.Class.define("qx.ui.core.ScrollBar",
{
  extend : qx.ui.core.Widget,

  /**
   * @param orientation {String?"horizontal"} The initial scroll bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    this._slider = new qx.ui.slider.Slider(orientation).set({
      appearance : "scrollbar-slider"
    });
    this._slider.addListener("changeValue", this._onChangeValueSlider, this);
    this._slider.addListener("resize", this._onResizeSlider, this);

    this._btnBegin = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnBegin.addListener("execute", this._slider.scrollStepBack, this._slider);


    this._btnEnd = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnEnd.addListener("execute", this._slider.scrollStepForward, this._slider);


    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    this.initButtonStep();
  },


  properties :
  {
    /**
     * The scroll bar orientation
     */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    /**
     * The current scroll position
     */
    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue",
      event : "changeValue"
    },


    /**
     * The size of the scroll content
     */
    contentSize :
    {
      check : "Integer",
      init : 100,
      apply : "_applyContentSize"
    },


    /**
     * The size of the scroll container
     */
    containerSize :
    {
      check : "Integer",
      init: 50,
      apply : "_applyContainerSize"
    },


    /**
     * The amount to scroll if the user clicks on one of the arrow buttons.
     * The {@link #value} will change by the amount of this value.
     */
    buttonStep :
    {
      check : "Integer",
      init : 16,
      apply : "_applyButtonStep"
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "scrollbar"
    }
  },


  members :
  {
    /**
     * Change listener for sider value changes.
     *
     * @param e {qx.event.type.Change} The change event object
     */
    _onChangeValueSlider : function(e) {
      this.setValue(e.getValue());
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var isHorizontal = value === "horizontal";

      this.setAllowStretchX(isHorizontal);
      this.setAllowStretchY(!isHorizontal);

      var layout = isHorizontal ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;
      this.setLayout(layout);

      // Add children to layout
      layout.add(this._btnBegin);
      layout.add(this._slider, {flex: 1});
      layout.add(this._btnEnd);

      if (isHorizontal)
      {
        this.addState("horizontal");
        this.removeState("vertical");

        this._btnBegin.addState("left");
        this._btnBegin.removeState("up");

        this._btnEnd.addState("right");
        this._btnEnd.removeState("down");
      }
      else
      {
        this.addState("vertical");
        this.removeState("horizontal");

        this._btnBegin.addState("up");
        this._btnBegin.removeState("left");

        this._btnEnd.addState("down");
        this._btnEnd.removeState("right");
      }

      this._slider.setOrientation(value);
      this._slider.set({
        allowStretchX: true,
        allowStretchY: true
      });
    },


    // property apply
    _applyValue : function(value, old) {
      this._slider.setValue(value);
    },


    __updateSliderSteps : function()
    {
      this._slider.setPageStep(Math.max(1, this.getContainerSize() - this.getButtonStep()));
      this._slider.setSingleStep(this.getButtonStep());
      this._slider.setWheelStep(this.getButtonStep());
    },


    _onResizeSlider : function(e) {
      this.__updateSliderSize();
    },


    /**
     * Updates the slider size and computes the new slider maximum.
     */
    __updateSliderSize : function()
    {
      var size = this._slider.getComputedInnerSize();
      if (!size) {
        return;
      }

      var isHorizontal = this.getOrientation() === "horizontal";
      var scrollSize = isHorizontal ? size.width : size.height;

      this._slider.setMaximum(Math.max(0, this.getContentSize() - this.getContainerSize()));
      this.__updateSliderSteps();

      // compute and set new slider size
      var sliderSize = Math.min(scrollSize, Math.round(scrollSize * this.getContainerSize() / this.getContentSize()));

      if (isHorizontal) {
        this._slider._slider.setWidth(sliderSize);
      } else {
        this._slider._slider.setHeight(sliderSize);
      }
    },


    // property apply
    _applyContentSize : function(value, old) {
      this.__updateSliderSize();
    },


    // property apply
    _applyContainerSize : function(value, old) {
      this.__updateSliderSize();
    },


    // property apply
    _applyButtonStep : function(value, old) {
      this.__updateSliderSteps();
    }
  }
});
