
qx.Clazz.define("qxunit.test.core.Target", {

	extend: qxunit.TestCase,
	
	members: {
		testEvents: function() {
			
			qx.Clazz.define("qxunit.Event", {
				extend: qx.core.Target,
				events: ["click"]
			});
			
			var target = new qxunit.Event();
			target.addEventListener("click", function() {});
			
			var error = "";
			try {
				target.addEventListener("blur", function() {});				
			} catch (e) {
				error = e;
			}
			this.assertMatchDebugOn(error.toString(), "do not support the event");
		}
	}
	
});