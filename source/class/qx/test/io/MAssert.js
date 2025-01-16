/**
 * Mixin containing special assert methods
 */
qx.Mixin.define("qx.test.io.MAssert", {
  members: {
    /**
     * Deep equal comparison, using Sinon's `deepEqual` comparison.
     * Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   (https://sinonjs.github.io/samsam/)
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in obj1 is deepEqual to the corresponding property in obj2
     *
     * Supports cyclic objects.
     * @param {*} expected
     * @param {*} actual
     * @param {String?} msg
     */
    assertDeepEquals(expected, actual, msg) {
      if (!msg) {
        msg = `Failed to assert that ${qx.lang.Json.stringify(
          actual
        )} deeply equals ${qx.lang.Json.stringify(expected)}.`;
      }
      this.assert(qx.lang.Object.equals(expected, actual), msg);
    },

    /**
     * Asserts that a string fragment is contained in a result
     * @param {String} expectedFragment
     * @param {String} actual
     * @param {String?} msg
     */
    assertContains(expectedFragment, actual, msg) {
      this.assertString(expectedFragment);
      this.assertString(actual);
      if (!msg) {
        msg = `Failed to assert that '${actual}' contains '${expectedFragment}'.`;
      }
      this.assert(actual.includes(expectedFragment), msg);
    },

    PROMISE: {
      map: null,
      PENDING: "pending",
      FULFILLED: "fulfilled",
      REJECTED: "rejected"
    },

    /**
     * Observes a promise so that its state can later be determined for the assertPromise*()
     * methods.
     * @param {Promise} promise
     */
    observePromise(promise) {
      if (!this.PROMISE.map) {
        this.PROMISE.map = new WeakMap();
      }
      let state = this.PROMISE.PENDING;
      promise.then(
        () => (state = this.PROMISE.FULFILLED),
        () => (state = this.PROMISE.REJECTED)
      );
      let stateFn = () => state;
      this.PROMISE.map.set(promise, stateFn);
    },

    /**
     * Returns the state of the given promise, which is either "pending", "fulfilled", or "rejected".
     * Requires that the observePromise() method has previously been called with given promise.
     * @param {Promise} promise
     * @returns {String}
     */
    getPromiseState(promise) {
      let stateFn = this.PROMISE.map && this.PROMISE.map.get(promise);
      if (!stateFn) {
        throw new Error(
          "Promise is not being observed, call observePromise() first."
        );
      }
      return stateFn();
    },

    /**
     * Asserts that the given promise object is still pending
     * @param {Promise} promise
     * @param {String?} msg Optional failure message
     */
    assertPromisePending(promise, msg) {
      let state = this.getPromiseState(promise);
      this.assert(
        state == this.PROMISE.PENDING,
        msg || `Promise should be pending, but is ${state}.`
      );
    },

    /**
     * Asserts that the given promise object is settled, i.e. has either
     * been fulfilled or rejected
     * @param {Promise} promise
     * @param {String?} msg Optional failure message
     */
    assertPromiseSettled(promise, msg) {
      let state = this.getPromiseState(promise);
      this.assert(
        state != this.PROMISE.PENDING,
        msg || `Promise should be settled, but is pending.`
      );
    },

    /**
     * Asserts that the given promise object has been fulfilled
     * @param {Promise} promise
     * @param {String?} msg Optional failure message
     */
    assertPromiseFulfilled(promise, msg) {
      let state = this.getPromiseState(promise);
      this.assert(
        state == this.PROMISE.FULFILLED,
        msg || `Promise should be fulfilled, but is ${state}.`
      );
    },

    /**
     * Asserts that the given promise object has been rejected
     * @param {Promise} promise
     * @param {String?} msg Optional failure message
     */
    assertPromiseRejected(promise, msg) {
      let state = this.getPromiseState(promise);
      this.assert(
        state == this.PROMISE.REJECTED,
        msg || `Promise should be rejected, but is ${state}.`
      );
    }
  }
});
