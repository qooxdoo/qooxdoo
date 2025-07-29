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
 * Segment that represents a property name in a binding path.
 */
qx.Class.define("qx.data.binding.PropNameSegment", {
  extend: qx.data.binding.AbstractSegment,

  /**
   * @param {String} propName
   */
  construct(propName) {
    super();
    this.__propName = propName;
  },

  /**
   * Destructor
   */
  destruct() {
    let input = this.getInput();
    if (input) {
      let eventName = this.__getEventName(input);
      eventName && input.removeListener(eventName, this.__onChangeInputProperty, this);
    }
  },

  members: {
    /** @type {String} the property name for this segment */
    __propName: null,

    /**
     *
     * @returns {String} the property name for this segment
     */
    getPropName() {
      return this.__propName;
    },

    /**@override */
    toString() {
      return this.__propName;
    },

    /**
     * Apply for `input`
     */
    _applyInput(value, oldValue) {
      if (oldValue) {
        let eventName = this.__getEventName(oldValue);
        eventName && oldValue.removeListener(eventName, this.__onChangeInputProperty, this);
        this.setEventName(null);
      }

      if (value) {
        let eventName = this.__getEventName(value);
        eventName && value.addListener(eventName, this.__onChangeInputProperty, this);
        this.setEventName(eventName);
      }

      if (this.getOutputReceiver()) {
        return this.updateOutput();
      }
    },

    updateOutput() {
      let input = this.getInput();
      if (input == null) {
        return this._setOutput(null);
      } else {
        let property = qx.Class.getByProperty(input.constructor, this.__propName);
        if (property === null) {
          return this._setOutput(null);
        }
        if (property.isInitialized(input)) {
          let nextInput = property.get(input, this.__propName);
          return this._setOutput(nextInput);
        } else {
          let promise = property.get(input, this.__propName);
          return promise?.then(nextInput => this._setOutput(nextInput));
        }
      }
    },

    /**
     * @override
     */
    setTargetValue(targetValue) {
      if (this.getInput()) {
        return qx.data.binding.Binding.set(this.getInput(), this.__propName, targetValue);
      }
    },

    /**
     * Event handler for when the input property changes
     *
     * @param {qx.event.type.Data} evt
     */
    __onChangeInputProperty(evt) {
      if (this.getOutputReceiver()) {
        return this._setOutput(evt.getData());
      }
    },

    /**
     *
     * @param {*} input
     * @returns {string}
     */
    __getEventName(input) {
      let property = qx.Class.getByProperty(input.constructor, this.__propName);
      if (property) {
        return property.getEventName();
      }

      if (qx.Class.supportsEvent(input.constructor, this.__propName)) {
        return this.__propName;
      }
      return null;
    }
  }
});
