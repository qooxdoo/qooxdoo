/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.theme.manager.Font",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.manager = qx.theme.manager.Font.getInstance();
      this.__formerTheme = this.manager.getTheme();
    },


    tearDown : function()
    {
      qx.test.Theme.themes = null;
      this.manager.setTheme(this.__formerTheme);
      this.__formerTheme = null;
    },


    testInclude : function()
    {
      qx.Theme.define("qx.test.Theme.themes.A",
      {
        extend : qx.theme.modern.Font,

        fonts :
        {
          "myfont" :
          {
            include : "default",
            bold : true
          },

          "mysecondfont" :
          {
            include : "myfont",
            italic : true
          }
        }
      });

      this.manager.setTheme(qx.test.Theme.themes.A);

      var fontTheme = this.manager.getTheme();

      this.assertKeyInMap("size", fontTheme.fonts.myfont, "Including font theme failed");
      this.assertKeyInMap("lineHeight", fontTheme.fonts.myfont, "Including font theme failed");
      this.assertKeyInMap("family", fontTheme.fonts.myfont, "Including font theme failed");
      this.assertKeyInMap("bold", fontTheme.fonts.myfont, "Including font theme failed");

      this.assertKeyInMap("size", fontTheme.fonts.mysecondfont, "Including font theme failed");
      this.assertKeyInMap("lineHeight", fontTheme.fonts.mysecondfont, "Including font theme failed");
      this.assertKeyInMap("family", fontTheme.fonts.mysecondfont, "Including font theme failed");
      this.assertKeyInMap("bold", fontTheme.fonts.mysecondfont, "Including font theme failed");
      this.assertKeyInMap("italic", fontTheme.fonts.mysecondfont, "Including font theme failed");
    }
  }
});
