// Application class based on attachment of bug#5100, by John Spackman
qx.Class.define("${Namespace}.Application", {
	extend : qx.core.Object,
	implement : [ qx.application.IApplication ],

	construct : function() {
		this.base(arguments);
		print(" ***************** ")
		print(" ** ")
		print(" ** Server application");
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
