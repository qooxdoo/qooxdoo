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
 * Binding Segment that handles arrays; the path is expected to be `path[2]`
 */
qx.Class.define("qx.data.binding.ArraySegment", {
  extend: qx.core.Object,
  implement: [qx.data.binding.ISegment],

  /**
   * Constructor
   *
   * @param {String} path
   * @param {qx.data.binding.ISegment} nextSegment
   */
  construct(path, nextSegment) {
    super();
    let pos = path.indexOf("[");
    if (qx.core.Environment.get("qx.debug")) {
      this.assertTrue(pos > -1);
      this.assertTrue(pos < path.length - 2);
      this.assertTrue(path[path.length - 1] == "]");
    }
    this.__path = path.substring(0, pos);
    this.__index = path.substring(pos + 1, path.length - 1);
    this.__nextSegment = nextSegment;
  },

  /**
   * Destructor
   */
  destruct() {
    let value = this.getValue();
    if (value) {
      let upname = qx.lang.String.firstUp(this.__path);
      let array = value["get" + upname]();
      if (array instanceof qx.data.Array) {
        array.removeListener("change", this.__onChangeContents, this);
      }
      value.removeListener(
        "change" + upname,
        this.__onChangeValueProperty,
        this
      );
    }
  },

  properties: {
    /** The "value" is the value which is examined with the path */
    value: {
      init: null,
      nullable: true,
      event: "changeValue",
      apply: "__applyValue"
    }
  },

  members: {
    /** @type{String} the path (without []) */
    __path: null,

    /** @type{Integer} the index into the array */
    __index: null,

    /** @type{qx.data.binding.ISegment} the next segment to pass values on to */
    __nextSegment: null,

    /**
     * Apply for `value`
     */
    async __applyValue(value, oldValue) {
      let upname = qx.lang.String.firstUp(this.__path);

      if (oldValue) {
        let array = oldValue["get" + upname]();
        if (array instanceof qx.data.Array) {
          array.removeListener("change", this.__onChangeContents, this);
        }
        oldValue.removeListener(
          "change" + upname,
          this.__onChangeValueProperty,
          this
        );
      }
      if (value == null) {
        await this.__nextSegment.setValue(null);
      } else {
        let array = await qx.data.binding.Binding.get(value, this.__path);
        if (array instanceof qx.data.Array) {
          array.addListener("change", this.__onChangeContents, this);
        }
        value.addListener(
          "change" + upname,
          this.__onChangeValueProperty,
          this
        );

        let nextValue = this.__get(array);
        await this.__nextSegment.setValue(nextValue);
      }
    },

    /**
     * Gets the indexed value out of the array, null if there is no value
     *
     * @param {Array|qx.data.Array} array
     * @returns {Object*}
     */
    __get(array) {
      if (!array) {
        return null;
      }
      if (array instanceof qx.data.Array) {
        if (array.getLength() >= this.__index) {
          return null;
        }
        return array.getItem(this.__index);
      }
      if (array.length >= this.__index) {
        return null;
      }
      return array[this.__index];
    },

    /**
     * Event handler for when the value property changes
     *
     * @param {qx.event.type.Data} evt
     */
    async __onChangeValueProperty(evt) {
      let oldValue = evt.getOldData();
      let value = evt.getData();

      if (oldValue instanceof qx.data.Array) {
        oldValue.removeListener("change", this.__onChangeContents, this);
      }
      if (value instanceof qx.data.Array) {
        value.addListener("change", this.__onChangeContents, this);
      }
      let nextValue = this.__get(value);
      await this.__nextSegment.setValue(nextValue);
    },

    /**
     * Event handler for when the contents of the array changes
     *
     * @param {qx.event.type.Data} evt
     */
    async __onChangeContents(evt) {
      let array = evt.getTarget();
      let nextValue = this.__get(array);
      await this.__nextSegment.setValue(nextValue);
    }
  }
});
