
qx.Clazz.define("qxunit.TestCase", {
	type: "abstract",
	extend: qx.core.Object,

	members: {
		
		assertJsonEquals: function() {
			if (arguments.length == 3) {
				assertEquals(
					arguments[0],
					qx.io.Json.stringify(arguments[1]),
					qx.io.Json.stringify(arguments[2])
				);
			} else {
				assertEquals(
					qx.io.Json.stringify(arguments[0]),
					qx.io.Json.stringify(arguments[1])
				);				
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
		assertDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assert.apply(this, arguments); },
			"off": function() {}
		}),
		assertTrueDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertTrue.apply(this, arguments); },
			"off": function() {}
		}),
		assertEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertHTMLEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertHTMLEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertEvaluatesToFalseDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertEvaluatesToFalse.apply(this, arguments); },
			"off": function() {}
		}),
		assertEvaluatesToTrueDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertEvaluatesToTrue.apply(this, arguments); },
			"off": function() {}
		}),
		assertArrayEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertArrayEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertObjectEqualsDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertObjectEquals.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotNaNDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertNotNaN.apply(this, arguments); },
			"off": function() {}
		}),
		assertNaNDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertNaN.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotUndefinedDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertNotUndefined.apply(this, arguments); },
			"off": function() {}
		}),
		assertUndefinedDebugOn:	qx.core.Variant.select("qx.debug", {
			"on": function() { assertUndefined.apply(this, arguments); },
			"off": function() {}
		}),
		assertNotNullDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertNotNull.apply(this, arguments); },
			"off": function() {}
		}),
		assertNullDebugOn: qx.core.Variant.select("qx.debug", {
			"on": function() { assertNull.apply(this, arguments); },
			"off": function() {}
		})
	}
});

