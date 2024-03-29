/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/**
 * For a basic, out-of-browser application (running e.g. on Node.js, Rhino).
 *
 * @use(qx.core.BaseInit)
 */
qx.Class.define("qx.application.Basic", {
  extend: qx.core.Object,
  implement: [qx.application.IApplication],

  members: {
    // interface method
    main() {
      // empty
    },

    // interface method
    finalize() {
      // empty
    },

    // interface method
    close() {
      // empty
    },

    // interface method
    terminate() {
      // empty
    }
  }
});
