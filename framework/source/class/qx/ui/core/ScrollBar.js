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
 * A scroll bar.
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

    // Create child controls
    this._createChildControl("button-begin");
    this._createChildControl("slider");
    this._createChildControl("button-end");

    // Configure orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
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
      init : "scrollbar"
    },


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
     * The maximum value (difference between available size and
     * content size).
     */
    maximum :
    {
      check : "PositiveInteger",
      apply : "_applyMaximum",
      init : 100
    },


    /**
     * Position of the scrollbar (which means the scroll left/top of the
     * attached area's pane)
     *
     * Strictly validates according to {@link #maximum}.
     * Does not apply any correction to the incoming value. If you depend
     * on this, please use {@link #scrollTo} instead.
     */
    position :
    {
      check : "typeof value==='number'&&value>=0&&value<=this.getMaximum()",
      init : 0,
      apply : "_applyPosition",
      event : "scroll"
    },


    /**
     * Step size for each click on the up/down or left/right buttons.
     */
    singleStep :
    {
      check : "Integer",
      init : 20
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
     */
    pageStep :
    {
      check : "Integer",
      init : 10,
      apply : "_applyPageStep"
    },


    /**
     * Factor to apply to the width/height of the knob in relation
     * to the dimension of the underlying area.
     */
    knobFactor :
    {
      check : "PositiveNumber",
      apply : "_applyKnobFactor",
      nullable : true
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
        case "slider":
          control = new qx.ui.core.ScrollSlider;
          control.setPageStep(100);
          control.setFocusable(false);
          control.addListener("changeValue", this._onChangeSliderValue, this);
          this._add(control, {flex: 1});
          break;

        case "button-begin":
          // Top/Left Button
          control = new qx.ui.form.RepeatButton;
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteBegin, this);
          this._add(control);
          break;

        case "button-end":
          // Bottom/Right Button
          control = new qx.ui.form.RepeatButton;
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteEnd, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaximum : function(value) {
      this._getChildControl("slider").setMaximum(value);
    },


    // property apply
    _applyPosition : function(value) {
      this._getChildControl("slider").setValue(value);
    },


    // property apply
    _applyKnobFactor : function(value) {
      this._getChildControl("slider").setKnobFactor(value);
    },


    // property apply
    _applyPageStep : function(value) {
      this._getChildControl("slider").setPageStep(value);
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
        this._setLayout(new qx.ui.layout.HBox());

        this.setAllowStretchX(true);
        this.setAllowStretchY(false);

        this.replaceState("vertical", "horizontal");

        this._getChildControl("button-begin").replaceState("up", "left");
        this._getChildControl("button-end").replaceState("down", "right");
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());

        this.setAllowStretchX(false);
        this.setAllowStretchY(true);

        this.replaceState("horizontal", "vertical");

        this._getChildControl("button-begin").replaceState("left", "up");
        this._getChildControl("button-end").replaceState("right", "down");
      }

      // Sync slider orientation
      this._getChildControl("slider").setOrientation(value);
    },





    /*
    ---------------------------------------------------------------------------
      METHOD REDIRECTION TO SLIDER
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls to the given position.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param position {Integer} Scroll to this position. Must be greater zero.
     * @return {void}
     */
    scrollTo : function(position) {
      this._getChildControl("slider").slideTo(position);
    },


    /**
     * Scrolls by the given offset.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param offset {Integer} Scroll by this offset
     * @return {void}
     */
    scrollBy : function(offset) {
      this._getChildControl("slider").slideBy(offset);
    },


    /**
     * Scrolls by the given number of steps following the value of {@link #stepSize}.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param steps {Integer} Number of steps
     * @return {void}
     */
    scrollBySteps : function(steps)
    {
      var size = this.getSingleStep();
      this._getChildControl("slider").slideBy(steps * size);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Executed when the up/left button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     * @return {void}
     */
    _onExecuteBegin : function(e) {
      this.scrollBy(-this.getSingleStep());
    },


    /**
     * Executed when the down/right button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     * @return {void}
     */
    _onExecuteEnd : function(e) {
      this.scrollBy(this.getSingleStep());
    },


    /**
     * Change listener for sider value changes.
     *
     * @param e {qx.event.type.Data} The change event object
     * @return {void}
     */
    _onChangeSliderValue : function(e) {
      this.setPosition(e.getData());
    }
  }
});
