/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022-2023 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://github.com/johnspackman, john.spackman@zenesis.com)

************************************************************************ */

/**
 * Base class for segments in a data binding path.
 * Each segment dereferences a part of the property chain, such as a property name or an array index.
 *
 */
qx.Class.define("qx.data.binding.AbstractSegment", {
  type: "abstract",
  extend: qx.core.Object,
  implement: [qx.data.binding.IInputReceiver],

  properties: {
    /**
     * Name of the event that this segment listens to on the input.
     */
    eventName: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeEventName"
    }
  },

  /**
   * Fired when this segment's input changed, and it has been received and fully processed by the next segments in the chain,
   * i.e. any async set/get operations have completed.
   */
  events: {
    changeInput: "qx.event.type.Data"
  },

  members: {
    /**
     * @type {qx.core.Object}
     */
    __input: null,

    /**
     * @type {qx.data.binding.IInputReceiver}
     */
    __outputReceiver: null,

    /**
     * Sets the object which will receive the output of this segment after it's computed.
     * This is either another segment or the Binding object.
     *
     * The last segment in the target path has no output receiver because we don't care what
     * the output value is.
     * @param {qx.data.binding.IInputReceiver} segment
     */
    setOutputReceiver(segment) {
      if (qx.core.Environment.get("qx.debug")) {
        if (this.__outputReceiver) {
          throw new Error("Output receiver already set");
        }
      }
      this.__outputReceiver = segment;
    },

    /**
     *
     * @returns {qx.data.binding.IInputReceiver} the object which is meant to receive the output of this segment
     */
    getOutputReceiver() {
      return this.__outputReceiver;
    },

    /**
     * @override
     * @interface qx.data.binding.IInputReceiver
     *
     * Sets the input value for this segment.
     * We will find the output value by dereferencing the input value with this segment (e.g. property name or array index),
     * and then relay it to the output receiver, which is usually another segment or the instance of `qx.data.binding.Binding`.
     *
     * @param {qx.core.Object} value the input that we are dereferencing with the path or array index
     * @returns {Promise?} If the operation is asynchronous, i.e. dereferencing a value at any part of the segment chain was asynchronous,
     * or setting the target value was asynchronous, it will return a Promise which resolves when all the operations have completed.
     * If it's synchrous, it returns null.
     */
    setInput(value) {
      if (value === this.__input) {
        return null; // no change
      }
      let old = this.__input;
      this.__input = value;

      let out = this._applyInput(value, old);
      if (qx.lang.Type.isPromise(out)) {
        return out.then(() => this.fireDataEvent("changeInput", value, old));
      } else {
        return this.fireDataEvent("changeInput", value, old);
      }
    },

    /**
     *
     * @returns {qx.core.Object} the input value that this segment is currently using
     */
    getInput() {
      return this.__input;
    },

    /**
     * @abstract
     *
     * This method should be overridden in subclasses,
     * and it should compute the output value based on the input,
     * and possibly add listeners to changes to the desired property in the input value,
     * and then relay the output value to the output receiver, which is usually another segment but can also be an instance of `qx.data.binding.Binding`.
     *
     * @param {qx.core.Object} value
     * @param {qx.core.Object} oldValue
     * @returns {Promise?} If the operation is asynchronous, i.e. dereferencing a value at any part of the segment chain was asynchronous,
     * or setting the target value was asynchronous, it will return a Promise which resolves when all the operations have completed.
     * If it's synchrous, it returns null.
     */
    _applyInput(value, oldValue) {},

    /**
     * Should be called when the output value has been computed and needs to be set
     * on the output receiver.
     * @param {qx.core.Object | null | undefined} output The output to the next segment. Should be undefined if the input to this segment was nullish.
     * Should be null if the input was not nullish but the output is null.
     *
     * @returns {Promise?} If the operation is asynchronous, i.e. dereferencing a value at any part of the segment chain was asynchronous,
     * or setting the target value was asynchronous, it will return a Promise which resolves when all the operations have completed.
     * If it's synchrous, it returns null.
     */
    _setOutput(output) {
      if (!this.__outputReceiver) {
        throw new Error("No output receiver set");
      }
      return this.__outputReceiver.setInput(output);
    },

    /**
     * This method should compute the output value based on the input and set the `output` property.
     * If this operation is asynchronous, it should return a Promise which resolves when the output property has been fully set.
     * Otherwise, it should return null.
     *
     * @abstract
     * @returns {Promise?}
     */
    updateOutput() {
      throw new Error(`${this.classname}.updateOutput not implemented`);
    },

    /**
     * Sets the property on the `input` object depicted by this segment to the given value.
     * @abstract
     * @param {* | null | undefined} value If undefined, this resets the target property. Otherwise, it sets the target property to the given value.
     * @returns {Promise?} If the operation is asynchronous, it should return a Promise which resolves when the value has been set.
     * If it's synchronous, it should return null.
     */
    setTargetValue(value) {
      throw new Error(`${this.classname}.setTargetValue not implemented`);
    }
  }
});
