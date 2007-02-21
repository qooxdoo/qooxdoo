
qx.Clazz.define("qxunit.test.Clazz", {
	extend: qxunit.TestCase,
	
	members : {
	
		testEmptyClass: function() {
			qx.Clazz.define("qxunit.Empty", {
		        extend: Object,
		        construct: function() {}
		    });

		    var empty = new qxunit.Empty();
		    this.assertEquals("object", typeof(empty));
			this.assertTrue(empty instanceof qxunit.Empty);
		},
	
		testSameNameClasses: function() {
			qx.Clazz.define("qxunit.Same", {
		        extend: Object,
		        construct: function() {}
		    });
	
			this.assertExceptionDebugOn(function() {
			    qx.Clazz.define("qxunit.Same", {
		        	extend: Object,
		        	construct: function() {}
		    	});
			}, Error, "An object of the name 'qxunit.Same' aready exists and overwriting is not allowed!");
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
		    this.assertEquals("start", car.startEngine());
		    this.assertEquals("stop", car.stopEngine());
		    this.assertEquals("Audi", car.getName());

		    qx.Clazz.define("qxunit.Bmw", {
        
		        extend: qxunit.Car,
        
		        construct: function(name, prize) {
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
		            },
		    		getWheels: function() {
						return this.self(arguments).WHEELS;
					}
		        },
		
				statics: {
					WHEELS: 4
				}
		    });

		    var bmw = new qxunit.Bmw("bmw", 44000);
		    this.assertEquals("bmw", bmw.getName());
		    this.assertEquals("brrr start", bmw.startEngine());
		    this.assertEquals("brrr stop", bmw.stopEngine());
			this.assertEquals(4, bmw.getWheels());
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
			this.assertExceptionDebugOn(function() {
				var car = new qxunit.AbstractCar("blue");
			}, Error, new RegExp("The class .* is abstract"));

			// check if subclasses of abstract classes work
			qx.Clazz.define("qxunit.ConcreteCar", {
				extend: qxunit.AbstractCar,
				construct: function(color) {
					arguments.callee.base.apply(this, arguments);
				}
			});

			var car = new qxunit.ConcreteCar("red");
			this.assertNotUndefined(car);
			this.assertEquals("red", car._color);
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

			this.assertEquals(
				qxunit.Single1.getInstance()._date,
				qxunit.Single1.getInstance()._date,
				"getInstance sould always return the same object!"
			);
		
			// direct instanctiation should fail
			this.assertExceptionDebugOn(function() {
				var s = new qxunit.Single1();
			}, Error, new RegExp("The class .* is a singleton"));

		},
	
		testSetting: function() {
			qx.Clazz.define("qxunit.Setting1", {
				settings: {
					"qxunit.juhu": "kinners"
				}
			});
		
			this.assertEquals(
				"kinners",
				qx.core.Setting.get("qxunit.juhu")
			);
		
		
			this.assertExceptionDebugOn(function() {
				qx.Clazz.define("qxunit.Setting2", {
					settings: {
						"foo.juhu": "kinners"
					}
				});
			}, Error, "Forbidden setting");
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
		
			this.assertEquals(
				"kinners",
				qx.core.Variant.get("qxunit.juhu")
			);
		
			this.assertExceptionDebugOn(function() {
				qx.Clazz.define("qxunit.Variant2", {
					variants: {
						"foo.juhu": {
							allowedValues: ["kinners", "juhu"],
							defaultValue: "kinners"
						}
					}
				});
			}, Error, "Forbidden variant");
		},	
		
		testDefer: function() {
			// this is BAD practice, don't code like this!
			qx.Clazz.define("qxunit.Defer", {
				extend: qx.core.Object,
				
				defer: function(statics, prot, settings) {
					statics.FOO = 12;
					statics.sayHello = function() { return "Hello"; };
					prot.sayJuhu = function() { return "Juhu"; };
					settings.add("color", {compat: true });
				}				
			});
			
			this.assertEquals(12, qxunit.Defer.FOO);
			this.assertEquals("Hello", qxunit.Defer.sayHello());

			var defer = new qxunit.Defer();
			this.assertEquals("Juhu", defer.sayJuhu());

			defer.setColor("red");
			this.assertEquals("red", defer.getColor());		
		},
		
		testCaller: function() {
			
			qx.Clazz.define("qxunit.CallerSuper", {
				extend: qx.core.Object,
				members: {
					__foo: function() {
						this.debug("foo");
					},
					_bar: function() {
						this.__foo();
					},
					juhu: function() {
						this._bar();
					}
				},
				statics: {
					sayFoo: function() {
						this.__staticFoo();
					},
					__staticFoo: function() {
						new qx.core.Object().debug("static foo");
					}
				}
			});
			
			// statics
			qxunit.CallerSuper.sayFoo();
			this.assertException(function() {
				qxunit.CallerSuper.__staticFoo();
			}, Error, "Private method");
			
			var caller = new qxunit.CallerSuper();
			caller.juhu();
			this.assertException(function() {
				caller._bar();
			}, Error, "Protected method");

			this.assertException(function() {
				caller.__foo();
			}, Error, "Private method");
		
			// test protected
			qx.Clazz.define("qxunit.CallerChild", {
				extend: qxunit.CallerSuper,
				members: {
					juhu: function() {
						this._bar();
					},
					kinners: function() {
						this.__foo();
					}
				}
			});

			var caller = new qxunit.CallerChild();
			caller.juhu();
			
			this.assertException(function() {			
				caller.kinners();
			}, Error, "Private method");			
			
		},
		
		testWrappedPrivate: function() {
			qx.Interface.define("qxunit.IWrappedPrivate", {
				members: {
					__foo: function() { return true; }
				}
			});
			
			// private/protected should not be part of an interface
			qx.Clazz.define("qxunit.WrappedPrivate", {
				extend: qx.core.Object,
				implement: [qxunit.IWrappedPrivate],
				members: {					
					__foo: function() { this.debug("foo"); },
					sayFoo: function() { this.__foo(); }
				}
			});
			
			var wp = new qxunit.WrappedPrivate();
			this.assertException(function() {
				wp.__foo();
			}, Error, "Private method");
			
			wp.sayFoo();
		},
		
		testGetFunctionName: function() {
			var self = this;
		
			qx.Clazz.define("qxunit.FuncName", {
				extend: qx.core.Object,
				construct: function() {
					this.base(arguments);
					self.assertEquals("construct", qx.Clazz.getFunctionName(arguments.callee));
				},
				
				members: {
					__foo: function() {
						self.assertEqualsDebugOn("__foo", qx.Clazz.getFunctionName(arguments.callee));						
					},

					_bar: function() {
						self.assertEquals("_bar", qx.Clazz.getFunctionName(arguments.callee));						
					},
					
					sayFooBar: function() {
						self.assertEquals("sayFooBar", qx.Clazz.getFunctionName(arguments.callee));
						this.__foo();
						this._bar();
					}
				}
			});
			
			var funcName = new qxunit.FuncName();
			funcName.sayFooBar();
			this.assertNull(qx.Clazz.getFunctionName(function() {}));
			
		}
		
	}	
});