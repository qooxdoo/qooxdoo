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

qx.Class.define("testrunner.test.util.DateFormat",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testDateParse : function()
    {
      var date = new Date(2006, 2, 14);

      var formatStr = "EEEE dd. MMM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EEE dd. MM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EE dd. M yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = "EEEE dd. MMM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("medium", "fr_FR");
      this.debug("Format string 'fr_FR' 'medium':" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var date = new Date(2007, 3, 14);
      this.debug('testing date format size on date ' + date);

      var formatStr = qx.locale.Date.getDateFormat("short", "fr_FR");
      this.debug("Format string 'fr_FR' 'short':" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("medium", "fr_FR");
      this.debug("Format string 'fr_FR' 'medium':" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("long", "fr_FR");
      this.debug("Format string: 'fr_FR' 'long'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("full", "fr_FR");
      this.debug("Format string: 'fr_FR' 'full'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("short", "de_DE");
      this.debug("Format string: 'de_DE' 'short'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("medium", "de_DE");
      this.debug("Format string: 'de_DE' 'medium'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("long", "de_DE");
      this.debug("Format string: 'de_DE' 'long'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());

      var formatStr = qx.locale.Date.getDateFormat("full", "de_DE");
      this.debug("Format string: 'de_DE' 'full'" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr);
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime());
    }
  }
});
