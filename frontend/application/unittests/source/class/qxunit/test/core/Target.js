
qx.Class.define("qxunit.test.core.Target", {

	extend: qxunit.TestCase,
	
	members: {
		testEvents: function() {
			
			qx.Class.define("qxunit.Event", {
				extend: qx.core.Target,
				events: {"click": "qx.event.type.Event"}
			});
			
			var target = new qxunit.Event();
			target.addEventListener("click", function() {});
			
			// this will only issue a warning!
			/*
			this.assertException(function() {
				target.addEventListener("blur", function() {});				
			}, Error, "JUHU");
			*/
		}
	}
	
});