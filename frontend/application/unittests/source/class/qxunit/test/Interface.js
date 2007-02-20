
qx.Clazz.define("qxunit.test.Interface", { 
	extend: qxunit.TestCase,

	members : {

		testInterface: function() {
			qx.Interface.define("qxunit.ICar", {
		        members: {
		            startEngine: function() { return true; }
		        },
				statics: {
					WHEELS: 4,
					honk: function() { return true; }
				},
				properties: {
					color: {}
				}
		    });
    
		    this.assertExceptionDebugOn(function() {
		  		var i = new qxunit.ICar();
			}, Error, "is not a constructor");

			// test correct implementations
		    qx.Clazz.define("qxunit.Audi", {
		        extend: Object,
		        construct: function() {},
        
		        implement: [qxunit.ICar],
        
		        members: {
		            startEngine: function() { return "start"}
		        },
				statics: {
					honk: function() { return "honk"; }
				},
				properties: {
					color: { compat: true }
				}
		    });
    
		    var audi = new qxunit.Audi("audi");
			this.assertEquals("honk", qxunit.Audi.honk());
			this.assertEquals(4, qxunit.Audi.WHEELS);
		
			// nothing defined
			this.assertExceptionDebugOn(function() {
		        qx.Clazz.define("qxunit.Audi1", {
		            extend: Object,
		            construct: function() {},
		            implement: [qxunit.ICar]
		        });
		    }, Error, new RegExp('Implementation of method .* is missing'));

			// members not defined
			this.assertExceptionDebugOn(function() {
			    qx.Clazz.define("qxunit.Audi2", {
			        extend: Object,
			        construct: function() {},
			        implement: [qxunit.ICar],
					statics: {
						honk: function() { return "honk"; }
					},
					properties: {
						color: { compat: true }
					}
			    });
		    }, Error, 'Implementation of method "startEngine" is missing');
		
			// statics not defined
			this.assertExceptionDebugOn(function() {
			    qx.Clazz.define("qxunit.Audi3", {
			        extend: Object,
			        construct: function() {},
			        implement: [qxunit.ICar],
			        members: {
			            startEngine: function() { return "start"}
			        },
					properties: {
						color: { compat: true }
					}
			    });
		    }, Error, 'Implementation of static method "honk" is missing');

			// property not defined
			this.assertExceptionDebugOn(function() {
			    qx.Clazz.define("qxunit.Audi4", {
			        extend: Object,
			        construct: function() {},
			        implement: [qxunit.ICar],
					members: {
			            startEngine: function() { return "start"}             
			        },
					statics: {
						honk: function() { return "honk"; }
					}
			    })
		    }, Error, "Implementation of method");
		},
	
		testAssertions: function() {
			qx.Interface.define("qxunit.IComplex", {
				members: {
					add: function(a) {
						return (
							arguments.length == 1 &&
							qx.Interface.hasInterface(a, qxunit.IComplex)
						);
					},
					setReal: function(r) {
						return arguments.length == 1 && typeof(r) == "number";
					},
					abs: function() {
						return arguments[0] == undefined;					
					}
				}
			});
		
			qx.Clazz.define("qxunit.Complex", {
				extend: Object,
				implement: qxunit.IComplex,
				construct: function(real, imag) {
					this._real = real;
					this._imag = imag;
				},
				members: {
					add: function(a) {
						this._real += a._real;
						this._imag += a._imag;
					},
					setReal: function(r) {
						this._real = r;
					},
					abs: function() {
						return Math.sqrt((this._real * this._real) + (this._imag + this._imag));
					},
					toString: function() {
						return this._real + "+" + this._imag+"i";
					}
				}
			});
		
			var a = new qxunit.Complex(1,1);
			var b = new qxunit.Complex(2, -3.4);

			// valid usage
			a.add(b);
			a.setReal(20);
			a.abs();
		
			// invalid usage		
			this.assertExceptionDebugOn(function() {
				a.add(b,b);
			}, Error, "Pre condition of method");
		
			this.assertExceptionDebugOn(function() {
				a.setReal()
			}, Error, "Pre condition of method");

			this.assertExceptionDebugOn(function() {
				a.setReal(1,2)
			}, Error, "Pre condition of method");
			
			this.assertExceptionDebugOn(function() {
				a.setReal("Juhu");
			}, Error, "Pre condition of method");
			
			this.assertExceptionDebugOn(function() {
				a.abs({});
			}, Error, "Pre condition of method");
			
			this.assertExceptionDebugOn(function() {
				a.add("Juhu");
			}, Error, "Pre condition of method");
		},
		
		testIncludes: function() {
			qx.Interface.define("qxunit.IMember", {
				members: {
					sayJuhu: function() { return true; }
				}
			});

			qx.Interface.define("qxunit.IStatics", {
				statics: {
					PI: 3.14,
					sayHello: function() { return true; }
				}
			});

			qx.Interface.define("qxunit.IProperties", {
				properties: {"color": {}, "name": {} }
			});

			qx.Interface.define("qxunit.IAll", {
				extend: [qxunit.IMember, qxunit.IStatics, qxunit.IProperties]
			});
			
			qx.Interface.define("qxunit.IOther", {
				members: {
					bar: function() {return true;}
				}
			});
			
			var classDef = {
				extend: Object,
				implement: qxunit.IAll,
				members: {
					sayJuhu: function() {}
				},
				statics: {
					sayHello: function() { return true; }
				},
				properties: {"color": { compat: true }, "name": { compat: true} }				
			}
			
			// all implemented
			var def = qx.lang.Object.copy(classDef);
			qx.Clazz.define("qxunit.Implement1", def)

			this.assertTrue(qx.Interface.hasInterface(qxunit.Implement1, qxunit.IAll));
			this.assertTrue(qx.Interface.hasInterface(qxunit.Implement1, qxunit.IMember));
			this.assertTrue(qx.Interface.hasInterface(qxunit.Implement1, qxunit.IStatics));
			this.assertTrue(qx.Interface.hasInterface(qxunit.Implement1, qxunit.IProperties));

			this.assertFalse(qx.Interface.hasInterface(qxunit.Implement1, qxunit.IOther));
			
			// no members
			var def = qx.lang.Object.copy(classDef);
			delete(def.members);
			this.assertExceptionDebugOn(function() {
				qx.Clazz.define("qxunit.Implement2", def)
			}, Error, "Implementation of method");

			// no statics
			var def = qx.lang.Object.copy(classDef);
			delete(def.statics);			
			this.assertExceptionDebugOn(function() {
				qx.Clazz.define("qxunit.Implement3", def)
			}, Error, "Implementation of static method");	
			
			// no properties
			var def = qx.lang.Object.copy(classDef);
			delete(def.properties);
			this.assertExceptionDebugOn(function() {
				qx.Clazz.define("qxunit.Implement4", def)
			}, Error, "Implementation of method");				
			
			// check copying of static fields
			this.assertEquals(3.14, qxunit.Implement1.PI);

			var def = qx.lang.Object.copy(classDef);			
			def.statics.PI = 4;
			this.assertException(function() {
				qx.Clazz.define("qxunit.Implement5", def)
			}, Error, "Overwriting static member");				
				

		}
	}
});