/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022-2023 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
    * Patryk Malinowski (https://github.com/patryk-m-malinowski, pmalinowski116@gmail.com)

************************************************************************ */

/**
 * Binding Segment that handles array indexes; the path is expected to be `[index]`
 */
qx.Class.define("qx.data.binding.ArrayIndexSegment", {
  extend: qx.data.binding.AbstractSegment,
  /**
   * @param {qx.data.SingleValueBinding} binding The binding that this segment belongs to.
   * @param {string} segment String representation of the segment, such as `[0]` or `[last]`
   */
  construct(binding, segment) {
    super(binding);
    this.__string = segment;

    if (qx.core.Environment.get("qx.debug")) {
      this.assertTrue(segment.startsWith("[") && segment.endsWith("]"), "Array index segment must start with [ and end with ]: " + segment);
    }

    let index = segment.substring(1, segment.length - 1);
    if (index === "last") {
      index = -1; // special case for last item
    } else {
      index = parseInt(index);
      if (isNaN(index)) {
        throw new Error("Invalid array index in segment: " + segment);
      }
      if (index < 0) {
        throw new Error("Array index must be >= 0, got: " + index);
      }
    }
    this.__index = index;
  },

  destruct() {
    let input = this.getInput();
    if (input) {
      if (this.__isListData(this.getInput())) {
        this.getInput().removeListener("change", this.__onChangeContents, this);
      }
    }
  },

  members: {
    /**
     * @type {String} the string representation of this segment
     */
    __string: null,

    /** @type {Integer} the index into the array */
    __index: null,

    /**@override */
    toString() {
      return this.__string;
    },

    __isListData(input) {
      return qx.Interface.objectImplements(input, qx.data.IListData);
    },

    /**
     * @override
     */
    _applyInput(value, oldValue) {
      if (oldValue) {
        this.setEventName(null);
        if (this.__isListData(oldValue)) {
          oldValue.removeListener("change", this.__onChangeContents, this);
        }
      }

      if (value) {
        if (this.__isListData(value)) {
          value.addListener("change", this.__onChangeContents, this);
          this.setEventName("change");
        }
      }
      if (this.getOutputReceiver()) {
        return this.updateOutput();
      }
    },

    /**@override */
    updateOutput() {
      return this._setOutput(this.__get());
    },

    /**
     * Computes the output value
     * @returns {*}
     */
    __get() {
      let input = this.getInput();
      if (!input) {
        return undefined;
      }

      if (this.__isListData(input)) {
        const len = input.getLength();
        const idx = this.__index === -1 ? len - 1 : this.__index;
        return idx >= len ? undefined : input.getItem(idx);
      }

      if (this.__index >= input.length) {
        return undefined;
      }
      return input.at(this.__index);
    },

    /**
     * @override
     */
    setTargetValue(targetValue) {
      let input = this.getInput();
      if (!input) {
        return;
      }
      if (this.__isListData(input)) {
        const idx = this.__index === -1 ? input.getLength() - 1 : this.__index;
        input.setItem(idx, targetValue);
      } else {
        const idx = this.__index === -1 ? input.length - 1 : this.__index;
        input[idx] = targetValue;
      }
    },

    /**
     * Event handler for when the contents of the array changes
     *
     * @param {qx.event.type.Data} evt
     */
    __onChangeContents(evt) {
      if (this.getOutputReceiver()) {
        this.updateOutput();
      }
    }
  }
});
