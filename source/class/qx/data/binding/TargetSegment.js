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
 * This is the final segment used for setting a property value on a target
 */
qx.Class.define("qx.data.binding.TargetSegment", {
  extend: qx.core.Object,
  implement: [qx.data.binding.ISegment],

  /**
   * Constructor
   *
   * @param {String} path
   */
  construct(path) {
    super();
    this.__path = path;
  },

  properties: {
    /** The "value" is the value to have its property set with the path */
    value: {
      init: null,
      nullable: true,
      event: "changeValue"
    }
  },

  members: {
    /** @type{String} the path for this segment */
    __path: null,

    async setTargetValue(targetValue) {
      let value = this.getValue();
      if (value) {
        await qx.data.binding.Binding.set(value, this.__path, targetValue);
      }
    }
  }
});
