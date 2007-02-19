
qx.Clazz.define("qxunit.TestCase", {
	type: "abstract",
	extend: qx.core.Object,

	members: {
		
		profile: function(msg) {
			this._msg = msg || "";
			this._start = new Date();
		},
		
		profileEnd: function() {
			var end = new Date();
			if (this._start) {
				// use jsunit logging 
				info(this._msg + ": " + (end - this._start) + "ms");
				//qx.log.Logger.ROOT_LOGGER.debug(this._msg + ": " + (end - this._start) + "ms");
			}
		},
		
		
		assertJsonEquals: function() {
			if (arguments.length == 3) {
				this.assertEquals(
					arguments[0],
					qx.io.Json.stringify(arguments[1]),
					qx.io.Json.stringify(arguments[2])
				);
			} else {
				this.assertEquals(
					qx.io.Json.stringify(arguments[0]),
					qx.io.Json.stringify(arguments[1])
				);				
			}
		},
		
		assertMatch: function(str, re, msg) {
			var msg = msg || "The String '"+str+"' does not match the regular expression '"+re.toString()+"'!"
			this.assertTrue(msg, str.search(re) >= 0 ? true : false);
		},
		
		assertException: function(callback, exception, re) {
			var exception = exception || Error;
			var error;
			try {
				callback();
			} catch (e) {
				error = e;
			}
			if (error == null) {
				fail("The function did not raise an exception!");
			}
			this.assertTrue("The raised exception does not have the expected type!", error instanceof exception);
			if (re) {
				this.assertMatch(error.toString(), re);
			}
		},
		
		// maggings to the JsUnit functions
		assert: function() { assert.apply(this, arguments); },
		assertTrue: function() { assertTrue.apply(this, arguments); },
		assertEquals: function() { assertEquals.apply(this, arguments); },
		assertHTMLEquals: function() { assertHTMLEquals.apply(this, arguments); },
		assertEvaluatesToFalse: function() { assertEvaluatesToFalse.apply(this, arguments); },
		assertEvaluatesToTrue: function() { assertEvaluatesToTrue.apply(this, arguments); },
		assertArrayEquals: function() { assertArrayEquals.apply(this, arguments); },
		assertObjectEquals: function() { assertObjectEquals.apply(this, arguments); },
		assertNotNaN: function() { assertNotNaN.apply(this, arguments); },
		assertNaN: function() { assertNaN.apply(this, arguments); },
		assertNotUndefined: function() { assertNotUndefined.apply(this, arguments); },
		assertUndefined: function() { assertUndefined.apply(this, arguments); },
		assertNotNull: function() { assertNotNull.apply(this, arguments); },
		assertNull: function() { assertNull.apply(this, arguments); },
		
		// assertions which are only evaluated if "qx.debug" if "on"
		assertJsonEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertJsonEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertMatchDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertMatch.apply(this, arguments); },
			"off": function() {}
		}),
		assertExceptionDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertException.apply(this, arguments); },
			"off": function() {}
		}),			
		assertDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assert.apply(this, arguments); },
			"off": function() {}
		}),
		assertTrueDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertTrue.apply(this, arguments); },
			"off": function() {}
		}),
		assertEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertHTMLEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertHTMLEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertEvaluatesToFalseDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertEvaluatesToFalse.apply(this, arguments); },
			"off": function() {}
		}),
		assertEvaluatesToTrueDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertEvaluatesToTrue.apply(this, arguments); },
			"off": function() {}
		}),
		assertArrayEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertArrayEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertObjectEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertObjectEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotNaNDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertNotNaN.apply(this, arguments); },
			"off": function() {}
		}),
		assertNaNDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertNaN.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotUndefinedDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertNotUndefined.apply(this, arguments); },
			"off": function() {}
		}),
		assertUndefinedDebugOn:	qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertUndefined.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotNullDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertNotNull.apply(this, arguments); },
			"off": function() {}
		}),
		assertNullDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { this.assertNull.apply(this, arguments); },
			"off": function() {}
		})
	},
	
	defer: function(statics, proto) {
		if (window.console) {
			proto.profile = console.profile;
			proto.profileEnd = console.profileEnd;
		}
	}
});

