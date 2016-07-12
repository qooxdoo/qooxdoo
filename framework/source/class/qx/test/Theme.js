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
/**
 * @ignore(qx.theme.Foo)
 */

qx.Class.define("qx.test.Theme",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function ()
    {
      this.__formerTheme = qx.theme.manager.Decoration.getInstance().getTheme();
    },

    tearDown : function()
    {
      qx.test.Theme.themes = null;
      qx.theme.manager.Decoration.getInstance().setTheme(this.__formerTheme);
      this.__formerTheme = null;
    },

    testExtendTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend : qx.test.Theme.themes.A,
        decorations : {}
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.B);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    },


    testIncludeTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        include : qx.test.Theme.themes.A,
        decorations : {}
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.B);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    },


    testIncludeInvalidTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.A);

      this.assertException(function() {
        var invalidTheme = qx.theme.Foo;
        qx.Theme.include(qx.test.Theme.themes.A, invalidTheme);
      }, Error, "Mixin theme is not a valid theme!");

      this.assertException(function() {
        var invalidTheme = null;
        qx.Theme.include(qx.test.Theme.themes.A, invalidTheme);
      }, Error, "Mixin theme is not a valid theme!");
    },


    testPatchTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        patch : qx.test.Theme.themes.A,
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.B);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    },


    testPatchInvalidTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.A);

      this.assertException(function() {
        var invalidTheme = qx.theme.Foo;
        qx.Theme.patch(qx.test.Theme.themes.A, invalidTheme);
      }, Error, "Mixin theme is not a valid theme!");

      this.assertException(function() {
        var invalidTheme = null;
        qx.Theme.patch(qx.test.Theme.themes.A, invalidTheme);
      }, Error, "Mixin theme is not a valid theme!");
    },


    testIncludeThemeWithIncludes : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        include : [qx.test.Theme.themes.A],
        decorations : {}
      });

      qx.Theme.define("qx.test.Theme.themes.C", {
        include : [qx.test.Theme.themes.B],
        decorations : {}
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.C);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    },


    testDoubleExtend : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        extend : qx.test.Theme.themes.A,
        decorations : {}
      });

      qx.Theme.define("qx.test.Theme.themes.C", {
        extend : qx.test.Theme.themes.B,
        decorations : {}
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.C);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    },


    testExtendThemeWithIncludes : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        include : [qx.test.Theme.themes.A],
        decorations : {}
      });

      qx.Theme.define("qx.test.Theme.themes.C", {
        extend : qx.test.Theme.themes.B,
        decorations : {}
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.C);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Decorator);
    }
  }
});
