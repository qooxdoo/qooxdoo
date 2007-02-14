
qx.Clazz.define("qxunit.Interface", { statics : {

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
    
	    var error = false;
	    try {
	      var i = new qxunit.ICar();
	    } catch (e) {
	        error = true;
	    }
	   assertTrue("Interfaces cannot be instantiated!", error);


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
		assertEquals("honk", qxunit.Audi.honk());
		assertEquals(4, qxunit.Audi.WHEELS);
		
		// nothing defined
		error = false;
	    try {
	        qx.Clazz.define("qxunit.Audi1", {
	            extend: Object,
	            construct: function() {},
	            implement: [qxunit.ICar]
	        });
	    } catch (e) {
	        error = e;
	    }
		assertEquals(
			new Error('Implementation of method "startEngine" is missing in Class "qxunit.Audi1" required by interface "qxunit.ICar"').toString(),
			error.toString()
		);

		// members not defined
		error = false;
	    try {
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
	    } catch (e) {
	        error = e;
	    }
		assertEquals(
			new Error('Implementation of method "startEngine" is missing in Class "qxunit.Audi2" required by interface "qxunit.ICar"').toString(),
			error.toString()
		);

		
		// statics not defined
		error = false;
	    try {
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
	    } catch (e) {
	        error = e;
	    }
		assertEquals(
			new Error('Implementation of static method "honk" is missing in Class "qxunit.Audi3" required by interface "qxunit.ICar"').toString(),
			error.toString()
		);

		// property not defined
		error = false;
	    try {
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
		    });
	    } catch (e) {
	        error = e;
	    }
		assertEquals(
			new Error('Implementation of method "getColor" is missing in Class "qxunit.Audi4" required by interface "qxunit.ICar"').toString(),
			error.toString()
		);
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
		
		// invalig usage		
		var error = false;
		try {
			a.add(b,b);
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);
		
		var error = false;
		try {
			a.setReal()
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);

		var error = false;
		try {
			a.setReal(1,2)
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);

		var error = false;
		try {
			a.setReal("Juhu");
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);

		var error = false;
		try {
			a.abs({});
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);

		var error = false;
		try {
			a.add("Juhu");
		} catch (e) {
			error = e;
		}
		assertTrue(error.toString().match(/Pre condition of method/) ? true : false);

	}
		
}});