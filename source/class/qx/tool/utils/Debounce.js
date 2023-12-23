/**
 * Class for debouncing a call, with promise support
 */
qx.Class.define("qx.tool.utils.Debounce", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param {Function?} fn function to call, can be null if you override `_runImpl`
   * @param {Integer?} timeout the timeout
   */
  construct(fn, timeout) {
    super();
    this.__fn = fn;
    if (timeout) {
      this.setTimeout(timeout);
    }
  },

  properties: {
    /** The timeout before firing the method */
    timeout: {
      init: 250,
      nullable: false,
      check: "Integer",
      event: "changeTimeout"
    },

    /** What to do if triggered while the function is still executing:
     *  "ignore" means do nothing, allow the method to fire
     *  "restart" means to restart the timer
     *  "immediate" mean to allow the function to run again immediately after it stops
     *  "queue" means to schedule the function to run again
     */
    repeatedTrigger: {
      init: "ignored",
      nullable: false,
      check: ["ignore", "restart", "repeat", "queue"],
      apply: "_applyRepeatedTrigger",
      event: "changeRepeatedTrgger"
    }
  },

  members: {
    /** @type{Function} the function to call */
    __fn: null,

    /** @type{Boolean} that there is a repeated invocation queued */
    __queuedRepeat: false,

    /**
     * Apply for `repeatedTrigger`
     *
     * @param {Boolean} value
     */
    _applyQueueRepeats(value) {
      if (!value && this.__queuedRepeat) {
        this.__queuedRepeat = false;
      }
    },

    /**
     * Runs the function, completes when the function completes.  The function returns
     * whatever the callback function returned
     *
     * @return {var?}
     */
    async run() {
      let promise = this.__runPromise;
      if (promise) {
        let repeatedTrigger = this.getRepeatedTrigger();
        if (repeatedTrigger == "restart") {
          // If there is a timer id then  we can restart it, otherwise it is already executing
          if (this.__timerId) {
            this._cancelTimer();
            this._startTimer();
          }
        } else if (
          repeatedTrigger == "queue" ||
          repeatedTrigger == "immediate"
        ) {
          this.__queuedRepeat = true;
        }
        return await promise;
      }
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(!this.__timerId);
      }
      this._startTimer();
      promise = this.__runPromise = new qx.Promise();
      return await promise;
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
      let promise = this.__runPromise;
      try {
        let result = undefined;
        while (true) {
          result = await this._runImpl();
          if (this.__queuedRepeat) {
            if (this.getRepeatedTrigger() == "queue") {
              this._startTimer();
              return;
            }
          } else {
            break;
          }
        }
        this.__runPromise = null;
        promise.resolve(result);
      } catch (ex) {
        promise.reject(ex);
      }
    },

    /**
     * Called to run the actual code
     */
    async _runImpl() {
      await this.__fn();
    }
  }
});
