
qx.Clazz.define("qxunit.Mixin", { statics : {
	
	testMixinBasic: function() {
		qx.Mixin.define("test.MMix1", {
			statics: {
				foo: function() { return "foo"; }
			},
			members: {
				bar: function() { return "bar"; }
			},
			properties: {
				color: { compat: true }
			}
		});

		qx.Mixin.define("test.MMix2", {
			members: {
				bar: function() { return "bar"; }
			}
		});

		qx.Clazz.define("test.Mix", {
			extend: Object,
			include: test.MMix1,
			construct: function() {}
		});
		assertEquals("foo", test.Mix.foo());
		assertEquals("bar", new test.Mix().bar());
		var mix = new test.Mix();
		mix.setColor("red");
		assertEquals("red", mix.getColor());		
		
		var error = false;
		try {
			qx.Clazz.define("test.Mix1", {
				extend: Object,
				include: [test.MMix1, test.MMix2],
				construct: function() {}
			});			
		} catch (e) {
			error = true;
		}
		assertTrue("MMix1 and MMix2 are incompatible.", error);

		var error = false;
		try {
			qx.Clazz.define("test.Mix2", {
				extend: Object,
				include: test.MMix1,
				construct: function() {},
				members: {
					bar: function() { return "bar"; }
				}
			});			
		} catch (e) {
			error = true;
		}
		assertTrue("Mix and MMix1 have incompatible members.", error);

		var error = false;
		try {
			qx.Clazz.define("test.Mix3", {
				extend: Object,
				include: test.MMix1,
				construct: function() {},
				statics: {
					foo: function() { return "foo"; }
				}
			});			
		} catch (e) {
			error = true;
		}
		assertTrue("Mix and MMix1 have incompatible statics.", error);

		var error = false;
		try {
			qx.Clazz.define("test.Mix4", {
				extend: Object,
				include: test.MMix1,
				construct: function() {},
				properties: {
					color: { compat: true }
				}
			});			
		} catch (e) {
			error = true;
		}
		assertTrue("Mix and MMix1 have incompatible properties.", error);

	},
	
	
	testInclude: function() {
		
		qx.Mixin.define("test.MLogger", {
			members: {
				log: function(msg) {
					return msg;
				}
			}
		});
		
		// normal usage
		qx.Clazz.define("test.UseLog1", {
			extend: Object,
			construct: function() {}
		});
		
		qx.Clazz.include(test.UseLog1, test.MLogger);		
		assertEquals("Juhu", new test.UseLog1().log("Juhu"));
		
		// not allowed to overwrite!
		qx.Clazz.define("test.UseLog2", {
			extend: Object,
			construct: function() {},
			members: {
				log: function() { return "foo"; }
			}
		});
		
		var error = true;
		try {
			qx.Clazz.include(test.UseLog2, test.MLogger);
		} catch (e) {
			error = e;
		}
		assertEquals(
			new Error("Overwriting the member 'log' is not allowed!").toString(),
			error.toString()
		);
		
		// allowed to overwrite!
		qx.Clazz.define("test.UseLog3", {
			extend: Object,
			construct: function() {},
			members: {
				log: function() { return "foo"; }
			}
		});
		
		assertEquals("foo", new test.UseLog3().log("Juhu"));		
		qx.Clazz.patch(test.UseLog3, test.MLogger);
		assertEquals("Juhu", new test.UseLog3().log("Juhu"));		
	}	
	
	
}});