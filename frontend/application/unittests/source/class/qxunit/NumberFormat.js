/*
#require qx.locale.data.de_DE
*/

qx.Clazz.define("qxunit.NumberFormat", { statics : {

  testNumberFormat: function() {
      assertNotUndefined(qx.util.format.NumberFormat);

      qx.locale.Manager.getInstance().setLocale("de_DE");

      var nf = qx.util.format.NumberFormat.getInstance();

      // this failed due to a rounding error
      assertEquals("1.000.000", nf.format(1000000));

      assertEquals("-1.000.000", nf.format(-1000000));
      assertEquals("0", nf.format(0));
      assertEquals("0", nf.format(-0));

      assertEquals("12,12", nf.format(12.12));
  }

}});