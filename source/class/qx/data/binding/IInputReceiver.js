/**
 * Interface for objects that can receive the output from a binding path segment.
 */
qx.Interface.define("qx.data.binding.IInputReceiver", {
  members: {
    /**
     *
     * @param {*} value
     * @returns {Promise?} If the operation is asynchronous, it should return a Promise which resolves when it has completed.
     * If it's synchronous, it should return null.
     */
    setInput(input) {}
  }
});
