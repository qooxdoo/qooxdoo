/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.util.NumberFormat",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __nf : null,
    __oldLocale : null,

    setUp : function() {
      this.assertNotUndefined(qx.util.format.NumberFormat);

      this.__oldLocale = qx.locale.Manager.getInstance().getLocale();
      qx.locale.Manager.getInstance().setLocale("de_DE");

      this.__nf = new qx.util.format.NumberFormat();
    },


    tearDown : function() {
      this.__nf.dispose();
      qx.locale.Manager.getInstance().setLocale(this.__oldLocale);
    },

    testNumberFormatConstructor: function() {
      var wrongArgs = [null, undefined, NaN, Infinity, 1, {}, [], true],
          correctArgs = ["de_DE"],
          nf, i, len;

      try {
        nf = new qx.util.format.NumberFormat();
      } catch (e) {
        this.fail("Failed on an empty arguments list");
      }
      try {
        nf.dispose();
      }
      catch(e) {
      }

      try {
        nf = new qx.util.format.NumberFormat("de_DE", true);
        this.fail("Did not fail on wrong arguments number");
      } catch (e) {

      }
      try {
        nf.dispose();
      }
      catch(e) {
      }

      for (i = 0, len= wrongArgs.length; i < len; i += 1) {
        try {
          nf = new qx.util.format.NumberFormat(wrongArgs[i]);
          this.fail("A wrong argument did not raise an error: " + wrongArgs[i]);
        } catch (e) {

        }
        try {
          nf.dispose();
        }
        catch(e) {
        }
      }

      for (i = 0, len= correctArgs.length; i < len; i += 1) {
        try {
          nf = new qx.util.format.NumberFormat(correctArgs[i]);
        } catch (e) {
          this.fail("A correct argument did raise an error: " + correctArgs[i]);
        }
        try {
          nf.dispose();
        }
        catch(e) {
        }
      }
    },

    testNumberFormat : function()
    {
      var nf = this.__nf;

      // this failed due to a rounding error
      this.assertEquals("1.000.000", nf.format(1000000));

      this.assertEquals("-1.000.000", nf.format(-1000000));
      this.assertEquals("-1.000.000", nf.format(-1000000));

      this.assertEquals("0", nf.format(0));
      this.assertEquals("0", nf.format(-0));

      this.assertEquals("12,12", nf.format(12.12));

      var ninfinity = -1 / 0;
      this.assertEquals("-Infinity", nf.format(ninfinity));

      var infinity = 1 / 0;
      this.assertEquals("Infinity", nf.format(infinity));

      var nan = Math.sqrt(-1);
      this.assertEquals("NaN", nf.format(nan));
    },

    testNumberParse : function()
    {
      var nf = this.__nf;

      var goodNumbers = {
        "1000" : 1000,
        "-0,02" : -0.02,
        "0,02" : 0.02,
        ",02" : 0.02,
        "-,02" : -0.02,
        "+,02" : 0.02,
        "-1.111.111,2" : -1111111.2,
        "-1.000.000" : -1000000,
        "+1.000,12" : 1000.12
      };

      for (var number in goodNumbers) {
        this.assertEquals(nf.parse(number), goodNumbers[number]);
      }

      var badNumberStrings = [
        "2hastalavista",
        "2.3.4.5.6",
        "12.10,10",
        "10,1,12"
      ];

      var badNumberStr;

      for (var i=0; i<badNumberStrings.length; i++)
      {
        badNumberStr = badNumberStrings[i];

        this.assertException(
          function() {
            nf.format(nf.parse(badNumberStr));
          },
          Error,
          "does not match the number format",
          "testing if parsing fails on string '" + badNumberStr + "'"
        );
      }

    },

    testLocaleSwitch : function()
    {
      var nf = this.__nf;
      nf.setMinimumFractionDigits(0);
      nf.setMaximumFractionDigits(2);

      var numberStr = "0.5";

      this.assertException(
        function() {
          nf.parse(numberStr);
        },
        Error,
        "does not match the number format",
        "testing if parsing fails on string '" + numberStr + "'"
      );

      qx.locale.Manager.getInstance().setLocale("en_US");

      this.assertEquals(0.5, nf.parse("0.5"),
        "parsing failed after locale change");
    },

    testNumberFormatChange : function()
    {
      var nf = this.__nf;
      nf.setPostfix(" %");

      var numberStr = "5 Percent";

      this.assertException(
        function() {
          nf.parse(numberStr);
        },
        Error,
        "does not match the number format",
        "testing if parsing fails on string '" + numberStr + "'"
      );

      nf.setPostfix(" Percent");
      this.assertEquals(5, nf.parse(numberStr),
        "parsing failed after number format change");
    },

    testParseWithPrefixOrPostfix : function()
    {
      var spinner = new qx.ui.form.Spinner();
      var prefix = "$ ";
      var postfix = " €";
      var numberFormat = new qx.util.format.NumberFormat("de").set({
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        prefix: prefix,
        postfix: postfix
      });

      spinner.setNumberFormat(numberFormat);
      spinner.getChildControl("textfield").setValue("$ 1,23 €");

      this.assertEquals(prefix + "1,23" + postfix, spinner.getChildControl("textfield").getValue());
      
      spinner.destroy();
      numberFormat.dispose();
    }
  }
});
