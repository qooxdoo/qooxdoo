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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The RepeatButton is a special button, which fires repeatedly {@link execute}
 * events, while the mouse button is pressed on the button. The initial delay
 * and the interval time can be set using the properties {@link #firstInterval}
 * and {@link #interval}. The {@link execute} events will be fired in a shorter
 * amount of time if the mouse button is hold, until the min {@link #minTimer}
 * is reached. The {@link #timerDecrease} property sets the amount of milliseconds
 * which will decreased after every firing.
 */
qx.Class.define("qx.ui.form.RepeatButton",
{
  extend : qx.ui.form.Button,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function(label, iconUrl, iconWidth, iconHeight)
  {
    this.base(arguments, label, iconUrl, iconWidth, iconHeight);
    // create the timer and add the listener
    this.__timer = new qx.event.Timer(this.getInterval());
    this.__timer.addListener("interval", this._oninterval, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events: {
    /**
     * This event gets dispatched with every interval. The timer gets executed
     * as long as the user holds down the mouse button.
     */
    "execute" : "qx.event.type.Event",
    /**
     * This event gets dispatched when the button is pressed.
     */
    "press" : "qx.event.type.Event",
    /**
     * This event gets dispatched when the button is released.
     */
    "release" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init : 100
    },


    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init : 500
    },


    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init : 20
    },


    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init : 2
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
     * Calling this function is like a click from the user on the
     * button with all consequences.
     * <span style='color: red'>Be shure to call the {@link #release} function.</span>
     *
     * @type member
     */
    press: function() {
      // only if the button is enabeld
      if (this.isEnabled()) {
        // if the state pressed must be applied (first call)
        if (!this.hasState("pressed")) {
          // start the timer
          this.__startInternalTimer();
        }
        // set the states
        this.removeState("abandoned");
        this.addState("pressed");
      }
    },


    /**
     * Calling this function is like a release from the user on the
     * button with all consequences.
     * Usually the {@link #release} function will be called before the call of
     * this function.
     *
     * @type member
     */
    release: function() {
      // only if the button is enabled
      if (this.isEnabled()) {
        // only if the button is pressed
        if (this.hasState("pressed")) {
          // if the button hast not been executed
          if (!this.__executed) {
            this.execute();
          }
          // set the button the the reight states
          this.removeState("pressed");
          this.removeState("abandoned");
          // stopp the repeat timer and therefore the execution
          this.__stopInternalTimer();
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */
    /**
     * Listener method for "mouseover" event
     * <ul>
     * <li>Adds state "over"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     */
    _onmouseover : function(e)
    {
      if (!e.isTargetInsideWidget(this)) {
        return;
      }

      if (this.hasState("abandoned")) {
        this.removeState("abandoned");
        this.addState("pressed");
        this.__timer.start();
      }

      this.addState("over");
    },


    /**
     * Listener method for "mouseout" event
     * <ul>
     * <li>Removes "over" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @type member
     * @param e {Event} Mouse event
     */
    _onmouseout : function(e)
    {
      if (!e.isTargetInsideWidget(this)) {
        return;
      }

      this.removeState("over");

      if (this.hasState("pressed")) {
        this.removeState("pressed");
        this.addState("abandoned");
        this.__timer.stop();
        this._currentInterval = this.getInterval();
      }
    },


    /**
     * Callback method for the "mouseDown" method.<br/>
     * Sets the interval of the timer (value of firstInterval property) and
     * starts the timer. Additionally removes the state "abandoned" and adds the
     * state "pressed".
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseDown event
     */
    _onmousedown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      // Activate capturing if the button get a mouseout while
      // the button is pressed.
      this.capture();

      this.__startInternalTimer();
    },


    /**
     * Callback method for the "mouseUp" event.<br/>
     * Handles the case that the user is releasing the mouse button
     * before the timer interval method got executed. This way the
     * "execute" method get executed at least one time.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
     */
    _onmouseup : function(e) {

      this.releaseCapture();

      if (!this.hasState("abandoned")) {
        this.addState("over");
        if (this.hasState("pressed") && !this.__executed) {
          this.execute();
        }
      }

      this.__stopInternalTimer();
    },


    /**
     * Listener method for "keyup" event.<br/>
     * Removes "abandoned" and "pressed" state (if "pressed" state is set)
     * for the keys "Enter" or "Space" and stopps the internal timer
     * (same like mouse up).
     *
     * @type member
     * @param e {Event} Key event
     */
    _onkeyup : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          if (this.hasState("pressed")) {
            if (!this.__executed) {
              this.execute();
            }
            this.removeState("pressed");
            this.removeState("abandoned");
            e.stopPropagation();
            this.__stopInternalTimer();
          }
      }
    },


    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space". It also starts
     * the internal timer (same like mousedown).
     *
     * @type member
     * @param e {Event} Key event
     * @return {void}
     */
    _onkeydown: function(e) {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.removeState("abandoned");
          this.addState("pressed");
          e.stopPropagation();
          this.__startInternalTimer();
      }
    },


    /**
     * Callback for the interval event.<br/>
     * Stops the timer and starts it with a new interval
     * (value of the "interval" property - value of the "timerDecrease" property).
     * Dispatches the "execute" event.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
     * @return {void}
     */
    _oninterval : function(e) {
      this.__timer.stop();

      // if the current interval is not set
      if (this._currentInterval == null) {
        // set the current interval to the given interval
        this._currentInterval = this.getInterval();
      }
      // reduce the current interval
      this._currentInterval = (Math.max(this.getMinTimer(), this._currentInterval - this.getTimerDecrease()));
      // restert the timer
      this.__timer.restartWith(this._currentInterval);
      // fire the execute event
      this.__executed = true;
      this.fireEvent("execute");
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL TIMER
    ---------------------------------------------------------------------------
    */
    /**
     * Starts the internal timer which causes firing of execution
     * events in an interval. It also presses the button.
     *
     * @type member
     * @return {void}
     */
    __startInternalTimer: function() {
      this.fireEvent("press");

      this.__executed = false;

      this.__timer.setInterval(this.getFirstInterval());
      this.__timer.start();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Stops the internal timer and releases the button.
     */
    __stopInternalTimer: function() {
      this.fireEvent("release");

      this.__timer.stop();

      this._currentInterval = null;

      this.removeState("abandoned");
      this.removeState("pressed");
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__timer");
  }
});
