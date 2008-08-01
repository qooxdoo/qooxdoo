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
 * Global timer support.
 *
 * This class can be used to periodically fire an event. This event can be
 * used to simulate e.g. a background task. The static method
 * {@link #once} is a special case. It will call a function deferred after a
 * given timeout.
 */
qx.Class.define("qx.event.Timer",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param interval {Number} initial interval in milliseconds of the timer.
   */
  construct : function(interval)
  {
    this.base(arguments);

    this.setEnabled(false);

    if (interval != null) {
      this.setInterval(interval);
    }

    this.__oninterval = qx.lang.Function.bind(this._oninterval, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Start a function after a given timeout.
     *
     * @param func {Function} Function to call
     * @param obj {Object} context (this), the function is called with
     * @param timeout {Number} Number of milliseconds to wait before the function is called.
     * @return {qx.event.Timer} The timer object used for the timeout. This
     *    object can be used to cancel the timeout. Note that the timer is
     *    only valid until the timer has been executed.
     */
    once : function(func, obj, timeout)
    {
      // Create time instance
      var timer = new qx.event.Timer(timeout);

      // Add event listener to interval
      timer.addListener("interval", function(e)
      {
        func.call(obj, e);
        timer.dispose();

        obj = null;
      },
      obj);

      // Directly start timer
      timer.start();
      return timer;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * With the enabled property the Timer can be started and suspended.
     * Setting it to "true" is equivalent to {@link #start}, setting it
     * to "false" is equivalent to {@link #stop}.
     */
    enabled :
    {
      init : true,
      check : "Boolean",
      apply : "_applyEnabled"
    },

    /**
     * Time in milliseconds between two callback calls.
     * This property can be set to modify the interval of
     * a running timer.
     */
    interval :
    {
      check : "Integer",
      init : 1000,
      apply : "_applyInterval"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __intervalHandler : null,




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * Apply the interval of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyInterval : function(value, old)
    {
      if (this.getEnabled()) {
        this.restart();
      }
    },


    /**
     * Apply the enabled state of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEnabled : function(value, old)
    {
      if (old)
      {
        window.clearInterval(this.__intervalHandler);
        this.__intervalHandler = null;
      }
      else if (value)
      {
        this.__intervalHandler = window.setInterval(this.__oninterval, this.getInterval());
      }
    },




    /*
    ---------------------------------------------------------------------------
      USER-ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Start the timer
     *
     */
    start : function() {
      this.setEnabled(true);
    },


    /**
     * Start the timer with a giben interval
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    startWith : function(interval)
    {
      this.setInterval(interval);
      this.start();
    },


    /**
     * Stop the timer.
     *
     */
    stop : function() {
      this.setEnabled(false);
    },


    /**
     * Restart the timer.
     * This makes it possible to change the interval of a running timer.
     *
     */
    restart : function()
    {
      this.stop();
      this.start();
    },


    /**
     * Restart the timer. with a given interval.
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    restartWith : function(interval)
    {
      this.stop();
      this.startWith(interval);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-MAPPER
    ---------------------------------------------------------------------------
    */

    /**
     * timer callback
     *
     */
    _oninterval : function()
    {
      if (this.getEnabled()) {
        this.fireEvent("interval");
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
    if (this.__intervalHandler) {
      window.clearInterval(this.__intervalHandler);
    }

    this._disposeFields("__intervalHandler", "__oninterval");
  }
});
