/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2026 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.ui.embed.Html", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    testApplyFontKeepsColorInSharedFont() {
      var font = new qx.bom.Font();
      font.setColor("#FF0000");

      var colored = new qx.ui.embed.Html("colored");
      colored.setTextColor("#00FF00");
      colored.setFont(font);

      var plain = new qx.ui.embed.Html("plain");
      plain.setTextColor(null);
      plain.setFont(font);

      this.getRoot().add(colored);
      this.getRoot().add(plain);
      this.flush();

      this.assertEquals(
        "#FF0000",
        plain.getContentElement().getStyle("color"),
        "An embed with its own text color must not remove the color from the shared font."
      );

      colored.destroy();
      plain.destroy();
      font.dispose();
    }
  }
});
