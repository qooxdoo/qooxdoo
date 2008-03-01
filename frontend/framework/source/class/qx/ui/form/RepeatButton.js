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

************************************************************************ */

/**
 * The RepeatButton is a special button, which fires repeatedly {@link execute}
 * events, while the mouse button is presson on the button. The initial delay
 * and the interval time can be set using the properties {@link #firstInterval}
 * and {@link #interval}.
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

    this.__timer = new qx.event.Timer;
    this.__timer.setInterval(this.getInterval());
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
    "execute" : "qx.event.type.Event"
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "mouseDown" method.<br/>
     * Sets the interval of the timer (value of firstInterval property) and
     * starts the timer. Additionally removes the state "abandoned" and adds the
     * state "pressed".
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      this.__executed = false;

      this.__timer.setInterval(this.getFirstInterval());
      this.__timer.start();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Callback method for the "mouseUp" event.<br/>
     * Handles the case that the user is releasing the mouse button
     * before the timer interval method got executed. This way the
     * "execute" method get executed at least one time.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      this.releaseCapture();

      if (!this.hasState("abandoned"))
      {
        this.addState("over");

        if (this.hasState("pressed") && !this.__executed) {
          this.execute();
        }
      }

      this.__timer.stop();

      this.removeState("abandoned");
      this.removeState("pressed");
    },


    /**
     * Callback for the interval event.<br/>
     * Stops the timer and starts it with a new interval
     * (value of the "interval" property). Dispatches the
     * "execute" event.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
     * @return {void}
     */
    _oninterval : function(e)
    {
      this.__timer.stop();
      this.__timer.setInterval(this.getInterval());
      this.__timer.start();

      this.__executed = true;
      this.fireEvent("execute");
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
