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

qx.Class.define("qx.test.util.DateFormat",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    testDateParse : function()
    {
      var date = new Date(2006, 2, 14);

      var formatStr = "EEEE dd. MMM yyyy";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "yyyyMMdd";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "ddMMyyyyy";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "yyyyyyyyyddMM";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "yyMMdd";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "yMMdd";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "yyyMMdd";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EEE dd. MM yyyy";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EE dd. M yyyy";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EEEE dd. MMM yyyy";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);

      var formatStr = "MMM d, y h:mm a";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      // This will be enabled when YYYY will be supported
      //var formatStr = "YYYY/MM/dd";
      //var dateFmt = new qx.util.format.DateFormat(formatStr, "en_US");
      //dateStr = dateFmt.format(date);

      //var parsedDate = dateFmt.parse(dateStr);
      //this.assertEquals(date.getTime(), parsedDate.getTime());

    },


    testTimeZone : function()
    {
      var date = new qx.test.util.DateMock({timezoneOffset: -60});

      var formatStr = "z";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");

      this.assertEquals("GMT+1:00", dateFmt.format(date));

      var date = new qx.test.util.DateMock({timezoneOffset: 60});
      this.assertEquals("GMT-1:00", dateFmt.format(date));

      var date = new qx.test.util.DateMock({timezoneOffset: -90});
      this.assertEquals("GMT+1:30", dateFmt.format(date));

      var date = new qx.test.util.DateMock({timezoneOffset: 90});
      this.assertEquals("GMT-1:30", dateFmt.format(date));
    },


    testLocalizedDates : function()
    {
      var date = new Date(2006, 2, 14);

      var formatStr = qx.locale.Date.getDateFormat("medium", "fr_FR");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var date = new Date(2007, 3, 14);

      var formatStr = qx.locale.Date.getDateFormat("short", "fr_FR");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("medium", "fr_FR");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("long", "fr_FR");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("full", "fr_FR");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("short", "de_DE");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("medium", "de_DE");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("long", "de_DE");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("full", "de_DE");
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());
    },

    testPattern_y_ : function(){
      var df;
      var date = new Date(2009,10,30);
      df = new qx.util.format.DateFormat("yyyy");
      this.assertEquals("2009", df.format(date));
      var parsedDate = df.parse("2009");
      this.assertEquals(date.getFullYear(), parsedDate.getFullYear());

      // case y
      df = new qx.util.format.DateFormat("y");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();

      // case yy
      df = new qx.util.format.DateFormat("yy");
      this.assertEquals("09", df.format(new Date(2009,10,30)));
      df.dispose();

      // case yyy
      df = new qx.util.format.DateFormat("yyy");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();

      // case yyyy
      df = new qx.util.format.DateFormat("yyyy");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();

      // case yyyyy
      df = new qx.util.format.DateFormat("yyyyy");
      this.assertEquals("02009", df.format(new Date(2009,10,30)));
      df.dispose();

      // case yyyyy
      df = new qx.util.format.DateFormat("yyyyyyyyyyy");
      this.assertEquals("00000002009", df.format(new Date(2009,10,30)));
      df.dispose();
    },

    testPattern_M_ : function(){
      var df;
      var date = new Date(2009,8,30);

      var locale = qx.locale.Manager.getInstance().getLocale();

      df = new qx.util.format.DateFormat("yyyy/MM");
      this.assertEquals("2009/09", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/M");
      this.assertEquals("2009/09", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/MMM");
      this.assertEquals("2009/"+qx.locale.Date.getMonthName("abbreviated", 8, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/MMMM");
      this.assertEquals("2009/"+qx.locale.Date.getMonthName("wide", 8, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/MMMMM");
      this.assertEquals("2009/"+qx.locale.Date.getMonthName("narrow", 8, locale, "stand-alone"), df.format(date));
      df.dispose();

    },

    testPattern_L_ : function(){
      var df;
      var date = new Date(2009,8,30);

      var locale = qx.locale.Manager.getInstance().getLocale();

      df = new qx.util.format.DateFormat("LL");
      this.assertEquals("09", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("L");
      this.assertEquals("09", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("LLL");
      this.assertEquals(qx.locale.Date.getMonthName("abbreviated", 8, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("LLLL");
      this.assertEquals(qx.locale.Date.getMonthName("wide", 8, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("LLLLL");
      this.assertEquals(qx.locale.Date.getMonthName("narrow", 8, locale, "stand-alone"), df.format(date));
      df.dispose();
    },

    testPattern_w_ : function(){
      var df;
      var date = new Date(2011,0,26);

      df = new qx.util.format.DateFormat("w");
      this.assertEquals("4", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("ww");
      this.assertEquals("4", df.format(date));
      df.dispose();

      date = new Date(2011,0,1);
      df = new qx.util.format.DateFormat("ww");
      this.assertEquals("52", df.format(date));
      df.dispose();
      date = new Date(2011,0,3);
      df = new qx.util.format.DateFormat("ww");
      this.assertEquals("1", df.format(date));
      df.dispose();
      date = new Date(2011,0,10);
      df = new qx.util.format.DateFormat("ww");
      this.assertEquals("2", df.format(date));
      df.dispose();
    },

    testPattern_d_ : function(){
      var df;
      var date = new Date(2011,0,3);

      df = new qx.util.format.DateFormat("d");
      this.assertEquals("3", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("dd");
      this.assertEquals("3", df.format(date));
      df.dispose();

    },

    testPattern_D_ : function(){
      var df;
      var date = new Date(2011,0,3);

      df = new qx.util.format.DateFormat("D");
      this.assertEquals("3", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("DD");
      this.assertEquals("3", df.format(date));
      df.dispose();

      df = new qx.util.format.DateFormat("DDD");
      this.assertEquals("3", df.format(date));
      df.dispose();

      date = new Date(2011,9,3);
      df = new qx.util.format.DateFormat("DDD");
      this.assertEquals("276", df.format(date));
      df.dispose();

    },

    testPattern_E_ : function(){
      var df;
      var date = new Date(2011,0,4);

      var locale = qx.locale.Manager.getInstance().getLocale();

      df = new qx.util.format.DateFormat("yyyy/E");
      this.assertEquals("2011/" + qx.locale.Date.getDayName("abbreviated", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/EE");
      this.assertEquals("2011/" + qx.locale.Date.getDayName("abbreviated", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/EEE");
      this.assertEquals("2011/" + qx.locale.Date.getDayName("abbreviated", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/EEEE");
      this.assertEquals("2011/" + qx.locale.Date.getDayName("wide", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("yyyy/EEEEE");
      this.assertEquals("2011/" + qx.locale.Date.getDayName("narrow", 2, locale, "stand-alone"), df.format(date));
      df.dispose();

    },

    testPattern_c_ : function(){
      var df;
      var date = new Date(2011,0,4);

      var locale = qx.locale.Manager.getInstance().getLocale();

      df = new qx.util.format.DateFormat("c");
      this.assertEquals("2", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("ccc");
      this.assertEquals(qx.locale.Date.getDayName("abbreviated", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("cccc");
      this.assertEquals(qx.locale.Date.getDayName("wide", 2, locale, "format"), df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("ccccc");
      this.assertEquals(qx.locale.Date.getDayName("narrow", 2, locale, "stand-alone"), df.format(date));
      df.dispose();

    },

    testPattern_a_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("a");
      this.assertEquals("AM", df.format(date));
      df.dispose();
      date = new Date(2011,0,4,14,9,9);
      df = new qx.util.format.DateFormat("a");
      this.assertEquals("PM", df.format(date));
      df.dispose();

    },

    testPattern_h_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("h");
      this.assertEquals("9", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("hh");
      this.assertEquals("9", df.format(date));
      df.dispose();
      date = new Date(2011,0,4,14,9,9);
      df = new qx.util.format.DateFormat("h");
      this.assertEquals("2", df.format(date));
      df.dispose();

    },

    testPattern_H_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("H");
      this.assertEquals("9", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("HH");
      this.assertEquals("9", df.format(date));
      df.dispose();
      date = new Date(2011,0,4,14,9,9);
      df = new qx.util.format.DateFormat("H");
      this.assertEquals("14", df.format(date));
      df.dispose();

    },

    testPattern_k_ : function(){
      var df;
      var date = new Date(2011,0,4,0,9,9);

      df = new qx.util.format.DateFormat("k");
      this.assertEquals("24", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("kk");
      this.assertEquals("24", df.format(date));
      df.dispose();
      date = new Date(2011,0,4,14,9,9);
      df = new qx.util.format.DateFormat("k");
      this.assertEquals("14", df.format(date));
      df.dispose();

    },

    testPattern_K_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("K");
      this.assertEquals("9", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("KK");
      this.assertEquals("9", df.format(date));
      df.dispose();
      date = new Date(2011,0,4,14,9,9);
      df = new qx.util.format.DateFormat("K");
      this.assertEquals("2", df.format(date));
      df.dispose();

    },

    testPattern_m_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("m");
      this.assertEquals("9", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("mm");
      this.assertEquals("09", df.format(date));
      df.dispose();

    },

    testPattern_s_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9);

      df = new qx.util.format.DateFormat("s");
      this.assertEquals("9", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("ss");
      this.assertEquals("09", df.format(date));
      df.dispose();

    },

    testPattern_S_ : function(){
      var df;
      var date = new Date(2011,0,4,9,9,9,367);

      df = new qx.util.format.DateFormat("S");
      this.assertEquals("3", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("SS");
      this.assertEquals("36", df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("SSS");
      this.assertEquals("367", df.format(date));
      df.dispose();

    },

    // z and Z can be tested when knowing the timezoneoffset of the machines the test will run on
    // here it is EET

    testPattern_z_ : function(){
      var df;
      var date = new Date();

      var localTimeZone = (''+date).replace(/^[^\(]+/,'').replace('(','').replace(')','');
      
      df = new qx.util.format.DateFormat("z");
      this.assertEquals(localTimeZone, df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("zz");
      this.assertEquals(localTimeZone, df.format(date));
      df.dispose();
      df = new qx.util.format.DateFormat("zzz");
      this.assertEquals(localTimeZone, df.format(date));
      df.dispose();

    }

//    to be unCommented later when implemented
//
//    testPattern_G_ : function(){
//      var df;
//      df = new qx.util.format.DateFormat("G");
//      this.assertEquals("AD", df.format(new Date(2009,10,14)));
//      this.assertEquals("BC", df.format(new Date(-20,10,14)));
//
//      var date = new Date(-20,10,14);
//      df = new qx.util.format.DateFormat("yyyy MM dd G");
//      var dateFormatted = df.format(new Date(-20,10,14));
//      var parsedDate = df.parse(dateFormatted);
//      this.assertEquals(date.getTime(), parsedDate.getTime());
//    }
//
  }
});
