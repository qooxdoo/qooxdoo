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

qx.Class.define("testrunner.test.Locale",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testDateFormat : function()
    {
      this.assertNotUndefined(qx.locale.Date);
      var Date = qx.locale.Date;

      this.assertEquals("AM", Date.getAmMarker("C"));
      this.assertEquals("PM", Date.getPmMarker("C"));

      var abbrDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      this.assertJsonEquals(abbrDays, Date.getDayNames("abbreviated", "C"));
      for (var i=0; i<7; i++) {
        this.assertEquals(abbrDays[i], Date.getDayName("abbreviated", i, "C"));
      }

      var narrowDays = ["S","M","T","W","T","F","S"];
      this.assertJsonEquals(narrowDays, Date.getDayNames("narrow", "C"));
      for (var i=0; i<7; i++) {
        this.assertEquals(narrowDays[i], Date.getDayName("narrow", i, "C"));
      }

      var wideDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      this.assertJsonEquals(wideDays, Date.getDayNames("wide", "C"));

      for (var i=0; i<7; i++) {
        this.assertEquals(wideDays[i], Date.getDayName("wide", i, "C"));
      }

      this.assertExceptionDebugOn(function() {
        Date.getDayNames("verylong", "C");
      }, Error);

      this.assertExceptionDebugOn(function() {
        Date.getDayName("wide", -1, "C");
      }, Error);

      this.assertExceptionDebugOn(function() {
        Date.getDayName("wide", 8, "C");
      }, Error);





      //qx.locale.Manager.getInstance().setLocale("de_DE");

    }

  }
});
