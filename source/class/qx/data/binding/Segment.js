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
 * Paths for binding are broken up into segments, and a `qx.data.binding.Segment` handles
 * simple property names
 */
qx.Class.define("qx.data.binding.Segment", {
  extend: qx.core.Object,
  implement: [qx.data.binding.ISegment],

  /**
   * Constructor
   *
   * @param {String} path
   * @param {qx.data.binding.ISegment?} nextSegment
   */
  construct(path, nextSegment) {
    super();
    this.__path = path;
    this.__nextSegment = nextSegment;
  },

  /**
   * Destructor
   */
  destruct() {
    let value = this.getValue();
    if (value) {
      let upname = qx.lang.String.firstUp(this.__path);
      value.removeListener(
        "change" + upname,
        this.__onChangeValueProperty,
        this
      );
    }
  },

  properties: {
    /** The "value" is the value to examine with the path */
    value: {
      init: null,
      nullable: true,
      event: "changeValue",
      apply: "_applyValue"
    }
  },

  members: {
    /** @type{String} the path for this segment */
    __path: null,

    /** @type{qx.data.binding.ISegment} the next segment */
    __nextSegment: null,

    /**
     * Apply for `value`
     */
    async _applyValue(value, oldValue) {
      let upname = qx.lang.String.firstUp(this.__path);

      if (oldValue) {
        oldValue.removeListener(
          "change" + upname,
          this.__onChangeValueProperty,
          this
        );
      }
      if (value == null) {
        await this.__nextSegment.setValue(null);
      } else {
        value.addListener(
          "change" + upname,
          this.__onChangeValueProperty,
          this
        );

        let nextValue = await qx.data.binding.Binding.get(value, this.__path);
        await this.__nextSegment.setValue(nextValue);
      }
    },

    executeImmediate(value) {
      let result = this.setValue(value);
      if (qx.lang.Type.isPromise(result)) {
        return result;
      }
      let nextValue = qx.data.binding.Binding.get(value, this.__path);
      if (qx.lang.Type.isPromise(nextValue)) {
        return nextValue;
      }
      this.__nextSegment.executeImmediate(nextValue);
    },

    /**
     * Event handler for when the value property changes
     *
     * @param {qx.event.type.Data} evt
     */
    async __onChangeValueProperty(evt) {
      await this.__nextSegment.setValue(evt.getData());
    }
  }
});
