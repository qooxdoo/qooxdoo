
qx.Clazz.define("qxunit.test.Io",{ 
	extend: qxunit.TestCase,

	members : {
		
		testIO: function() {
			this.assertNotUndefined(qx.io);
		},

		testJson: function() {
			this.assertEquals('{"test":123}', qx.io.Json.stringify({test:123}, false));
		}

	}
});