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

qx.Class.define("qx.test.ui.core.Appearance",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __oldAppearance : null,

    setUp : function() {
      this.__oldAppearance = qx.theme.manager.Appearance.getInstance().getTheme();
      qx.theme.manager.Appearance.getInstance().setTheme(qx.test.ui.core.Theme);
    },

    tearDown : function() {
      this.base(arguments);
      qx.theme.manager.Appearance.getInstance().setTheme(this.__oldAppearance);
    },

    testDefault : function()
    {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("red", a.getBackgroundColor());
      this.assertEquals("blue", a.getChildControl("text").getBackgroundColor());
      a.destroy();
    },


    testFallback : function()
    {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test2");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("yellow", a.getBackgroundColor());
      this.assertEquals("green", a.getChildControl("text").getBackgroundColor());
      a.destroy();
    },


    testChange : function()
    {
      var a = new qx.test.ui.core.Test();
      a.setAppearance("test2");
      this.getRoot().add(a);
      a.getChildControl("text");
      this.flush();

      this.assertEquals("yellow", a.getBackgroundColor());
      this.assertEquals("green", a.getChildControl("text").getBackgroundColor());

      a.setAppearance("test");
      this.flush();

      this.assertEquals("red", a.getBackgroundColor());
      this.assertEquals("blue", a.getChildControl("text").getBackgroundColor());
      a.destroy();
    },


    testReuseNotDefined : function() {
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
      this.assertEquals("black", a.getChildControl("text2").getBackgroundColor());
      // check for the textfield fallback
      this.assertEquals("green", a.getChildControl("text").getBackgroundColor());

      a.destroy();
    }

  }
});

qx.Theme.define("qx.test.ui.core.Theme", {
  appearances :
  {
    "test" : {
      style : function(states)
      {
        return {
          backgroundColor : "red"
        };
      }
    },

    "test/text" : {
      style : function(states)
      {
        return {
          backgroundColor : "blue"
        };
      }
    },

    "textfield" : {
      style : function(states)
      {
        return {
          backgroundColor : "green"
        };
      }
    },

    "test2" : {
      style : function(states)
      {
        return {
          backgroundColor : "yellow"
        };
      }
    },

    "test2/text2" : {
      style : function(states)
      {
        return {
          backgroundColor : "black"
        };
      }
    }
  }
});


qx.Class.define("qx.test.ui.core.Test", {
  extend : qx.ui.core.Widget,
  construct : function() {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.Grow());
  },
  members : {
    _createChildControlImpl : function(id, hash) {
      if (id == "text" || id == "text2") {
        var control = new qx.ui.form.TextField("affe");
        this._add(control);
        return control;
      }
      return this.base(arguments, id);
    }
  }
});
