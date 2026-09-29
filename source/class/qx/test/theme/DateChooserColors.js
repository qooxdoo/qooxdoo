/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Checks that every color which the date chooser appearances of a theme use
 * is defined in the color theme of the same theme.
 */
qx.Class.define("qx.test.theme.DateChooserColors", {
  extend: qx.dev.unit.TestCase,

  statics: {
    STATES: [
      "disabled",
      "selected",
      "hovered",
      "pressed",
      "focused",
      "invalid",
      "weekend",
      "otherMonth",
      "today",
      "header",
      "lastYear",
      "lastMonth",
      "nextYear",
      "nextMonth"
    ],

    COLOR_KEYS: ["textColor", "backgroundColor"]
  },

  members: {
    /**
     * Returns the style functions of the appearance entries whose id starts
     * with a prefix; the entries of an extended theme are inherited through
     * the prototype chain.
     *
     * @param theme {qx.Theme} the appearance theme
     * @param prefix {String} the prefix of the appearance ids
     * @return {Map} style functions by appearance id
     */
    __getStyleFunctions(theme, prefix) {
      let styles = {};
      for (let id in theme.appearances) {
        let entry = theme.appearances[id];
        if (id.startsWith(prefix) && entry.style) {
          styles[id] = entry.style;
        }
      }
      return styles;
    },

    __checkTheme(metaTheme) {
      let colors = metaTheme.meta.color.colors;
      let styles = this.__getStyleFunctions(
        metaTheme.meta.appearance,
        "datechooser"
      );

      let stateMaps = [{}];
      for (let state of this.self(arguments).STATES) {
        stateMaps.push({ [state]: true });
      }

      let missing = [];
      for (let id in styles) {
        for (let states of stateMaps) {
          let style = styles[id](states, {}) || {};
          for (let key of this.self(arguments).COLOR_KEYS) {
            let color = style[key];
            if (
              typeof color == "string" &&
              !(color in colors) &&
              !qx.util.ColorUtil.isCssString(color)
            ) {
              let msg = id + " " + key + ": " + color;
              if (!missing.includes(msg)) {
                missing.push(msg);
              }
            }
          }
        }
      }

      this.assertArrayEquals(
        [],
        missing,
        metaTheme.name + " uses undefined colors: " + missing.join(", ")
      );
    },

    testSimple() {
      this.__checkTheme(qx.theme.Simple);
    },

    testIndigo() {
      this.__checkTheme(qx.theme.Indigo);
    },

    testIndigoDark() {
      this.__checkTheme(qx.theme.IndigoDark);
    },

    testModern() {
      this.__checkTheme(qx.theme.Modern);
    },

    testClassic() {
      this.__checkTheme(qx.theme.Classic);
    },

    testTangibleLight() {
      this.__checkTheme(qx.theme.TangibleLight);
    },

    testTangibleDark() {
      this.__checkTheme(qx.theme.TangibleDark);
    }
  }
});
