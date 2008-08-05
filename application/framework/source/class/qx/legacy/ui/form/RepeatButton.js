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

qx.Class.define("qx.legacy.ui.form.RepeatButton",
{
  extend : qx.legacy.ui.form.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    this._timer = new qx.event.Timer;
    this._timer.setInterval(this.getInterval());
    this._timer.addListener("interval", this._oninterval, this);
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
     * @param e {qx.legacy.event.type.MouseEvent} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (e.getTarget() != this || !e.isLeftButtonPressed()) {
        return;
      }

      this._executed = false;

      this._timer.setInterval(this.getFirstInterval());
      this._timer.start();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Callback method for the "mouseUp" event.<br/>
     * Handles the case that the user is releasing the mouse button
     * before the timer interval method got executed. This way the
     * "execute" method get executed at least one time.
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      this.setCapture(false);

      if (!this.hasState("abandoned"))
      {
        this.addState("over");

        if (this.hasState("pressed") && !this._executed) {
          this.execute();
        }
      }

      this._timer.stop();

      this.removeState("abandoned");
      this.removeState("pressed");
    },


    /**
     * Callback for the interval event.<br/>
     * Stops the timer and starts it with a new interval
     * (value of the "interval" property). Dispatches the
     * "execute" event.
     *
     * @param e {qx.event.type.Event} interval event
     * @return {void}
     */
    _oninterval : function(e)
    {
      this._timer.stop();
      this._timer.setInterval(this.getInterval());
      this._timer.start();

      this._executed = true;
      this.fireEvent("execute");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_timer");
  }
});
