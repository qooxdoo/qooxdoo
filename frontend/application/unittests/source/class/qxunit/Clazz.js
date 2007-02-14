
qx.Clazz.define("qxunit.Clazz", {
	extend: qxunit.TestCase,
	
	members : {
	
		testEmptyClass: function() {
			qx.Clazz.define("qxunit.Empty", {
		        extend: Object,
		        construct: function() {}
		    });

		    var empty = new qxunit.Empty();
		    assertEquals("object", typeof(empty));
			assertTrue(empty instanceof qxunit.Empty);
		},
	
		testSameNameClasses: function() {
		    qx.Clazz.define("qxunit.Same", {
		        extend: Object,
		        construct: function() {}
		    });
	
			error = false;
			try {
			    qx.Clazz.define("qxunit.Same", {
		        	extend: Object,
		        	construct: function() {}
		    	});
			}
			catch (e) {
				error = e;
			}
			assertEquals(
				new Error("An object of the name 'qxunit.Same' aready exists and overwriting is not allowed!").toString(),
				error.toString()
			);
		},

		testSuperClassCall: function() {
		    qx.Clazz.define("qxunit.Car", {
		        extend: qx.core.Object,
        
		        construct: function (name) {
		            this._name = name;
		        },
        
		        members: {
		            startEngine: function() {
		                return "start";
		            },
            
		            stopEngine: function() {
		                return "stop";
		            },
            
		            getName: function() {
		                return this._name;
		            }
            
		        }
		    });

		    var car = new qxunit.Car("Audi");
		    assertEquals("start", car.startEngine());
		    assertEquals("stop", car.stopEngine());
		    assertEquals("Audi", car.getName());

		    qx.Clazz.define("qxunit.Bmw", {
        
		        extend: qxunit.Car,
        
		        construct: function(name, prize) {
					arguments.callee.base.call(this, name);
		            this.base(arguments, name);
		        },
        
		        members: {
		            startEngine: function() {
		                var ret = this.base(arguments);
		                return "brrr " + ret;
		            },
            
		            stopEngine: function() {
		                var ret = arguments.callee.base.call();
		                return "brrr " + ret;
		            }
            
		        }
		    });

		    var bmw = new qxunit.Bmw("bmw", 44000);
		    assertEquals("bmw", bmw.getName());
		    assertEquals("brrr start", bmw.startEngine());
		    assertEquals("brrr stop", bmw.stopEngine());
		},

	
		testAbstract: function() {
		
			qx.Clazz.define("qxunit.AbstractCar", {
				extend: Object,
				type: "abstract",
				construct: function(color) {
					this._color = color;
				},
				members: {
					startEngine: function() {}
				}			
			});

			// instantiating abstract classes should fail
			var error = false;
			try {
				var car = new qxunit.AbstractCar("blue");
			} catch(e) {
				error = true;
			}
			assertTrue("It is not permitted to instanciate an abstract class.", error);

			// check if subclasses of abstract classes work
			qx.Clazz.define("qxunit.ConcreteCar", {
				extend: qxunit.AbstractCar,
				construct: function(color) {
					arguments.callee.base.apply(this, arguments);
				}
			});

			var car = new qxunit.ConcreteCar("red");
			assertNotUndefined(car);
			assertEquals("red", car._color);
		},
	
	
		testSingleton: function() {

			qx.Clazz.define("qxunit.Single1", {
				extend: Object,
				type: "singleton",
			
				construct: function (name) {
					this._name = name;
					this._date = new Date().toString();
				}			
			});

			assertEquals(
				"getInstance sould always return the same object!",
				qxunit.Single1.getInstance()._date,
				qxunit.Single1.getInstance()._date
			);
		
			// direct instanctiation should fail
			var error = false;
			try {
				var s = new test.Single1();
			} catch(e) {
				error = true;
			}
			assertTrue("Direct instanctiation of singletons should fail!", error);		

		},
	
		testSetting: function() {
			qx.Clazz.define("qxunit.Setting1", {
				settings: {
					"qxunit.juhu": "kinners"
				}
			});
		
			assertEquals(
				"kinners",
				qx.core.Setting.get("qxunit.juhu")
			);
		
		
			var error = false;
			try {
				qx.Clazz.define("qxunit.Setting2", {
					settings: {
						"foo.juhu": "kinners"
					}
				});
			} catch (e) {
				error = e;
			}
			assertTrue(error.toString().match(/Forbidden setting/) ? true : false);
		},
	
		testVariant: function() {
			qx.Clazz.define("qxunit.Variant1", {
				variants: {
					"qxunit.juhu": {
						allowedValues: ["kinners", "juhu"],
						defaultValue: "kinners"
					}
				}
			});
		
			assertEquals(
				"kinners",
				qx.core.Variant.get("qxunit.juhu")
			);
		
			var error = false;
			try {
				qx.Clazz.define("qxunit.Variant2", {
					variants: {
						"foo.juhu": {
							allowedValues: ["kinners", "juhu"],
							defaultValue: "kinners"
						}
					}
				});
			} catch (e) {
				error = e;
			}
			assertTrue(error.toString().match(/Forbidden variant/) ? true : false);
		}	
	
}});