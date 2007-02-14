
qx.Clazz.define("qxunit.Profile", { 
	extend: qxunit.TestCase,

	members : {
	
		testProfileObjectCreate: function() {

			if (!window.console) {
				return;
			}

			var loops = 1000;

			console.profile("object create empty");
			var ex = "test.Empty1_";
			var d = new Date()
			for (var i=0; i<loops; i++) {
				qx.Clazz.define(ex+i, {
			        extend: Object,
			        construct: function() {}
			    });
		    }
		  console.profileEnd();

			console.profile("object create complex");
			for (var i=0; i<loops; i++) {
				qx.Clazz.define("qxunit.Empty2_"+i, {
			        extend: qx.core.Object,
			        construct: function() {},
					type: "abstract",
					statics: {
						a: 1,
						b: "juhu",
						c: false,
						d: function() {}
					},
					members: {
						a: 1,
						b: "juhu",
						c: false,
						d: function() {}
					},
					properties: {
						prop1: {compat: true},
						prop2: {compat: true},
						prop3: {compat: true},
						prop4: {compat: true}
					}
			    });
		    }
			console.profileEnd();

			console.profile("object create complex without properties");
			for (var i=0; i<loops; i++) {
					qx.Clazz.define("qxunit.Empty3_"+i, {
			        extend: qx.core.Object,
			        construct: function() {},
					type: "abstract",
					statics: {
						a: 1,
						b: "juhu",
						c: false,
						d: function() {}
					},
					members: {
						a: 1,
						b: "juhu",
						c: false,
						d: function() {}
					}
			    });
		    }
			console.profileEnd();

		},

		testProfileString: function() {
			var loops = 1000;
			var fcnArr = [];
			fcnArr.push("function() { var a = 'assdfsd|fhfgh';");
			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "a.split('|');";
			}
			fcnArr.push("}");
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string split with match.");
			fcn();
			console.profileEnd();


			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "a.indexOf('|');";
			}
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string indexOf with match.");
			fcn();
			console.profileEnd();

			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
			}
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string conditional split with match.");
			fcn();
			console.profileEnd();


			// no match
			fcnArr[0] = "function() { var a = 'assdfsdfhfgh';";
			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "a.split('|');";
			}
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string split without match.");
			fcn();
			console.profileEnd();


			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "a.indexOf('|');";
			}
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string indexOf without match.");
			fcn();
			console.profileEnd();

			for (var i=0; i<loops; i++) {
				fcnArr[i+1] = "if (a.indexOf('|') >= 0) {a.split('|')};";
			}
			var fcn = eval(fcnArr.join("\n"));

			console.profile("string conditional split without match.");
			fcn();
			console.profileEnd();
		}
	}
});
