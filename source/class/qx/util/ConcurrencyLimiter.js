/**
 * Utility class to limit the number of concurrent executions of async functions.
 *
 * @typedef {Object} TaskEntry
 * @template T
 * @property {() => Promise<T>} task The function to execute.
 * @property {(value: T) => void} resolve The function to call when the task resolves.
 * @property {(reason: any) => void} reject The function to call when the task rejects.
 */
qx.Class.define("qx.util.ConcurrencyLimiter", {
  extend: qx.core.Object,

  /**
   * @param {Number?Infinity} limit The maximum number of concurrent executions. If Infinity, no limit is applied.
   */
  construct(limit = Infinity) {
    super();
    this.__limit = limit;

    this.__queue = [];
    this.__running = 0;
  },

  members: {
    /**
     * @type {TaskEntry<*>[]}
     * The tasks that are waiting to be executed
     */
    __queue: null,

    /**
     * Number of currently running tasks.
     */
    __running: null,

    /**
     * Queues a function to be executed.
     * If the limit is reached, the function will be put on hold until a slot is available.
     *
     * @template T
     * @param {() => Promise<T>} task The function to execute.
     * @returns {Promise<T>} The promise that will be resolved when the function is executed.
     *  If the function rejects, the promise will also reject.
     */
    add(task) {
      return new Promise((resolve, reject) => {
        this.__queue.push({ task, resolve, reject });
        this.__checkQueue();
      });
    },

    /**
     * Checks the queue to see if anything can be executed,
     * and executes the next item in the queue if the limit is not reached.
     * Once the item has finished executing, it will check the queue again.
     */
    __checkQueue() {
      if (this.__running == this.__limit) {
        return;
      }

      let next = this.__queue.shift();
      if (!next) {
        return;
      }

      let { task, resolve, reject } = next;

      this.__running++;
      task()
        .then(resolve, reject)
        .finally(() => {
          this.__running--;
          this.__checkQueue();
        });
    }
  }
});
