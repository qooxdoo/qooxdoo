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
    this._slider.setSingleStep(20);
    this._slider.setPageStep(100);
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
  },






  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the scrollbar value is changed. Contains the current
     * scroll position.
     */
    scroll : "qx.event.type.DataEvent"
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
      SLIDER REDIRECT
    ---------------------------------------------------------------------------
    */

    setKnobFactor : function(value) {
      return this._slider.setKnobFactor(value);
    },

    getKnobFactor : function() {
      return this._slider.getKnobFactor();
    },

    setMaximum : function(value) {
      return this._slider.setMaximum(value);
    },

    getMaximum : function() {
      return this._slider.getMaximum();
    },

    setSingleStep : function(value) {
      return this._slider.setSingleStep(value);
    },

    getSingleStep : function() {
      return this._slider.getSingleStep();
    },

    setPageStep : function(value) {
      return this._slider.setPageStep(value);
    },

    getPageStep : function() {
      return this._slider.getPageStep();
    },

    scrollTo : function(position) {
      return this._slider.slideTo(position);
    },

    scrollBy : function(offset) {
      return this._slider.slideBy(offset);
    },

    getScroll : function() {
      return this._slider.getValue();
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
    _onExecuteBegin : function() {
      this.scrollBy(-this.getSingleStep());
    },


    /**
     * Executed when the down/right button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     * @return {void}
     */
    _onExecuteEnd : function() {
      this.scrollBy(this.getSingleStep());
    },


    /**
     * Change listener for sider value changes.
     *
     * @param e {qx.event.type.Change} The change event object
     * @return {void}
     */
    _onChangeSlider : function(e) {
      this.fireDataEvent("scroll", this.getScroll());
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
    }
  }
});
