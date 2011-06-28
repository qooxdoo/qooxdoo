/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require qx.locale.data.de_DE
#require qx.locale.data.C
*/

qx.Class.define("qx.test.locale.Locale",
{
  extend : qx.dev.unit.TestCase,
  include : qx.locale.MTranslation,

  members :
  {
    __defaultLocale : null,
    __listenerId : null,

    setUp : function() {
      var manager = qx.locale.Manager.getInstance();
      this.__defaultLocale = manager.getLocale();
    },


    tearDown : function() {
      var manager = qx.locale.Manager.getInstance();
      manager.setLocale(this.__defaultLocale);
      if (this.__listenerId) {
        manager.removeListenerById(this.__listenerId);
      }
    },


    testTranslation : function()
    {
      this.assertNotUndefined(qx.locale.Manager);
      var manager = qx.locale.Manager.getInstance();

      // add dummy translations
      manager.addTranslation("en_QX", {
        "test one": "test one",
        "test two": "test two",
        "test Hello %1!": "test Hello %1!",
        "test Jonny": "test Jonny",
        "test One car": "test One car",
        "test %1 cars": "test %1 cars"
      });
      manager.addTranslation("de_QX", {
        "test one": "Eins",
        "test two": "Zwei",
        "test Hello %1!": "Servus %1!",
        "test Jonny": "Jonathan",
        "test One car": "Ein Auto",
        "test %1 cars": "%1 Autos"
      });
      manager.setLocale("en_QX");

      this.assertEquals("en", manager.getLanguage());
      this.assertEquals("QX", manager.getTerritory());

      // simple case
      var one = this.tr("test one");
      this.assertEquals("test one", one);

      // format string
      var hello = this.tr("test Hello %1!", "Fabian");
      this.assertEquals("test Hello Fabian!", hello);

      // format string with translated arguments
      var hiJonny = this.tr("test Hello %1!", this.tr("test Jonny"));
      this.assertEquals("test Hello test Jonny!", hiJonny);

      // plural
      var car = this.trn("test One car", "test %1 cars", 0, 0);
      this.assertEquals("test 0 cars", car);

      var car = this.trn("test One car", "test %1 cars", 1);
      this.assertEquals("test One car", car);

      var cars = this.trn("test One car", "test %1 cars", 5, 5);
      this.assertEquals("test 5 cars", cars);



      // check listener
      var fired = false;
      var evtLocale = "";
      this.__listenerId = manager.addListener("changeLocale", function(e) {
        fired = true;
        evtLocale = e.getData();
      });

      // change locale
      manager.setLocale("de_QX");
      this.assertTrue(fired);
      this.assertEquals("de_QX", evtLocale);


      // simple case
      one = one.translate();
      this.assertEquals("Eins", one);

      // format string
      hello = hello.translate();
      this.assertEquals("Servus Fabian!", hello);

      // format string with translated arguments
      hiJonny = hiJonny.translate();
      this.assertEquals("Servus Jonathan!", hiJonny);

      // plural
      car = car.translate();
      this.assertEquals("Ein Auto", car);

      cars = cars.translate();
      this.assertEquals("5 Autos", cars);
    },


    testInvalidMessage : function()
    {
      this.assertNotUndefined(qx.locale.Manager);
      var manager = qx.locale.Manager.getInstance();

      // add dummy translations
      manager.addTranslation("en_QX", {
        "test one": "one!",
        "test two": "two!"
      });
      manager.addTranslation("de_QX", {
        "test one": "Eins!",
        "test two": "Zwei!"
      });
      manager.setLocale("en_QX");

      var textField = new qx.ui.form.TextField();
      textField.setInvalidMessage(this.tr("test one"));
      textField.setRequiredInvalidMessage(this.tr("test two"));

      this.assertEquals("one!", textField.getInvalidMessage());
      this.assertEquals("two!", textField.getRequiredInvalidMessage());

      manager.setLocale("de_QX");

      this.assertEquals("Eins!", textField.getInvalidMessage());
      this.assertEquals("Zwei!", textField.getRequiredInvalidMessage());
      textField.dispose();
    },


    testMacCtrl : function()
    {
      // check if the translation is working
      this.assertEquals("Links", qx.locale.Key.getKeyName("short", "Left", "de_DE"));
      // is the localized version
      if (qx.core.Environment.get("os.name") == "osx") {
        // there is no strg on macs, onls ctrl
        this.assertEquals("Ctrl", qx.locale.Key.getKeyName("short", "Control", "de_DE"));
        this.assertEquals("Control", qx.locale.Key.getKeyName("full", "Control", "de_DE"));
      } else {
        this.assertEquals("Strg", qx.locale.Key.getKeyName("short", "Control", "de_DE"));
        this.assertEquals("Steuerung", qx.locale.Key.getKeyName("full", "Control", "de_DE"));
      }
    },

    testResetLocale : function()
    {
      var locale = qx.core.Environment.get("locale");
      var variant = qx.core.Environment.get("locale.variant");
      if (variant !== "") {
        locale += "_" + variant;
      }

      var manager = qx.locale.Manager.getInstance();
      var oldLocale = manager.getLocale();
      manager.addTranslation("en_QX", {
        "test one": "one!",
        "test two": "two!"
      });
      manager.setLocale("en_QX");

      // try the reset of the locale
      manager.resetLocale();
      this.assertEquals(null, manager.getLocale());

      // make sure we set the locale which was there before the test
      manager.setLocale(oldLocale);
    }

  }
});
