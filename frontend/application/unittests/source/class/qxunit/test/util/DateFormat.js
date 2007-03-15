/*
#require qx.locale.data.de_DE
#require qx.locale.data.fr_FR
*/

qx.Class.define("qxunit.test.util.DateFormat", {
  extend: qxunit.TestCase,

  members : {

    testDateParse: function() {
      var date = new Date(2006, 2, 14);

      var formatStr = "EEEE dd. MMM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr)
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime())


      var formatStr = "EEE dd. MM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr)
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime())


      var formatStr = "EE dd. M yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "de_DE");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr)
      this.debug(date + " " + parsedDate);
      this.assertEquals(date.getTime(), parsedDate.getTime())


      var formatStr = "EEEE dd. MMM yyyy";
      this.debug("Format string:" + formatStr.toString());
      var dateFmt = new qx.util.format.DateFormat(formatStr, "fr_FR");
      dateStr = dateFmt.format(date);
      this.debug("Formatted Date: " + dateStr);

      var parsedDate = dateFmt.parse(dateStr)
      this.assertEquals(date.getTime(), parsedDate.getTime())

    }

  }

});