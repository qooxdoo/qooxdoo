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
    this._slider.addListener("change", this._onChangeSlider, this);


    // Top/Left Button
    this._btnBegin = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnBegin.addListener("execute", this._onExecuteBegin, this);


    // Bottom/Right Button
    this._btnEnd = new qx.ui.form.RepeatButton().set({
      appearance : "scrollbar-button",
      focusable: false
    });
    this._btnEnd.addListener("execute", this._onExecuteEnd, this);


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


    // Initialize page step
    this.initPageStep();
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
    singleStep :
    {
      check : "Integer",
      init : 22,
      apply : "_applySingleStep"
    },


    /**
     * The amount to scroll if the user clicks on the page control (scrollbar background)
     */
    pageStep :
    {
      check : "Integer",
      init : 110,
      apply : "_applyPageStep"
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
     * Updates the slider size and computes the new slider maximum.
     */
    __updateSliderSize : function()
    {
      var outer = this.getContainerSize();
      var inner = this.getContentSize();

      this._slider.setMaximum(Math.max(0, inner - outer));
      this._slider.setKnobFactor(outer / inner);
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
     */
    _onExecuteBegin : function() {
      this._slider.slideBy(-this.getSingleStep());
    },


    /**
     * Executed when the down/right button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     */
    _onExecuteEnd : function() {
      this._slider.slideBy(this.getSingleStep());
    },


    /**
     * Change listener for sider value changes.
     *
     * @param e {qx.event.type.Change} The change event object
     */
    _onChangeSlider : function(e) {
      this.setValue(e.getValue());
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }

      // TODO: Cache layout instances?

      // Reconfigure
      if (value === "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());

        this.setAllowStretchX(true);
        this.setAllowStretchY(false);

        this.replaceState("vertical", "horizontal");
        this._btnBegin.replaceState("up", "left");
        this._btnEnd.replaceState("down", "right");
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());

        this.setAllowStretchX(false);
        this.setAllowStretchY(true);

        this.replaceState("horizontal", "vertical");
        this._btnBegin.replaceState("left", "up");
        this._btnEnd.replaceState("right", "down");
      }

      // Sync slider orientation
      this._slider.setOrientation(value);
    },


    // property apply
    _applyValue : function(value, old) {
      this._slider.slideTo(value);
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
    _applySingleStep : function(value, old) {
      // empty implementation
    },


    // property apply
    _applyPageStep : function(value, old) {
      this._slider.setPageStep(value);
    }
  }
});
