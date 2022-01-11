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
 * This mixin must be included into themes appearance if you want to use that
 * theme with the testrunner
 */
qx.Theme.define("qx.test.MAppearance", {
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
