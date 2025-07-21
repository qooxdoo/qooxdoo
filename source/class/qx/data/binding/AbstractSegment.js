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
     * Sets the objects which will receive the output of this segment after it's computed.
     * This is either another segment or the Binding object.
     *
     * The last segment in the target path has no output receiver because we don't care what
     * the output value is.
     * @param {qx.data.binding.IInputReceiver} segment
     */
    setOutputReceiver(segment) {
      if (this.__outputReceiver) {
        throw new Error("Output receiver already set");
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
     * @param {qx.core.Object} value the input that we are dereferencing with the path or array index
     */
    setInput(value) {
      if (value === this.__input) {
        return null; // no change
      }
      let old = this.__input;
      this.__input = value;

      let tracker = {};
      const Utils = qx.event.Utils;

      Utils.then(tracker, () => this._applyInput(value, old));
      return Utils.then(tracker, () => this.fireDataEvent("changeInput", value, old));
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
     * and possibly add listeners to changes to the desired property in the input value.
     *
     * @param {qx.core.Object} value
     * @param {qx.core.Object} oldValue
     * @returns {Promise?} If the operation is asynchronous, it should return a Promise which resolves when it has completed.
     * If it's synchrous, it should return null.
     */
    _applyInput(value, oldValue) {},

    /**
     * Should be called when the output value has been computed and needs to be set
     * on the output receiver.
     * @param {qx.core.Object} output
     * @returns
     */
    _setOutput(output) {
      if (!this.__outputReceiver) {
        throw new Error("No output receiver set");
      }
      return this.__outputReceiver.setInput(output);
    },

    /**
     * This method should compute the output value based on the input and set the `output` property.
     * If the output value is asynchronous, it should return a Promise which resolves when the output property has been fully set.
     *
     * @abstract
     * @returns {Promise?}
     */
    updateOutput() {
      throw new Error("updateOutput must be implemented in subclass");
    },

    /**
     * Sets the property on the `input` object depicted by this segment to the given value.
     * @abstract
     * @param {*} value
     */
    setTargetValue(value) {
      throw new Error("setTargetValue must be implemented in subclass");
    }
  }
});
