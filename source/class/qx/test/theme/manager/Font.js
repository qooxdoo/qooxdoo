/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.theme.manager.Font", {
  extend: qx.dev.unit.TestCase,

  members: {
    __formerTheme: null,
    __formerListener: null,

    setUp() {
      this.manager = qx.theme.manager.Font.getInstance();
      this.__formerTheme = this.manager.getTheme();

      let listener = qx.event.Registration.getManager(
        this.manager
      ).getAllListeners();
      let hash =
        this.manager.$$hash || qx.core.ObjectRegistry.toHashCode(this.manager);
      this.__formerListener = { ...listener[hash] };
      delete listener[hash];
    },

    tearDown() {
      qx.test.Theme.themes = null;
      this.manager.setTheme(this.__formerTheme);
      this.__formerTheme = null;

      let listener = qx.event.Registration.getManager(
        this.manager
      ).getAllListeners();
      let hash =
        this.manager.$$hash || qx.core.ObjectRegistry.toHashCode(this.manager);
      listener[hash] = this.__formerListener;
      this.__formerListener = null;
      qx.ui.core.queue.Manager.flush();
    },

    testInclude() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        extend: qx.theme.simple.Font,

        fonts: {
          myfont: {
            include: "default",
            bold: true
          },

          mysecondfont: {
            include: "myfont",
            italic: true
          }
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      var fontTheme = this.manager.getTheme();

      this.assertKeyInMap(
        "size",
        fontTheme.fonts.myfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "family",
        fontTheme.fonts.myfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "bold",
        fontTheme.fonts.myfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "size",
        fontTheme.fonts.mysecondfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "family",
        fontTheme.fonts.mysecondfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "bold",
        fontTheme.fonts.mysecondfont,
        "Including font theme failed"
      );

      this.assertKeyInMap(
        "italic",
        fontTheme.fonts.mysecondfont,
        "Including font theme failed"
      );
    }
  }
});
