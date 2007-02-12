
qx.Clazz.define("qxunit.Clazz", { statics : {
	
	testEmptyClass: function() {
	    qx.Clazz.define("test.Empty", {
	        extend: Object,
	        construct: function() {}
	    });

	    var empty = new test.Empty();
	    assertEquals("object", typeof(empty));
	},
	
	testSameNameClasses: function() {
	    qx.Clazz.define("test.Same", {
	        extend: Object,
	        construct: function() {}
	    });
	
		error = false;
		try {
		    qx.Clazz.define("test.Same", {
	        	extend: Object,
	        	construct: function() {}
	    	});
		}
		catch (e) {
			error = e;
		}
		assertEquals(
			new Error("An object of the name 'test.Same' aready exists and overwriting is not allowed!").toString(),
			error.toString()
		);
	},

	testSuperClassCall: function() {
	    qx.Clazz.define("test.Car", {
	        extend: Object,
        
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
	            },
            
	            Super: function(args) {
	                if (arguments.length == 1) {
	                    return args.callee.base.call(this);
	                } else {
	                    return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
	                }
	            }   
	        }
	    });

	    var car = new test.Car("Audi");
	    assertEquals("start", car.startEngine());
	    assertEquals("stop", car.stopEngine());
	    assertEquals("Audi", car.getName());

	    qx.Clazz.define("test.Bmw", {
        
	        extend: test.Car,
        
	        construct: function(name, prize) {
	            this.Super(arguments, name);
	        },
        
	        members: {
	            startEngine: function() {
	                ret = this.Super(arguments);
	                return "brrr " + ret;
	            },
            
	            stopEngine: function() {
	                ret = arguments.callee.base.call();
	                return "brrr " + ret;
	            }
            
	        }
	    });

	    var bmw = new test.Bmw("bmw", 44000);
	    assertEquals("bmw", bmw.getName());
	    assertEquals("brrr start", bmw.startEngine());
	    assertEquals("brrr stop", bmw.stopEngine());
	},

	
	testAbstract: function() {
		
		qx.Clazz.define("test.AbstractCar", {
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
			var car = new test.AbstractCar("blue");
		} catch(e) {
			error = true;
		}
		assertTrue("It is not permitted to instanciate an abstract class.", error);

		// check if subclasses of abstract classes work
		qx.Clazz.define("test.ConcreteCar", {
			extend: test.AbstractCar,
			construct: function(color) {
				arguments.callee.base.apply(this, arguments);
			}
		});

		var car = new test.ConcreteCar("red");
		assertNotUndefined(car);
		assertEquals("red", car._color);
	},
	
	
	testSingleton: function() {

		qx.Clazz.define("test.Single1", {
			extend: Object,
			type: "singleton",
			include: qx.lang.MSingleton,
			
			construct: function (name) {
				this._name = name;
				this._date = new Date().toString();
			}			
		});

		assertEquals(
			"getInstance sould always return the same object!",
			test.Single1.getInstance()._date,
			test.Single1.getInstance()._date
		);
		
		// direct instanctiation should fail
		var error = false;
		try {
			var s = new test.Single1();
		} catch(e) {
			error = true;
		}
		assertTrue("Direct instanctiation of singletons should fail!", error);		

	}
	
}});