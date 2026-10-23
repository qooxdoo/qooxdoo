/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.bom.webfonts.WebFontLoader", {
  extend: qx.dev.unit.TestCase,

  members: {
    __findFontFaceRule(fontFamily) {
      for (let styleSheet of document.styleSheets) {
        let rules;
        try {
          rules = styleSheet.cssRules;
        } catch (ex) {
          continue;
        }
        for (let rule of rules) {
          if (rule.cssText.startsWith("@font-face") && rule.cssText.includes(fontFamily)) {
            return rule.cssText;
          }
        }
      }
      return null;
    },

    testVersionAppendedOnce() {
      let fontFamily = "qxTestWebFontVersion" + Date.now();
      let loader = new qx.bom.webfonts.WebFontLoader(fontFamily);
      loader.setVersion("abc123");
      loader.setFontFaces([
        {
          fontFamily: fontFamily,
          paths: ["https://example.org/fonts/test.woff"]
        }
      ]);

      loader.load();

      let rule = this.__findFontFaceRule(fontFamily);
      this.assertNotNull(rule, "@font-face rule was not created");
      this.assertEquals(1, rule.split("abc123").length - 1, rule);
      loader.dispose();
    }
  }
});
