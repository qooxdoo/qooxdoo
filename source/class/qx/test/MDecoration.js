/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman john.spackman@zenesis.com)

************************************************************************ */

/**
 * This mixin must be included into themes decoration if you want to use that
 * theme with the testrunner
 */
qx.Theme.define("qx.test.MDecoration", {
  decorations: {
    "test-ui-basic-image-toolbar-part": {
      style: {
        backgroundImage: "decoration/toolbar/toolbar-part.gif",
        backgroundRepeat: "repeat-y"
      }
    }
  }
});
