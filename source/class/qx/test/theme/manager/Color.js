/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Class.define("qx.test.theme.manager.Color", {
  extend: qx.dev.unit.TestCase,

  members: {
    __formerTheme: null,
    __formerListener: null,

    setUp() {
      this.manager = qx.theme.manager.Color.getInstance();
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
        extend: qx.theme.indigo.Color,

        colors: {
          a: "#111111",
          b: "#222222",
          c: "#333333"
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      var theme = this.manager.getTheme();

      this.assertEquals("#111111", theme.colors["a"]);
      this.assertEquals("#222222", theme.colors["b"]);
      this.assertEquals("#333333", theme.colors["c"]);
    },

    testResolve() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        extend: qx.theme.indigo.Color,

        colors: {
          a: "#111111",
          b: "#222222",
          c: "#333333"
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      this.assertEquals("#111111", this.manager.resolve("a"));
      this.assertEquals("#222222", this.manager.resolve("b"));
      this.assertEquals("#333333", this.manager.resolve("c"));
      this.assertEquals("d", this.manager.resolve("d"));
    },

    testResolveSelfReference() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        extend: qx.theme.indigo.Color,

        colors: {
          a: "#111111",
          b: "a",
          c: "b"
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      this.assertEquals("#111111", this.manager.resolve("a"));
      this.assertEquals("#111111", this.manager.resolve("b"));
      this.assertEquals("#111111", this.manager.resolve("c"));
    },

    testResolveException() {
      qx.Theme.define("qx.test.Theme.themes.A", {
        extend: qx.theme.indigo.Color,

        colors: {
          d: "xyz"
        }
      });

      var self = this;
      this.assertException(function () {
        self.manager.setTheme(qx.test.Theme.themes.A);
      });

      qx.Theme.define("qx.test.Theme.themes.A", {
        extend: qx.theme.indigo.Color,

        colors: {
          b: "a",
          c: "b"
        }
      });

      var self = this;
      this.assertException(function () {
        self.manager.setTheme(qx.test.Theme.themes.A);
      });
    }
  }
});
