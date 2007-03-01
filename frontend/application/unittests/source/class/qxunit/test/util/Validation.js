

qx.Class.define("qxunit.test.util.Validation", {
	extend: qxunit.TestCase,
	
	members : {
		
		testUmlauts: function() {
			this.assertEquals("aouAOUs", qx.util.Normalization.umlautsShort("äöüÄÖÜß"));
	    	this.assertEquals("aeoeueAeOeUess", qx.util.Normalization.umlautsLong("äöüÄÖÜß"));
		}
		
	}
});