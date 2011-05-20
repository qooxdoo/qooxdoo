qx.Class.define("qxootest.Native", {
	extend : qx.core.Object,
	implement : [ qx.application.IApplication ],

	construct : function() {
		this.base(arguments);
		print(" ***************** ")
		print(" ** ")
		print(" ** in Native application");
		print(" ** ")
		print(" ***************** ")
	},

	/*
	 * ****************************************************************************
	 * MEMBERS
	 * ****************************************************************************
	 */

	members : {
		// interface method
		main : function() {
			// empty
		},

		// interface method
		finalize : function() {
			// empty
		},

		// interface method
		close : function() {
			// empty
		},

		// interface method
		terminate : function() {
			// empty
		}
	}
});
