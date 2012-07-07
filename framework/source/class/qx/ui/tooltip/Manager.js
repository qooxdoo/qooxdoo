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
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/**
 * The tooltip manager globally manages the tooltips of all widgets. It will
 * display tooltips if the user hovers a widgets with a tooltip and hides all
 * other tooltips.
 */
qx.Class.define("qx.ui.tooltip.Manager",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Register events
    qx.event.Registration.addListener(document.body, "mouseover", this.__onMouseOverRoot, this, true);

    // Instantiate timers
    this.__showTimer = new qx.event.Timer();
    this.__showTimer.addListener("interval", this.__onShowInterval, this);

    this.__hideTimer = new qx.event.Timer();
    this.__hideTimer.addListener("interval", this.__onHideInterval, this);

    // Init mouse position
    this.__mousePosition = { left: 0, top: 0 };
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Holds the current ToolTip instance */
    current :
    {
      check : "qx.ui.tooltip.ToolTip",
      nullable : true,
      apply : "_applyCurrent"
    },

    /** Show all invalid form fields tooltips . */
    showInvalidToolTips :
    {
      check : "Boolean",
      init : true
    },

    /** Show all tooltips. */
    showToolTips :
    {
      check : "Boolean",
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __mousePosition : null,
    __hideTimer : null,
    __showTimer : null,
    __sharedToolTip: null,
    __sharedErrorToolTip: null,


    /**
     * Get the shared tooltip, which is used to display the
     * {@link qx.ui.core.Widget#toolTipText} and
     * {@link qx.ui.core.Widget#toolTipIcon} properties of widgets.
     * You can use this public shared instance to e.g. customize the
     * look and feel.
     *
     * @return {qx.ui.tooltip.ToolTip} The shared tooltip
     */
    getSharedTooltip : function()
    {
      if (!this.__sharedToolTip)
      {
        this.__sharedToolTip = new qx.ui.tooltip.ToolTip().set({
          rich: true
        });
      }
      return this.__sharedToolTip;
    },


    /**
     * Get the shared tooltip, which is used to display the
     * {@link qx.ui.core.Widget#toolTipText} and
     * {@link qx.ui.core.Widget#toolTipIcon} properties of widgets.
     * You can use this public shared instance to e.g. customize the
     * look and feel of the validation tooltips like
     * <code>getSharedErrorTooltip().getChildControl("atom").getChildControl("label").set({rich: true, wrap: true, width: 80})</code>
     *
     * @return {qx.ui.tooltip.ToolTip} The shared tooltip
     */
    getSharedErrorTooltip : function()
    {
      if (!this.__sharedErrorToolTip)
      {
        this.__sharedErrorToolTip = new qx.ui.tooltip.ToolTip().set({
          appearance: "tooltip-error",
          rich: true
        });
        this.__sharedErrorToolTip.setLabel(""); // trigger label widget creation
        this.__sharedErrorToolTip.syncAppearance();
      }

      return this.__sharedErrorToolTip;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyCurrent : function(value, old)
    {
      // Return if the new tooltip is a child of the old one
      if (old && qx.ui.core.Widget.contains(old, value)) {
        return;
      }

      // If old tooltip existing, hide it and clear widget binding
      if (old)
      {
        if (!old.isDisposed()) {
          old.exclude();
        }

        this.__showTimer.stop();
        this.__hideTimer.stop();
      }

      var Registration = qx.event.Registration;
      var el = document.body;
      // If new tooltip is not null, set it up and start the timer
      if (value)
      {
        this.__showTimer.startWith(value.getShowTimeout());

        // Register hide handler
        Registration.addListener(el, "mouseout", this.__onMouseOutRoot, this, true);
        Registration.addListener(el, "focusout", this.__onFocusOutRoot, this, true);
        Registration.addListener(el, "mousemove", this.__onMouseMoveRoot, this, true);
      }
      else
      {
        // Deregister hide handler
        Registration.removeListener(el, "mouseout", this.__onMouseOutRoot, this, true);
        Registration.removeListener(el, "focusout", this.__onFocusOutRoot, this, true);
        Registration.removeListener(el, "mousemove", this.__onMouseMoveRoot, this, true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      TIMER EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for the interval event of the show timer.
     *
     * @param e {qx.event.type.Event} Event object
     */
    __onShowInterval : function(e)
    {
      var current = this.getCurrent();
      if (current && !current.isDisposed())
      {
        this.__hideTimer.startWith(current.getHideTimeout());

        if (current.getPlaceMethod() == "widget") {
          current.placeToWidget(current.getOpener());
        } else {
          current.placeToPoint(this.__mousePosition);
        }

        current.show();
      }

      this.__showTimer.stop();
    },


    /**
     * Event listener for the interval event of the hide timer.
     *
     * @param e {qx.event.type.Event} Event object
     */
    __onHideInterval : function(e)
    {
      var current = this.getCurrent();
      if (current && !current.isDisposed()) {
        current.exclude();
      }

      this.__hideTimer.stop();
      this.resetCurrent();
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Global mouse move event handler
     *
     * @param e {qx.event.type.Mouse} The move mouse event
     */
    __onMouseMoveRoot : function(e)
    {
      var pos = this.__mousePosition;

      pos.left = e.getDocumentLeft();
      pos.top = e.getDocumentTop();
    },


    /**
     * Searches for the tooltip of the target widget. If any tooltip instance
     * is found this instance is bound to the target widget and the tooltip is
     * set as {@link #current}
     *
     * @param e {qx.event.type.Mouse} mouseOver event
     * @return {void}
     */
    __onMouseOverRoot : function(e)
    {
      var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
      this.showToolTip(target);
    },


    /**
     * Explicitly show tooltip for particular form item.
     *
     * @param target {Object || null} widget to show tooltip for
     */
    showToolTip : function(target) {
      if (!target){
        return;
      }

      var tooltip,
          tooltipText,
          tooltipIcon,
          invalidMessage;

      // Search first parent which has a tooltip
      while (target != null)
      {
        tooltip = target.getToolTip();
        tooltipText = target.getToolTipText() || null;
        tooltipIcon = target.getToolTipIcon() || null;
        if (qx.Class.hasInterface(target.constructor, qx.ui.form.IForm)
            && !target.isValid()) {
          invalidMessage = target.getInvalidMessage();
        }

        if (tooltip || tooltipText || tooltipIcon || invalidMessage) {
          break;
        }

        target = target.getLayoutParent();
      }

      //do nothing if
      if (!target //don't have a target
          // tooltip is disabled
          || !target.getEnabled()
          //tooltip is blocked
          || target.isBlockToolTip()
          //an invalid message isn't set and tooltips are disabled
          || (!invalidMessage && !this.getShowToolTips())
          //an invalid message is set and invalid tooltips are disabled
          || (invalidMessage && !this.getShowInvalidToolTips()))
      {
        return;
      }

      if (invalidMessage)
      {
        tooltip = this.getSharedErrorTooltip().set({
          label: invalidMessage
        });
      }
      if (!tooltip)
      {
        tooltip = this.getSharedTooltip().set({
          label: tooltipText,
          icon: tooltipIcon
        });
      }
      this.setCurrent(tooltip);
      tooltip.setOpener(target);
    },


    /**
     * Resets the property {@link #current} if there was a
     * tooltip and no new one is created.
     *
     * @param e {qx.event.type.Mouse} mouseOut event
     * @return {void}
     */
    __onMouseOutRoot : function(e)
    {
      var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
      if (!target) {
        return;
      }

      var related = qx.ui.core.Widget.getWidgetByElement(e.getRelatedTarget());
      if (!related) {
        return;
      }


      var tooltip = this.getCurrent();

      // If there was a tooltip and
      // - the destination target is the current tooltip
      //   or
      // - the current tooltip contains the destination target
      if (tooltip && (related == tooltip || qx.ui.core.Widget.contains(tooltip, related))) {
        return;
      }

      // If the destination target exists and the target contains it
      if (related && target && qx.ui.core.Widget.contains(target, related)) {
        return;
      }

      // If there was a tooltip and there is no new one
      if (tooltip && !related) {
        this.setCurrent(null);
      } else {
        this.resetCurrent();
      }
    },




    /*
    ---------------------------------------------------------------------------
      FOCUS EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Reset the property {@link #current} if the
     * current tooltip is the tooltip of the target widget.
     *
     * @param e {qx.event.type.Focus} blur event
     * @return {void}
     */
    __onFocusOutRoot : function(e)
    {
      var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
      if (!target) {
        return;
      }

      var tooltip = this.getCurrent();

      // Only set to null if blured widget is the
      // one which has created the current tooltip
      if (tooltip && tooltip == target.getToolTip()) {
        this.setCurrent(null);
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Deregister events
    qx.event.Registration.removeListener(document.body, "mouseover", this.__onMouseOverRoot, this, true);

    // Dispose timers
    this._disposeObjects("__showTimer", "__hideTimer", "__sharedToolTip");
    this.__mousePosition = null;
  }
});
