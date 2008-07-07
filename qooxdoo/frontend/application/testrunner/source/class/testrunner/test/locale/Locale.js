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

qx.Class.define("testrunner.test.locale.Locale",
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
        "one": "one",
        "two": "two",
        "Hello %1!": "Hello %1!",
        "Jony": "Jony",
        "One car": "One car",
        "%1 cars": "%1 cars"
      });
      manager.addTranslation("de_QX", {
        "one": "Eins",
        "two": "Zwei",
        "Hello %1!": "Servus %1!",
        "Jony": "Jonathan",
        "One car": "One car",
        "%1 cars": "%1 cars"
      });
      manager.setLocale("en_QX");

      this.assertEquals("en", manager.getLanguage());
      this.assertEquals("QX", manager.getTerritory());

      // simple case
      var one = this.tr("one");
      this.assertEquals("one", one);

      // format string
      var hello = this.tr("Hello %1!", "Fabian");
      this.assertEquals("Hello Fabian!", hello);

      // format string with translated arguments
      var hiJony = this.tr("Hello %1!", this.tr("Jony"));
      this.assertEquals("Hello Jony!", hiJony);

      // plural
      var car = this.trn("One car", "%1 cars", 0, 0);
      this.assertEquals("0 cars", car);

      var car = this.trn("One car", "%1 cars", 1);
      this.assertEquals("One car", car);

      var cars = this.trn("One car", "%1 cars", 5, 5);
      this.assertEquals("5 cars", cars);



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
      hiJony = hiJony.translate();
      this.assertEquals("Servus Jonathan!", hiJony);

      // plural
      car = car.translate();
      this.assertEquals("One car", car);

      cars = cars.translate();
      this.assertEquals("5 cars", cars);
    }

  }
});
