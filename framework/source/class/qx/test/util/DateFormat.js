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

  // result contain an object with what should be expected, the result to test the date against
  __dates : [
    {'date' : new Date(2006, 2, 14), 'result' : {}},
    {'date' : new Date(2007, 3, 14), 'result' : {}},
    {'date' : new Date(2009, 10, 30), 'result' : {}},
    {'date' : new Date(2009, 8 ,30), 'result' : {}},
    {'date' : new Date(2011, 3, 15), 'result' : {}},
    {'date' : new Date(2011, 3, 16), 'result' : {}},
    {'date' : new Date(2011, 3, 17), 'result' : {}},
    {'date' : new Date(2011, 0, 26), 'result' : {'weekOfYear' : 4}},
    {'date' : new Date(2011, 0, 1), 'result' : {'weekOfYear' : 52}},
    {'date' : new Date(2011, 0, 3), 'result' : {'weekOfYear' : 1}},
    {'date' : new Date(2011, 0, 10), 'result' : {'weekOfYear' : 2}},
    {'date' : new Date(2011, 9, 3), 'result' : {'dayOfYear' : 276, 'era': {'abbrev': 'AD', 'fullName': 'Anno Domini', 'narrow': 'A'}}},
    {'date' : new Date(2011,0,4), 'result' : {'dayOfYear' : 4, 'dayOfWeek': 2}},
    {'date' : new Date(2011,0,4), 'result' : {'dayOfYear' : 4, 'dayOfWeek': 2}},
    {'date' : new Date(2011,0,4,9,9,9), 'result' : {'h_hour': 9, 'K_hour': 9, 'H_hour': 9, 'k_hour': 9}},
    {'date' : new Date(2011,0,4,14,9,9), 'result' : {'h_hour': 2, 'K_hour': 2, 'H_hour': 14, 'k_hour': 14}},
    {'date' : new Date(2011,0,4,0,9,9), 'result' : {'h_hour': 12, 'K_hour': 0, 'H_hour': 0, 'k_hour': 24}},
    {'date' : new Date(2011,0,4,12,9,9), 'result' : {'h_hour': 12, 'K_hour': 0, 'H_hour': 12, 'k_hour': 12}},
    {'date' : new Date(2010,12,4,0,0,0), 'result' : {'h_hour': 12, 'K_hour': 0, 'H_hour': 0, 'k_hour': 24}},
    {'date' : new Date(-20,10,14), 'result' : {'era': {'abbrev': 'BC', 'fullName': 'Before Christ', 'narrow': 'B'}}},
    {'date' : new Date(2012, 4, 24, 11, 49, 57, 1), 'result' : {}},
    {'date' : new Date(2012, 4, 24, 11, 49, 57, 12), 'result' : {}},
    {'date' : new Date(2012, 4, 24, 11, 49, 57, 123), 'result' : {}}

  ],

    __fillNumber : function(number, minSize)
    {
      var str = "" + number;

      while (str.length < minSize) {
        str = "0" + str;
      }

      return str;
    },

    __getExpectedYear : function(absYear,formattedSize,yearsign)
    {
      var expectedYear = absYear + "";
        if(expectedYear.length<formattedSize) {
          for(var j=expectedYear.length;j<formattedSize;j++) {
            expectedYear = "0" + expectedYear;
          }
        }
        return yearsign === "-" ? (yearsign + expectedYear) : expectedYear;
    },

    _testDateParse : function(date, formatString, locale)
    {
      var dateFmt = new qx.util.format.DateFormat(formatString, locale);
      var dateStr = dateFmt.format(date);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getFullYear(), parsedDate.getFullYear());
      this.assertEquals(date.getMonth(), parsedDate.getMonth());
      this.assertEquals(date.getDate(), parsedDate.getDate());
      this.assertEquals(date.getDay(), parsedDate.getDay());

      if (formatString.indexOf(":") > 0) {
        this.assertEquals(date.getHours(), parsedDate.getHours());
        this.assertEquals(date.getMinutes(), parsedDate.getMinutes());
      }

      dateFmt.dispose();
    },

    /**
     * TODOC
     *
     * @return {void}
     */
    testDateParse : function()
    {
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        this._testDateParse(date, "EEEE dd. MMM yyyy", "de_DE");
        this._testDateParse(date, "yyyyMMdd", "en_US");
        this._testDateParse(date, "ddMMyyyyy", "en_US");
        this._testDateParse(date, "yyyyyyyyyddMM", "de_DE");
        this._testDateParse(date, "yyMMdd", "en_US");
        this._testDateParse(date, "yMMdd", "de_DE");
        this._testDateParse(date, "yyyMMdd", "en_US");
        this._testDateParse(date, "EEE dd. MM yyyy", "de_DE");
        this._testDateParse(date, "EE dd. M yyyy", "de_DE");
        this._testDateParse(date, "EEEE dd. MMM yyyy", "fr_FR");
        this._testDateParse(date, "MMM d, y h:mm a", "en_US");
        this._testDateParse(date, "MMM d, y KK:mm a", "en_US");
        this._testDateParse(date, "YYYY/MM/dd", "en_US");
      }

    },

    testInvalidDate : function()
    {
      var invalidDate = new Date("2011-11-32");
      var dateFmt = new qx.util.format.DateFormat();
      this.assertNull(dateFmt.format(invalidDate));
      dateFmt.dispose();
    },

    testTimeZone : function()
    {
      var date = new qx.test.util.DateMock({timezoneOffset: -60, time: 1316000836451});

      var formatStr = "z";
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");

      this.assertEquals("GMT+01:00", dateFmt.format(date));
      date.dispose();

      date = new qx.test.util.DateMock({timezoneOffset: 60, time: 1316000836451});
      this.assertEquals("GMT-01:00", dateFmt.format(date));
      date.dispose();

      date = new qx.test.util.DateMock({timezoneOffset: -90, time: 1316000836451});
      this.assertEquals("GMT+01:30", dateFmt.format(date));
      date.dispose();

      date = new qx.test.util.DateMock({timezoneOffset: 90, time: 1316000836451});
      this.assertEquals("GMT-01:30", dateFmt.format(date));
      date.dispose();

      dateFmt.dispose();
    },

    testLocalizedDates : function()
    {
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;

        var formatStr = qx.locale.Date.getDateFormat("short", "fr_FR");
        this._testDateParse(date, formatStr, "fr_FR");

        formatStr = qx.locale.Date.getDateFormat("medium", "fr_FR");
        this._testDateParse(date, formatStr, "fr_FR");

        formatStr = qx.locale.Date.getDateFormat("long", "fr_FR");
        this._testDateParse(date, formatStr, "fr_FR");

        formatStr = qx.locale.Date.getDateFormat("full", "fr_FR");
        this._testDateParse(date, formatStr, "fr_FR");

        formatStr = qx.locale.Date.getDateFormat("short", "de_DE");
        this._testDateParse(date, formatStr, "de_DE");

        var formatStr = qx.locale.Date.getDateFormat("medium", "de_DE");
        this._testDateParse(date, formatStr, "de_DE");

        var formatStr = qx.locale.Date.getDateFormat("long", "de_DE");
        this._testDateParse(date, formatStr, "de_DE");

        var formatStr = qx.locale.Date.getDateFormat("full", "de_DE");
        this._testDateParse(date, formatStr, "de_DE");
      }
    },

    testPattern_y_ : function(){
      var df;

      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var yearsign = date.getFullYear() > 0 ? '+' : '-';
        var absYear = "" + Math.abs(date.getFullYear());
        var fullYear = date.getFullYear()+'';
        var lastTwoDigitsYear = fullYear.substring(absYear.length-2);

        df = new qx.util.format.DateFormat("yyyy");
        var expectedYear = this.__getExpectedYear(absYear,4,yearsign);
        this.assertEquals(expectedYear, df.format(date));
        var parsedDate = df.parse(df.format(date));
        this.assertEquals(date.getFullYear(), parsedDate.getFullYear());
        df.dispose();

        // case y
        df = new qx.util.format.DateFormat("y");
        this.assertEquals(fullYear, df.format(date));
        df.dispose();

        // case yy
        df = new qx.util.format.DateFormat("yy");
        this.assertEquals(lastTwoDigitsYear, df.format(date));
        df.dispose();

        // case yyy
        df = new qx.util.format.DateFormat("yyy");
        var expectedYear = this.__getExpectedYear(absYear,3,yearsign);
        this.assertEquals(expectedYear, df.format(date));
        df.dispose();

        // case yyyy
        df = new qx.util.format.DateFormat("yyyy");
        var expectedYear = this.__getExpectedYear(absYear,4,yearsign);
        this.assertEquals(expectedYear, df.format(date));
        df.dispose();

        // case yyyyy
        df = new qx.util.format.DateFormat("yyyyy");
        var expectedYear = this.__getExpectedYear(absYear,5,yearsign);
        this.assertEquals(expectedYear, df.format(date));
        df.dispose();

        // case yyyyy
        df = new qx.util.format.DateFormat("yyyyyyyyyyy");
        var expectedYear = this.__getExpectedYear(absYear,11,yearsign);
        this.assertEquals(expectedYear, df.format(date));
        df.dispose();
      }
    },

    testPattern_M_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var absYear = "" + Math.abs(date.getFullYear());
        var yearsign = date.getFullYear() > 0 ? '+' : '-';
        var expectedYear = this.__getExpectedYear(absYear,4,yearsign);
        var month = date.getMonth();
        var realMonth = (month + 1) + "";

        df = new qx.util.format.DateFormat("yyyy/MM");
        this.assertEquals(expectedYear + "/" + this.__fillNumber(realMonth,2), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("yyyy/M");
        this.assertEquals(expectedYear + "/" + realMonth, df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("yyyy/MMM");
        this.assertEquals(expectedYear + "/" + qx.locale.Date.getMonthName("abbreviated", month , locale, "format", true), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("yyyy/MMMM");
        this.assertEquals(expectedYear + "/" + qx.locale.Date.getMonthName("wide", month, locale, "format", true), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("yyyy/MMMMM");
        this.assertEquals(expectedYear + "/" + qx.locale.Date.getMonthName("narrow", month, locale, "format", true), df.format(date));
        df.dispose();
      }

    },

    testPattern_L_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var month = date.getMonth();
        var realMonth = (month + 1) + "";

        df = new qx.util.format.DateFormat("LL");
        this.assertEquals(this.__fillNumber(realMonth,2), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("L");
        this.assertEquals(realMonth, df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("LLL");
        this.assertEquals(qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("LLLL");
        this.assertEquals(qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true), df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("LLLLL");
        this.assertEquals(qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true), df.format(date));
        df.dispose();
      }
    },

    testPattern_w_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.weekOfYear)
        {
          var date = this.__dates[i].date;
          var weekOfYear = this.__dates[i].result.weekOfYear + "";

          df = new qx.util.format.DateFormat("w");
          this.assertEquals(weekOfYear, df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("ww");
          this.assertEquals(this.__fillNumber(weekOfYear,2), df.format(date));
          df.dispose();
        }
      }
    },

    testPattern_d_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var dayOfMonth = date.getDate();

        df = new qx.util.format.DateFormat("d");
        this.assertEquals(dayOfMonth + "", df.format(date));
        df.dispose();
        df = new qx.util.format.DateFormat("dd");
        this.assertEquals(this.__fillNumber(dayOfMonth,2), df.format(date));
        df.dispose();
      }

    },

    testPattern_D_ : function(){
      var df, dateStr;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        if(this.__dates[i].result.dayOfYear)
        {
          var dayOfYear = this.__dates[i].result.dayOfYear + "";

          df = new qx.util.format.DateFormat("D");
          this.assertEquals(dayOfYear, df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("DD");
          this.assertEquals(this.__fillNumber(dayOfYear,2), df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("DDD");
          this.assertEquals(this.__fillNumber(dayOfYear,3), df.format(date));
          df.dispose();
        }

        var dateFmt = new qx.util.format.DateFormat("MM / yyy / DDD");
        dateStr = dateFmt.format(date);

        var parsedDate = dateFmt.parse(dateStr);
        this.assertEquals(date.getFullYear(), parsedDate.getFullYear());
        this.assertEquals(date.getMonth(), parsedDate.getMonth());
        this.assertEquals(date.getDate(), parsedDate.getDate());
        this.assertEquals(date.getDay(), parsedDate.getDay());
        dateFmt.dispose();
      }

    },

    testPattern_E_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();

      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.dayOfWeek)
        {
          var date = this.__dates[i].date;
          var fullYear = "" + date.getFullYear();
          var dayOfWeek = this.__dates[i].result.dayOfWeek;

          df = new qx.util.format.DateFormat("yyyy/E");
          this.assertEquals(fullYear + "/" + qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true), df.format(date));
          df.dispose();
          df = new qx.util.format.DateFormat("yyyy/EE");
          this.assertEquals(fullYear + "/" + qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true), df.format(date));
          df.dispose();
          df = new qx.util.format.DateFormat("yyyy/EEE");
          this.assertEquals(fullYear + "/" + qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true), df.format(date));
          df.dispose();
          df = new qx.util.format.DateFormat("yyyy/EEEE");
          this.assertEquals(fullYear + "/" + qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true), df.format(date));
          df.dispose();
          df = new qx.util.format.DateFormat("yyyy/EEEEE");
          this.assertEquals(fullYear + "/" + qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true), df.format(date));
          df.dispose();
        }
      }

    },

    testPattern_c_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();
      var locales = [locale,"en_US","ro_RO","de_DE","fr_FR"];
      for(var k=0; k<locales.length; k++)
      {
        qx.locale.Manager.getInstance().setLocale(locales[k]);
        for(var i=0; i<this.__dates.length; i++)
        {
          var date = this.__dates[i].date;
          var dayOfWeek = date.getDay();
          var startOfWeek = qx.locale.Date.getWeekStart(locales[k]);
          var expectedDayOfWeek = 1+ ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));

          df = new qx.util.format.DateFormat("c",locales[k]);
          this.assertEquals(expectedDayOfWeek + "", df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("ccc",locales[k]);
          this.assertEquals(qx.locale.Date.getDayName("abbreviated", dayOfWeek, locales[k], "stand-alone", true), df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("cccc",locales[k]);
          this.assertEquals(qx.locale.Date.getDayName("wide", dayOfWeek, locales[k], "stand-alone", true), df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("ccccc",locales[k]);
          this.assertEquals(qx.locale.Date.getDayName("narrow", dayOfWeek, locales[k], "stand-alone", true), df.format(date));
          df.dispose();
        }
      }
      qx.locale.Manager.getInstance().setLocale(locale);
    },

    testPattern_e_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var dayOfWeek = date.getDay();
        var startOfWeek = qx.locale.Date.getWeekStart(locale);
        var expectedDayOfWeek = 1 + ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));

        df = new qx.util.format.DateFormat("e");
        this.assertEquals(expectedDayOfWeek + "", df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("ee");
        this.assertEquals("0" + expectedDayOfWeek, df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("eee");
        this.assertEquals(qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true), df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("eeee");
        this.assertEquals(qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true), df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("eeeee");
        this.assertEquals(qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true), df.format(date));
        df.dispose();
      }
    },

    testPattern_e_parse : function(){
      var df, parsedDate;
      var locale = qx.locale.Manager.getInstance().getLocale();
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var dayOfWeek = date.getDay();

        df = new qx.util.format.DateFormat("e-yyyy-MM-dd");
        parsedDate = df.parse(df.format(date));
        this.assertEquals(dayOfWeek,parsedDate.getDay());
        df.dispose();

        df = new qx.util.format.DateFormat("ee-yyyy-MM-dd");
        parsedDate = df.parse(df.format(date));
        this.assertEquals(dayOfWeek,parsedDate.getDay());
        df.dispose();

        df = new qx.util.format.DateFormat("eee-yyyy-MM-dd");
        parsedDate = df.parse(df.format(date));
        this.assertEquals(dayOfWeek,parsedDate.getDay());
        df.dispose();

        df = new qx.util.format.DateFormat("eeee-yyyy-MM-dd");
        parsedDate = df.parse(df.format(date));
        this.assertEquals(dayOfWeek,parsedDate.getDay());
        df.dispose();

        df = new qx.util.format.DateFormat("eeeee-yyyy-MM-dd");
        parsedDate = df.parse(df.format(date));
        this.assertEquals(dayOfWeek,parsedDate.getDay());
        df.dispose();
      }
    },

    testPattern_a_ : function(){
      var df;
      var locale = qx.locale.Manager.getInstance().getLocale();
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var hour = date.getHours();
        df = new qx.util.format.DateFormat("a",locale);
        this.assertEquals(hour < 12 ? qx.locale.Date.getAmMarker(locale).toString() : qx.locale.Date.getPmMarker(locale).toString(), df.format(date));
        df.dispose();
      }

    },

    testPattern_h_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.h_hour)
        {
          var date = this.__dates[i].date;
          var hour = this.__dates[i].result.h_hour;

          df = new qx.util.format.DateFormat("h");
          this.assertEquals(hour + "", df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("hh");
          this.assertEquals(this.__fillNumber(hour,2), df.format(date));
          df.dispose();
        }
      }

    },

    testPattern_H_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.H_hour)
        {
          var date = this.__dates[i].date;
          var hour = this.__dates[i].result.H_hour;

          df = new qx.util.format.DateFormat("H");
          this.assertEquals(hour + "", df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("HH");
          this.assertEquals(this.__fillNumber(hour,2), df.format(date));
          df.dispose();
        }
      }

    },

    testPattern_k_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.k_hour)
        {
          var date = this.__dates[i].date;
          var hour = this.__dates[i].result.k_hour;

          df = new qx.util.format.DateFormat("k");
          this.assertEquals(hour + "", df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("kk");
          this.assertEquals(this.__fillNumber(hour,2), df.format(date));
          df.dispose();
        }
      }

    },

    testPattern_K_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.K_hour)
        {
          var date = this.__dates[i].date;
          var hour = this.__dates[i].result.K_hour;

          df = new qx.util.format.DateFormat("K");
          this.assertEquals(hour + "", df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("KK");
          this.assertEquals(this.__fillNumber(hour,2), df.format(date));
          df.dispose();
        }
      }

    },

    testPattern_m_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var min = date.getMinutes();

        df = new qx.util.format.DateFormat("m");
        this.assertEquals(min + "", df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("mm");
        this.assertEquals(this.__fillNumber(min,2), df.format(date));
        df.dispose();
      }

    },

    testPattern_s_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        var sec = date.getSeconds();

        df = new qx.util.format.DateFormat("s");
        this.assertEquals(sec + "", df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("ss");
        this.assertEquals(this.__fillNumber(sec,2), df.format(date));
        df.dispose();
      }

    },

    testPattern_S_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        // pad milliseconds to become a fraction of second
        var msec = this.__fillNumber(date.getMilliseconds(), 3);

        df = new qx.util.format.DateFormat("S");
        this.assertEquals(msec.substring(0,1), df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("SS");
        this.assertEquals(msec.substring(0,2), df.format(date));
        df.dispose();

        df = new qx.util.format.DateFormat("SSS");
        this.assertEquals(msec.substring(0,3), df.format(date));
        df.dispose();

        // check that remaining format specification is padded with zeros
        df = new qx.util.format.DateFormat("SSSS");
        this.assertEquals(msec.substring(0, 3) + "0", df.format(date));
        df.dispose();
      }

    },

    // z and Z can be tested when knowing the timezoneoffset of the machines the test will run on
    // here it is EET

    testPattern_z_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;

        var timezoneOffset = date.getTimezoneOffset();
        var timezoneSign = timezoneOffset > 0 ? 1 : -1;
        var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
        var timezoneMinutes = Math.abs(timezoneOffset) % 60;

        var localTimeZone = "GMT" + ((timezoneSign > 0) ? "-" : "+") + this.__fillNumber(Math.abs(timezoneHours),2) + ":" + this.__fillNumber(timezoneMinutes, 2);

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

    },


    testPattern_G_ : function(){
      var df;
      for(var i=0; i<this.__dates.length; i++)
      {
        if(this.__dates[i].result.era)
        {
          var date = this.__dates[i].date;
          var era = this.__dates[i].result.era;

          df = new qx.util.format.DateFormat("G");
          this.assertEquals(era.abbrev, df.format(date));
          df.dispose();

          df = new qx.util.format.DateFormat("yyyy MM dd G");
          var dateFormatted = df.format(date);
          var parsedDate = df.parse(dateFormatted);
          this.assertEquals(date.getFullYear(), parsedDate.getFullYear());
          this.assertEquals(date.getMonth(), parsedDate.getMonth());
          this.assertEquals(date.getDate(), parsedDate.getDate());
          this.assertEquals(date.getDay(), parsedDate.getDay());
          df.dispose();
        }
    }

  },

  _testIsoMasks : function(date, isoFormat, dateFormat)
  {
    var isodf = new qx.util.format.DateFormat(isoFormat);
    var df = new qx.util.format.DateFormat(dateFormat);
    var isoDateFormatted = isodf.format(date);
    var dateFormatted = df.format(date);
    this.assertEquals(isoDateFormatted,dateFormatted);
    this.assertEquals(isodf.parse(isoDateFormatted).getTime(),df.parse(dateFormatted).getTime());
    isodf.dispose();
    df.dispose();
  },

  testIsoMasks : function()
  {
      for(var i=0; i<this.__dates.length; i++)
      {
        var date = this.__dates[i].date;
        this._testIsoMasks(date, 'isoDate', 'yyyy-MM-dd');
        this._testIsoMasks(date, 'isoTime', 'HH:mm:ss');
        this._testIsoMasks(date, 'isoDateTime', "yyyy-MM-dd'T'HH:mm:ss");

//        var isodf = new qx.util.format.DateFormat('isoUtcDateTime');
//        var df = new qx.util.format.DateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
//        var isoDateFormatted = isodf.format(date);
//        var dateFormatted = df.format(date);
//        this.assertEquals(isodf.parse(isoDateFormatted).getTime(),df.parse(dateFormatted).getTime());
      }
  },

  testChangingLocales : function()
  {
    var manager = qx.locale.Manager.getInstance();
    manager.setLocale('en_US');

    var df = new qx.util.format.DateFormat("EEEE yyyy-mm-dd");
    var dfFR = new qx.util.format.DateFormat("EEEE yyyy-mm-dd","fr_FR");
    var dfDE = new qx.util.format.DateFormat("EEEE yyyy-mm-dd","de_DE");
    var dfUS = new qx.util.format.DateFormat("EEEE yyyy-mm-dd","en_US");
    var d = new Date();

    var frenchFormatteddateString = dfFR.format(d);

    this.assertEquals(df.format(d),dfUS.format(d));

    manager.setLocale('fr_FR');
    this.assertEquals(df.format(d),dfFR.format(d));
    manager.setLocale('de_DE');
    this.assertEquals(df.format(d),dfDE.format(d));

    manager.resetLocale();
    this.assertEquals(df.format(d),dfUS.format(d));

    manager.setLocale('fr_FR');
    this.assertEquals(df.format(d),dfFR.format(d));

    df.resetLocale();
    this.assertEquals(df.format(d),dfUS.format(d));

    dfFR.setLocale('de_DE');
    this.assertEquals(dfFR.format(d),dfDE.format(d));

    dfFR.resetLocale();

    df.dispose();
    dfFR.dispose();
    dfDE.dispose();
    dfUS.dispose();

  }

  }
});
