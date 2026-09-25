/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2026 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * John Spackman (john.spackman@zenesis.com)
 * Patryk Malinowski (pmalinowski116@gmail.com)

 ************************************************************************ */

/**
 * Class for debouncing a call, with promise support
 */
qx.Class.define("qx.util.Debounce", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param {Function?} cb function to call, can be null if you override `_runImpl`
   * @param {Integer?} timeout the timeout
   */
  construct(cb, timeout) {
    super();
    this.__callback = cb;
    this.setTimeout(timeout);
  },

  properties: {
    /** The timeout before firing the method */
    timeout: {
      nullable: false,
      check: "Integer",
      event: "changeTimeout"
    },

    /**
     * What to do when triggered when the callback is scheduled to execute but not yet executing.
     * "ignore" means do nothing
     * "restart" means to restart the timer
     */
    onPending: {
      init: "restart",
      check: ["ignore", "restart"]
    },

    /**
     * What to do if triggered while the callback is in the middle of executing:
     *  "ignore" means do nothing
     *  "repeat" means to run the function again immediately after it finishes
     *  "queue" means once the callback has finished running, schedule the function to run again after the timeout
     */
    onRunning: {
      init: "queue",
      check: ["ignore", "repeat", "queue"]
    }
  },

  events: {
    /** Fired when the debounced function has run */
    runComplete: "qx.event.type.Data"
  },

  destruct() {
    this._cancelTimer();
  },

  members: {
    __inRunImpl: false,
    /** @type {Function} the function to call */
    __callback: null,

    /** @type {Boolean} that there is a repeated invocation queued */
    __queuedRepeat: false,

    /**
     * Only set when the callback is executing
     * Resolves to the return value of the callback after the callback finishes
     * @type {?Promise}
     */
    __runPromise: null,

    /**
     * Schedules the callback to run after the set timeout.
     * Resolves to the return value of the callback
     *
     * @return {var?}
     */
    async trigger() {
      let promise = this.__runPromise;
      if (promise) {
        let onRunning = this.getOnRunning();
        if (onRunning == "ignore") {
          //do nothing
        } else if (onRunning == "repeat" || onRunning == "queue") {
          this.__queuedRepeat = true;
        }
      } else if (this.__timerId) {
        let onPending = this.getOnPending();
        if (onPending == "restart") {
          this._cancelTimer();
          this._startTimer();
        } else if (onPending == "ignore") {
          //do nothing
        }
      } else {
        this._startTimer();
      }
      return this.join();
    },

    /**
     * Returns a promise that will resolve when the debounce has completed
     */
    async join() {
      return new Promise((resolve, reject) => {
        this.addListenerOnce("runComplete", evt => {
          let error = evt.getData().error;
          if (error) {
            reject(error);
          } else {
            resolve(evt.getData().result);
          }
        });
      });
    },

    /**
     * Starts the timer
     */
    _startTimer() {
      this.__timerId = setTimeout(() => this._onTimeout(), this.getTimeout());
    },

    /**
     * Cancels the timer
     */
    _cancelTimer() {
      if (this.__timerId) {
        clearTimeout(this.__timerId);
        this.__timerId = null;
      }
    },

    /**
     * Called when the timeout has elapsed
     */
    async _onTimeout() {
      this.__timerId = null;
      while (true) {
        let result = undefined,
          error = null;
        this.__runPromise = this._runImpl();
        await this.__runPromise.then(
          res => (result = res),
          e => (error = e)
        );
        this.__runPromise = null;
        this.fireDataEvent("runComplete", { result, error });
        if (this.__queuedRepeat) {
          this.__queuedRepeat = false;
          let onRunning = this.getOnRunning();
          if (onRunning == "queue") {
            this._startTimer();
            return;
          } else if (onRunning == "repeat") {
            continue;
          }
        }

        break;
      }
    },

    /**
     * Called to run the actual code
     */
    async _runImpl() {
      if (qx.core.Environment.get("qx.debug")) {
        if (this.__inRunImpl) {
          throw new Error("Internal error: _onTimeout called while already in _runImpl");
        }
      }
      this.__inRunImpl = true;
      try {
        await this.__callback();
      } finally {
        this.__inRunImpl = false;
      }
    }
  }
});
