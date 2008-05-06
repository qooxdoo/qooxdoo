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



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The initial scroll bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);


    // Create slider
    this._slider = new qx.ui.slider.AbstractSlider(orientation);
    this._slider.setAppearance("scrollbar-slider");
    this._slider.setAllowStretchX(true);
    this._slider.setAllowStretchY(true);
    this._slider.addListener("change", this._onChangeSlider, this);
    this._slider.addListener("resize", this._onResizeSlider, this);


    // Top/Left Button
    this._btnBegin = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnBegin.addListener("execute", this._slider.scrollBack, this._slider);


    // Bottom/Right Button
    this._btnEnd = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnEnd.addListener("execute", this._slider.scrollForward, this._slider);


    // Add children
    this._add(this._btnBegin);
    this._add(this._slider, {flex: 1});
    this._add(this._btnEnd);


    // Configure orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }


    // Initialize step size
    this.initLineStep();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

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
      event : "change"
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
     */
    lineStep :
    {
      check : "Integer",
      init : 20,
      apply : "_applyLineStep"
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "scrollbar"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Change listener for sider value changes.
     *
     * @param e {qx.event.type.Change} The change event object
     */
    _onChangeSlider : function(e) {
      this.setValue(e.getValue());
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }

      // Reconfigure
      if (value === "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox);

        this.setAllowStretchX(true);
        this.setAllowStretchY(false);

        this.addState("horizontal");
        this.removeState("vertical");

        this._btnBegin.addState("left");
        this._btnBegin.removeState("up");

        this._btnEnd.addState("right");
        this._btnEnd.removeState("down");
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox);

        this.setAllowStretchX(false);
        this.setAllowStretchY(true);

        this.addState("vertical");
        this.removeState("horizontal");

        this._btnBegin.addState("up");
        this._btnBegin.removeState("left");

        this._btnEnd.addState("down");
        this._btnEnd.removeState("right");
      }


      // Sync slider orientation
      this._slider.setOrientation(value);
    },


    __updateSliderSteps : function()
    {
      this._slider.setPageStep(Math.max(1, this.getContainerSize() - this.getLineStep()));
      this._slider.setSingleStep(this.getLineStep());
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
        this._slider._knob.setWidth(sliderSize);
      } else {
        this._slider._knob.setHeight(sliderSize);
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyValue : function(value, old) {
      this._slider.setValue(value);
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
    _applyLineStep : function(value, old) {
      this.__updateSliderSteps();
    }
  }
});
