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
 * Test appearance theme that extends the Simple appearance theme with
 * test-specific appearances for the test runner.
 */
qx.Theme.define("qx.test.theme.SimpleAppearance", {
  extend: qx.theme.simple.Appearance,

  appearances: {
    "test-slider": {},

    "test-slider/knob": {
      include: "button-frame",

      style(states) {
        return {
          height: 14,
          width: 14,
          padding: 0,
          margin: 0
        };
      }
    },

    "test-font-label": {
      style(states) {
        return {
          textColor: "blue"
        };
      }
    }
  }
});
