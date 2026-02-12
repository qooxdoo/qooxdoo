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
 * Segment that represents a property name in a binding path.
 */
qx.Class.define("qx.data.binding.PropNameSegment", {
  extend: qx.data.binding.AbstractSegment,

  /**
   * @param {qx.data.SingleValueBinding} binding The binding that this segment belongs to.
   * @param {String} propName
   */
  construct(binding, propName) {
    super(binding);
    let lower = qx.lang.String.firstLow(propName);
    if (qx.core.Environment.get("qx.debug")) {
      if (lower !== propName) {
        this.warn(`Binding: property name "${propName}" should be lower case, using "${lower}" instead`);
      }
    }
    this.__propName = lower;
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
      if (input === null || input === undefined) {
        return this._setOutput(undefined);
      } else {
        let property = qx.Class.getByProperty(input.constructor, this.__propName);
        if (property === null) {
          return this._setOutput(null);
        }
        if (!property.isAsync() || property.isInitialized(input)) {
          let nextInput = property.get(input, this.__propName);
          return this._setOutput(nextInput);
        } else {
          let promise = property.getAsync(input);
          return promise.then(nextInput => this._setOutput(nextInput));
        }
      }
    },

    /**
     * @override
     */
    setTargetValue(targetValue) {
      if (this.getInput() == null || this.getInput() === undefined) {
        return;
      }
      if (targetValue !== undefined) {
        return qx.data.SingleValueBinding.set(this.getInput(), this.__propName, targetValue);
      } else {
        return qx.data.SingleValueBinding.reset(this.getInput(), this.__propName);
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
