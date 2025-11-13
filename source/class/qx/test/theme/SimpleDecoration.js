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
 * Test decoration theme that extends the Simple decoration theme with
 * test-specific decorations for the test runner.
 */
qx.Theme.define("qx.test.theme.SimpleDecoration", {
  extend: qx.theme.simple.Decoration,

  decorations: {
    "test-ui-basic-image-toolbar-part": {
      style: {
        backgroundImage: "decoration/toolbar/toolbar-part.gif",
        backgroundRepeat: "repeat-y"
      }
    }
  }
});
