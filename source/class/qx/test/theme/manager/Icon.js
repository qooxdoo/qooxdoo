/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.theme.manager.Icon", {
  extend: qx.dev.unit.TestCase,

  members: {
    __formerTheme: null,
    __savedListeners: null,

    setUp() {
      this.manager = qx.theme.manager.Icon.getInstance();
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

    testAlias() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          icon: "test/icon",
          custom: "test/custom"
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      // make sure the icon alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("test/icon", alias.resolve("icon"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testAliasExtend() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          icon: "test/icon",
          custom: "test/custom"
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend: qx.test.Theme.themes.A
      });

      this.manager.setTheme(qx.test.Theme.themes.B);

      // make sure the icon alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("test/icon", alias.resolve("icon"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testAliasOverride() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          icon: "test/icon",
          custom: "test/custom"
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend: qx.test.Theme.themes.A,
        aliases: {
          icon: "juhu/icon"
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.B);

      // make sure the icon alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("juhu/icon", alias.resolve("icon"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testChangeThemeEventFired() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          icon: "my/icon/Theme"
        }
      });

      var that = this;
      this.assertEventFired(
        this.manager,
        "changeTheme",
        function () {
          that.manager.setTheme(qx.test.Theme.themes.A);
        },
        function (e) {
          that.assertIdentical(
            e.getData(),
            qx.test.Theme.themes.A,
            "Setting theme failed!"
          );
        }
      );
    }
  }
});
