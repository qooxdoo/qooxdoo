/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @asset(qx/test/webfonts/*)
 */

qx.Class.define("qx.test.ui.basic.Label",
{
  extend : qx.test.ui.LayoutTestCase,

  include : [qx.dev.unit.MRequirements, qx.dev.unit.MMock],

  members :
  {
    hasWebFontSupport : function()
    {
      var browser = qx.core.Environment.get("browser.name");
      var version = qx.core.Environment.get("browser.version");
      if ((browser == "firefox" && version < 3.5) ||
          (browser == "opera" && version < 10))
      {
        return false;
      }
      return true;
    },

    tearDown : function()
    {
      this.base(arguments);
      this.getSandbox().restore();
      qx.bom.webfonts.Manager.getInstance().dispose();
      delete qx.bom.webfonts.Manager.$$instance;
    },

    testHeightForWidth : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Grow());
      this.getRoot().add(container);

      var label = new qx.ui.basic.Label("juhu kinners juhu kinners juhu kinners juhu kinners juhu kinners juhu kinners ").set({
        rich: true
      });
      container.add(label);

      this.flush();
      var width = label.getBounds().width;
      this.assertEquals(width, container.getBounds().width);

      container.setWidth(10);
      this.flush();

      container.resetWidth();
      this.flush();

      this.assertEquals(width, label.getBounds().width);

      container.destroy();
    },


    testWrapSet : function() {
      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setWrap(true);
      this.assertEquals("normal", l.getContentElement().getStyle("whiteSpace"));
      l.dispose();
    },

    testTextAlign : function() {
      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setTextAlign("justify");
      this.assertEquals("justify", l.getContentElement().getStyle("textAlign"));
      l.dispose();

      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setTextAlign("right");
      this.assertEquals("right", l.getContentElement().getStyle("textAlign"));
      l.dispose();

      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setTextAlign("left");
      this.assertEquals("left", l.getContentElement().getStyle("textAlign"));
      l.dispose();

      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setTextAlign("center");
      this.assertEquals("center", l.getContentElement().getStyle("textAlign"));
      l.dispose();
    },


    testWrapNotSet : function() {
      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setWrap(false);
      this.assertEquals("nowrap", l.getContentElement().getStyle("whiteSpace"));
      l.dispose();
    },

    testApplyWebFont : function() {
      this.require(["webFontSupport"]);
      var l = new qx.ui.basic.Label("Laugh while you can, monkey boy!");

      var f = new qx.bom.webfonts.WebFont();
      f.set({
        size: 18,
        family: ["monospace"],
        sources:
        [
          {
            family : "FinelinerScriptRegular",
            source: [ qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/fineliner_script-webfont.woff"),
                      qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/fineliner_script-webfont.ttf"),
                      qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/fineliner_script-webfont.eot") ]
          },
          {
            family : "YanoneKaffeesatzRegular",
            source: [ qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/yanonekaffeesatz-regular-webfont.woff"),
                      qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/yanonekaffeesatz-regular-webfont.ttf"),
                      qx.util.ResourceManager.getInstance().toUri("qx/test/webfonts/yanonekaffeesatz-regular-webfont.eot") ]
          }
        ]
      });

      var statusChangeSpy = this.spy(l, "_onWebFontStatusChange");
      l.setFont(f);

      qx.event.Timer.once(function() {
        this.resume(function() {
          l.dispose();
          f.dispose();
          this.assertCalledTwice(statusChangeSpy);
        }, this);
      }, this, 2500);

      this.wait(5000);
    },

    testApplyFontColorAndTextColor: function()
    {
      var font1 = new qx.bom.Font();
      font1.setColor("#FF0000");

      var label1 = new qx.ui.basic.Label("test 1");
      label1.setTextColor("#00FF00");
      label1.setFont(font1);

      this.getRoot().add(label1);
      this.flush();

      this.assertEquals("#00FF00", label1.getContentElement().getStyle("color"), "Color property should have more priority than font color.");

      label1.destroy();
      font1.dispose();
    },

    testBudy : function() {
      var label = new qx.ui.basic.Label();
      var textfield1 = new qx.ui.form.TextField();
      var textfield2 = new qx.ui.form.TextField();

      // set first text field as buddy
      label.setBuddy(textfield1);

      // label and textfield1 must have the same binding
      this.assertEquals(1, label.getBindings().length, "There must be one binding!");
      this.assertEquals(1, textfield1.getBindings().length, "There must be one binding!");
      this.assertTrue(qx.lang.Array.equals(label.getBindings()[0], textfield1.getBindings()[0]), "label and textfield1 must have the same binding");

      // change the buddy of label to textfield2
      label.setBuddy(textfield2);

      // textfield1 must not have a binding anymore
      this.assertEquals(0, textfield1.getBindings().length, "There is still a binding!");

      // label and textfield2 must have the same binding
      this.assertEquals(1, label.getBindings().length, "There must be one binding!");
      this.assertEquals(1, textfield2.getBindings().length, "There must be one binding!");
      this.assertTrue(qx.lang.Array.equals(label.getBindings()[0], textfield2.getBindings()[0]), "label and textfield1 must have the same binding");

      label.dispose();
    },

    testLocaleInitialization : function() {
      var label = new qx.ui.basic.Label();
      var localeManager = qx.locale.Manager.getInstance();
      localeManager.addTranslation("en", {"TEST" : "EN"});
      localeManager.addTranslation("de", {"TEST" : "DE"});
      localeManager.setLocale("en");

      var test = qx.locale.Manager.tr("TEST");
      localeManager.setLocale("de");
      label.setValue(test);

      this.assertEquals("DE", label.getContentElement().getValue(), "label must have the current locale set");
    }
  }
});
