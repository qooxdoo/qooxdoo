/*
#require qx.locale.data.de_DE
*/

qx.Class.define("qxunit.test.util.NumberFormat", {
  extend: qxunit.TestCase,

  members : {
    testNumberFormat: function() {
        this.assertNotUndefined(qx.util.format.NumberFormat);

        qx.locale.Manager.getInstance().setLocale("de_DE");

        var nf = qx.util.format.NumberFormat.getInstance();

        // this failed due to a rounding error
        this.assertEquals("1.000.000", nf.format(1000000));

        this.assertEquals("-1.000.000", nf.format(-1000000));
        this.assertEquals("0", nf.format(0));
        this.assertEquals("0", nf.format(-0));

        this.assertEquals("12,12", nf.format(12.12));
        
        var ninfinity = -1/0;
        this.assertEquals("-Infinity", nf.format(ninfinity));

        var infinity = 1/0;
        this.assertEquals("Infinity", nf.format(infinity));
        
        var nan = Math.sqrt(-1);
        this.assertEquals("NaN", nf.format(nan));
        
    }
  }
});