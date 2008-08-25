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

qx.Class.define("qx.test.locale.Date",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      qx.locale.Manager.getInstance().setLocale("C");
    },


    testDayNames : function()
    {
      var Date = qx.locale.Date;

      var abbrDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      this.assertJsonEquals(abbrDays, Date.getDayNames("abbreviated").map(function(v) {return v+"";}));
      for (var i=0; i<7; i++) {
        this.assertEquals(abbrDays[i], Date.getDayName("abbreviated", i));
      }

      var narrowDays = ["S","M","T","W","T","F","S"];
      this.assertJsonEquals(narrowDays, Date.getDayNames("narrow").map(function(v) {return v+""}));
      for (var i=0; i<7; i++) {
        this.assertEquals(narrowDays[i], Date.getDayName("narrow", i));
      }

      var wideDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      this.assertJsonEquals(wideDays, Date.getDayNames("wide").map(function(v) {return v+""}));

      for (var i=0; i<7; i++) {
        this.assertEquals(wideDays[i], Date.getDayName("wide", i));
      }

      // german
      qx.locale.Manager.getInstance().setLocale("de_DE");

      var abbrDays = ["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."];
      this.assertJsonEquals(abbrDays, Date.getDayNames("abbreviated").map(function(v) {return v+"";}));
      for (var i=0; i<7; i++) {
        this.assertEquals(abbrDays[i], Date.getDayName("abbreviated", i));
      }

      var narrowDays = ["S","M","D","M","D","F","S"];
      this.assertJsonEquals(narrowDays, Date.getDayNames("narrow").map(function(v) {return v+""}));
      for (var i=0; i<7; i++) {
        this.assertEquals(narrowDays[i], Date.getDayName("narrow", i));
      }

      var wideDays = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
      this.assertJsonEquals(wideDays, Date.getDayNames("wide").map(function(v) {return v+""}));

      for (var i=0; i<7; i++) {
        this.assertEquals(wideDays[i], Date.getDayName("wide", i));
      }

      if (this.isDebugOn())
      {
        this.assertException(function() {
          Date.getDayNames("verylong");
        }, Error);

        this.assertException(function() {
          Date.getDayName("wide", -1);
        }, Error);

        this.assertException(function() {
          Date.getDayName("wide", 8);
        }, Error);
      }

    },

    testDateFormat : function()
    {
      var Date = qx.locale.Date;

      this.assertEquals("AM", Date.getAmMarker("C"));
      this.assertEquals("PM", Date.getPmMarker("C"));


    }

  }
});
