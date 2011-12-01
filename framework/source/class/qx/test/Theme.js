/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

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
            decorator : qx.ui.decoration.Uniform,
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
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    },


    testIncludeTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Uniform,
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
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    },


    testIncludeInvalidTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Uniform,
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
            decorator : qx.ui.decoration.Uniform,
            style : {}
          }
        }
      });

      qx.Theme.define("qx.test.Theme.themes.B", {
        patch : qx.test.Theme.themes.A,
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Single,
            style : {}
          }
        }
      });

      var decorationManager = qx.theme.manager.Decoration.getInstance();
      decorationManager.setTheme(qx.test.Theme.themes.B);
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    },


    testPatchInvalidTheme : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Uniform,
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
            decorator : qx.ui.decoration.Uniform,
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
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    },


    testDoubleExtend : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Uniform,
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
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    },


    testExtendThemeWithIncludes : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A", {
        decorations : {
          "basic" : {
            decorator : qx.ui.decoration.Uniform,
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
      this.assertInstance(decorationManager.resolve("basic"), qx.ui.decoration.Uniform);
    }
  }
});
