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
 */
qx.Class.define("qx.data.binding.AbstractSegment", {
  type: "abstract",
  extend: qx.core.Object,

  properties: {
    /** The "input" is the input input that we are dereferencing with the path or array index */
    input: {
      init: null,
      nullable: true,
      event: "changeInput",
      apply: "_applyInput"
    },
    /**
     * Output value of the segment, after dereferencing the input.
     */
    output: {
      init: null,
      nullable: true,
      event: "changeOutput"
    },

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

  members: {
    _applyInput() {
      // This method should be overridden in subclasses,
      // and it should compute the output value based on the input,
      // and possibly add listeners to changes to the desired property in the input value.
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
