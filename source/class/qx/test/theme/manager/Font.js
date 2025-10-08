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
    __savedListeners: null,

    setUp() {
      this.manager = qx.theme.manager.Font.getInstance();
      this.__formerTheme = this.manager.getTheme();

      let eventMgr = qx.event.Registration.getManager(this.manager);

      // Serialize listeners (Array of {handler, self, type, capture})
      this.__savedListeners = eventMgr.serializeListeners(this.manager);

      // Remove all listeners
      eventMgr.removeAllListeners(this.manager);
    },

    tearDown() {
      qx.test.Theme.themes = null;

      this.manager.setTheme(this.__formerTheme);
      this.__formerTheme = null;

      // Restore all listeners
      if (this.__savedListeners) {
        this.__savedListeners.forEach(entry => {
          qx.event.Registration.addListener(
            this.manager,
            entry.type,
            entry.handler,
            entry.self,
            entry.capture
          );
        });
        this.__savedListeners = null;
      }

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
