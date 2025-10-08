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

qx.Class.define("qx.test.theme.manager.Decoration", {
  extend: qx.dev.unit.TestCase,

  members: {
    __formerTheme: null,
    __savedListeners: null,

    setUp() {
      this.manager = qx.theme.manager.Decoration.getInstance();
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
          decoration: "test/decoration",
          custom: "test/custom"
        },

        decorations: {
          main: {
            style: {}
          },

          window: {
            style: {}
          }
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      // make sure the decoration alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("test/decoration", alias.resolve("decoration"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testAliasExtend() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          decoration: "test/decoration",
          custom: "test/custom"
        },

        decorations: {
          main: {
            style: {}
          },

          window: {
            style: {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend: qx.test.Theme.themes.A,
        decorations: {}
      });

      this.manager.setTheme(qx.test.Theme.themes.B);

      // make sure the decoration alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("test/decoration", alias.resolve("decoration"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testAliasOverride() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          decoration: "test/decoration",
          custom: "test/custom"
        },

        decorations: {
          main: {
            style: {}
          },

          window: {
            style: {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend: qx.test.Theme.themes.A,
        aliases: {
          decoration: "juhu/decoration"
        },

        decorations: {}
      });

      this.manager.setTheme(qx.test.Theme.themes.B);

      // make sure the decoration alias is set
      var alias = qx.util.AliasManager.getInstance();
      this.assertEquals("juhu/decoration", alias.resolve("decoration"));
      this.assertEquals("test/custom", alias.resolve("custom"));
    },

    testChangeThemeEventFired() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        aliases: {
          decoration: "test/decoration",
          custom: "test/custom"
        },

        decorations: {
          main: {
            style: {}
          },

          window: {
            style: {}
          }
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
    },

    testAddCssClass() {
      qx.Theme.define("qx.test.Theme.themes.B", {
        aliases: {
          decoration: "test/decoration",
          custom: "test/custom"
        },

        decorations: {
          main: {
            style: {}
          },

          window: {
            style: {}
          },

          "test-add-css": {
            style: {
              backgroundColor: "red",
              backgroundImage: "icon/16/places/folder-open.png"
            }
          }
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.B);
      var selector = this.manager.addCssClass("test-add-css");
      var sheet = qx.ui.style.Stylesheet.getInstance();
      var elem = document.createElement("div");
      elem.setAttribute("class", selector);
      document.body.appendChild(elem);
      var compStyle = window.getComputedStyle(elem);
      this.assertEquals(
        "255,0,0",
        qx.util.ColorUtil.cssStringToRgb(
          compStyle.getPropertyValue("background-color")
        )
      );
    }
  }
});
