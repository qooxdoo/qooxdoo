

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 *
 * @asset(qx/test/webworker.js)
 */

qx.Class.define("qx.test.bom.FileReader", {
  extend : qx.dev.unit.TestCase,
  include: [qx.dev.unit.MRequirements],

  members :
  {
    hasReader: function() {
      return qx.core.Environment.get("html.filereader");
    },

    setUp: function() {
    },

    tearDown: function() {
    }
  }
});
