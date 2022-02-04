/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @ignore(qx.test.ui.core.Theme, qx.test.ui.core.Test)
 */

qx.Class.define("qx.test.ui.core.Appearance", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __oldAppearance: null,

    setUp() {
      this.__oldAppearance =
        qx.theme.manager.Appearance.getInstance().getTheme();
      qx.theme.manager.Appearance.getInstance().setTheme(qx.test.ui.core.Theme);
    },

    tearDown() {
      super.tearDown();
      qx.theme.manager.Appearance.getInstance().setTheme(this.__oldAppearance);
    },

    testDefault() {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("red", a.getBackgroundColor());
      this.assertEquals("blue", a.getChildControl("text").getBackgroundColor());
      a.destroy();
    },

    testFallback() {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test2");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("yellow", a.getBackgroundColor());
      this.assertEquals(
        "green",
        a.getChildControl("text").getBackgroundColor()
      );

      a.destroy();
    },

    testChange() {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test2");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("yellow", a.getBackgroundColor());
      this.assertEquals(
        "green",
        a.getChildControl("text").getBackgroundColor()
      );

      a.setAppearance("test");
      this.flush();

      this.assertEquals("red", a.getBackgroundColor());
      this.assertEquals("blue", a.getChildControl("text").getBackgroundColor());
      a.destroy();
    },

    testReuseNotDefined() {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test");
      this.getRoot().add(a);
      a.getChildControl("text");
      a.getChildControl("text2").setAppearance("nix");
      this.flush();

      this.assertEquals("red", a.getBackgroundColor());
      this.assertEquals("blue", a.getChildControl("text").getBackgroundColor());

      a.setAppearance("test2");
      this.flush();

      this.assertEquals("yellow", a.getBackgroundColor());
      this.assertEquals(
        "black",
        a.getChildControl("text2").getBackgroundColor()
      );

      // check for the textfield fallback
      this.assertEquals(
        "green",
        a.getChildControl("text").getBackgroundColor()
      );

      a.destroy();
    }
  }
});

qx.Theme.define("qx.test.ui.core.Theme", {
  appearances: {
    test: {
      style(states) {
        return {
          backgroundColor: "red"
        };
      }
    },

    "test/text": {
      style(states) {
        return {
          backgroundColor: "blue"
        };
      }
    },

    textfield: {
      style(states) {
        return {
          backgroundColor: "green"
        };
      }
    },

    test2: {
      style(states) {
        return {
          backgroundColor: "yellow"
        };
      }
    },

    "test2/text2": {
      style(states) {
        return {
          backgroundColor: "black"
        };
      }
    }
  }
});

qx.Class.define("qx.test.ui.core.Test", {
  extend: qx.ui.core.Widget,
  construct() {
    super();
    this._setLayout(new qx.ui.layout.Grow());
  },
  members: {
    _createChildControlImpl(id, hash) {
      if (id == "text" || id == "text2") {
        var control = new qx.ui.form.TextField("affe");
        this._add(control);
        return control;
      }
      return super._createChildControlImpl(id);
    }
  }
});
