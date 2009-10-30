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
#require qx.locale.data.fr_FR
*/

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

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());
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
    
    
    testYear : function() 
    {
      // case y
      var df = new qx.util.format.DateFormat("y");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();
      
      // case yy
      var df = new qx.util.format.DateFormat("yy");
      this.assertEquals("09", df.format(new Date(2009,10,30)));
      df.dispose();
      
      // case yyy
      var df = new qx.util.format.DateFormat("yyy");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();
      
      // case yyyy
      var df = new qx.util.format.DateFormat("yyyy");
      this.assertEquals("2009", df.format(new Date(2009,10,30)));
      df.dispose();
      
      // case yyyyy
      var df = new qx.util.format.DateFormat("yyyyy");
      this.assertEquals("02009", df.format(new Date(2009,10,30)));
      df.dispose();                        
    }
  }
});
