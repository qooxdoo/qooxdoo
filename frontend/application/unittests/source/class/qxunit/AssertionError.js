
qx.Clazz.define("qxunit.AssertionError", {
	extend: Error,
	construct: function(comment, failMessage) {
		arguments.callee.base.call(this, comment + ": " + failMessage);
		this.setComment(comment);
		this.setMessage(failMessage);
	},
	
	properties: {
		comment: { type: "string", compat: true },
		message: { type: "string", compat: true }
	},
	
	members: {
		toString: function() {
			return this.getComment() + ": " + this.getMessage();
		}
	}
});