/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A generic singleton that fires an "interval" event all 100 milliseconds. It
 * can be used whenever one needs to run code periodically. The main purpose of
 * this class is reduce the number of timers.
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 */

qx.Class.define("qx.event.Idle", {
  extend: qx.core.Object,
  implement: [qx.core.IDisposable],
  type: "singleton",

  construct() {
    super();
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** This event if fired each time the interval time has elapsed */
    interval: "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * Interval for the timer, which periodically fires the "interval" event,
     * in milliseconds.
     */
    timeoutInterval: {
      check: "Number",
      init: 100,
      apply: "_applyTimeoutInterval"
    }
  },

  members: {
    __timer: null,

    // property apply
    _applyTimeoutInterval(value) {
      if (this.__timer) {
        this.__timer.setInterval(value);
      }
    },

    /**
     * Fires an "interval" event
     */
    _onInterval() {
      this.fireEvent("interval");
    },

    /**
     * Starts the timer but only if there are listeners for the "interval" event
     */
    __startTimer() {
      if (!this.__timer && this.hasListener("interval")) {
        var timer = new qx.event.Timer(this.getTimeoutInterval());
        timer.addListener("interval", this._onInterval, this);
        timer.start();

        this.__timer = timer;
      }
    },

    /**
     * Stops the timer but only if there are no listeners for the interval event
     */
    __stopTimer() {
      if (this.__timer && !this.hasListener("interval")) {
        this.__timer.stop();
        this.__timer.dispose();
        this.__timer = null;
      }
    },

    /*
     * @Override
     */
    addListener(type, listener, self, capture) {
      var result = super.addListener(type, listener, self, capture);
      this.__startTimer();
      return result;
    },

    /*
     * @Override
     */
    addListenerOnce(type, listener, self, capture) {
      var result = super.addListenerOnce(type, listener, self, capture);
      this.__startTimer();
      return result;
    },

    /*
     * @Override
     */
    removeListener(type, listener, self, capture) {
      var result = super.removeListener(type, listener, self, capture);
      this.__stopTimer();
      return result;
    },

    /*
     * @Override
     */
    removeListenerById(id) {
      var result = super.removeListenerById(id);
      this.__stopTimer();
      return result;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    if (this.__timer) {
      this.__timer.stop();
    }

    this.__timer = null;
  }
});
