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
      manager.addListener("changeLocale", function(e) {
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
    }

  }
});
