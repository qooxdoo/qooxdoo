/*
#require qx.locale.data.de_DE
*/

qx.Clazz.define("qxunit.test.util.NumberFormat", {
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
		}
	}
});