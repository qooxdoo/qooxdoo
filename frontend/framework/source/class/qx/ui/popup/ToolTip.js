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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Tooltips provide additional help for widgets if the user hovers a widget.
 *
 * *Example*
 * <pre class="javascript">
 * var widget = new qx.ui.form.Button("save");
 *
 * var tooltip = new qx.ui.popup.ToolTip("Save the opened file");
 * widget.setToolTip(tooltip);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/tooltip' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 *
 * @appearance tooltip
 */
qx.Class.define("qx.ui.popup.ToolTip",
{
  extend : qx.ui.popup.Popup,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} label of the tooltip
   * @param icon {String?null} Icon URL of the tooltip
   */

  construct : function(label, icon)
  {
    this.base(arguments);

    // Initialize manager
    this.__manager = qx.ui.popup.ToolTipManager.getInstance();
    this.setLayout(new qx.ui.layout.Basic());

    this._createChildControl("atom");

    // init
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    // Instantiate timers
    this._showTimer = new qx.event.Timer(this.getShowTimeout());
    this._showTimer.addListener("interval", this._onShowInterval, this);

    this._hideTimer = new qx.event.Timer(this.getHideTimeout());
    this._hideTimer.addListener("interval", this._onHideInterval, this);

    // Register mousemove event
    this.addListener("mousemove", this._onMouseMove);
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
      init : "tooltip"
    },

    /** Left offset of the mouse pointer (in pixel) */
    offsetLeft :
    {
      check : "Integer",
      init : 1
    },

    /** Top offset of the mouse pointer (in pixel) */
    offsetTop :
    {
      check : "Integer",
      init : 1
    },

    /** Right offset of the mouse pointer (in pixel) */
    offsetRight :
    {
      check : "Integer",
      init : 1
    },

    /** Bottom offset of the mouse pointer (in pixel) */
    offsetBottom :
    {
      check : "Integer",
      init : 20
    },

    /** Interval after the tooltip is shown (in milliseconds) */
    showTimeout :
    {
      check : "Integer",
      init : 1000,
      apply : "_applyShowTimeout"
    },

    /** Interval after the tooltip is hidden (in milliseconds) */
    hideTimeout :
    {
      check : "Integer",
      init : 4000,
      apply : "_applyHideTimeout"
    },

    /** The label/caption/text of the ToolTip's atom. */
    label :
    {
      check : "String",
      init : "",
      apply : "_applyLabel"
    },


    /** Any URI String supported by qx.ui.basic.Image to display an icon in ToolTips's atom. */
    icon :
    {
      check : "String",
      init : "",
      apply : "_applyIcon"
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _minZIndex : 1e7,


    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "atom":
          control = new qx.ui.basic.Atom;
          this._add(control);
          break;
      }
      
      return control || this.base(arguments, id);
    },

    /**
     * Accessor method to get the atom sub widget
     *
     * TODO: Is this accessor really needed?
     *
     * @type member
     * @return {qx.ui.basic.Atom} atom sub widget
     */
    getAtom : function() {
      return this._getChildControl("atom");
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyHideTimeout : function(value, old) {
      this._hideTimer.setInterval(value);
    },


    // property apply
    _applyShowTimeout : function(value, old) {
      this._showTimer.setInterval(value);
    },

    // property apply
    _applyIcon : function(value, old) {
      this._getChildControl("atom").setIcon(value);
    },

    // property apply
    _applyLabel : function(value, old) {
      this._getChildControl("atom").setLabel(value);
    },


    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    // overridden
    _onChangeVisibility : function(e)
    {
      this.base(arguments, e);

      if (e.getData() == "visible")
      {
        this.stopShowTimer();
        this.startHideTimer();
      }
      else
      {
        this.stopHideTimer();
      }
    },





    /*
    ---------------------------------------------------------------------------
      TIMER
    ---------------------------------------------------------------------------
    */

    /**
     * Utility method to start the timer for the show interval
     * (if the timer is disabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    startShowTimer : function() {
      this._showTimer.start();
    },


    /**
     * Utility method to start the timer for the hide interval
     * (if the timer is disabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    startHideTimer : function() {
      this._hideTimer.start();
    },


    /**
     * Utility method to stop the timer for the show interval
     * (if the timer is enabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    stopShowTimer : function() {
      this._showTimer.stop();
    },


    /**
     * Utility method to stop the timer for the hide interval
     * (if the timer is enabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    stopHideTimer : function() {
      this._hideTimer.stop();
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "mouseOver" event.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseOver event
     * @return {void}
     */
    _onMouseMove : function(e) {
      this.hide();
    },


    /**
     * Callback method for the "interval" event of the show timer.
     *
     * Positions the tooltip (sets left and top) and calls the
     * {@link #show} method.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
     */
    _onShowInterval : function(e)
    {
      this.stopShowTimer();

      var mgr = this.__manager;
      this.setLayoutProperties({
        left : mgr.getLastLeft() + this.getOffsetRight(),
        top : mgr.getLastTop() + this.getOffsetBottom()
      });

      this.show();
    },


    /**
     * Callback method for the "interval" event of the hide timer.
     *
     * Hides the tooltip by calling the corresponding {@link #hide} method.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
     * @return {var} TODOC
     */
    _onHideInterval : function(e) {
      this.hide();
    },





    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    // overridden
    _normalizeLeft : function(left)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return left;
      }

      var mouseLeft = this.__manager.getLastLeft();
      if (bounds.left < 0) {
        return 0;
      } else if ((bounds.left + bounds.width) > parentBounds.width) {
        return Math.max(0, mouseLeft - this.getOffsetRight() - bounds.width);
      }

      return left;
    },


    // overridden
    _normalizeTop : function(top)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return top;
      }

      var mouseTop = this.__manager.getLastTop();
      if (bounds.top < 0) {
        return 0;
      } else if ((bounds.top + bounds.height) > parentBounds.height) {
        return Math.max(0, mouseTop - this.getOffsetTop() - bounds.height);
      }

      return top;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var mgr = qx.ui.popup.ToolTipManager.getInstance();

    if (mgr.getToolTip() === this) {
      mgr.resetToolTip();
    }

    this._disposeObjects("_showTimer", "_hideTimer");
  }
});
