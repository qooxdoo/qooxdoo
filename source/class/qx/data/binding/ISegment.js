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
 * Paths for binding are broken up into segments, each of which implements
 * `qx.data.binding.ISegment`
 */
qx.Interface.define("qx.data.binding.ISegment", {
  members: {
    setValue(value) {}
  }
});
