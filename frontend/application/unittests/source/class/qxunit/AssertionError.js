
qx.Class.define("qxunit.AssertionError", {
  extend: Error,
  construct: function(comment, failMessage, args) {
    //arguments.callee.base.call(this, comment + ": " + failMessage);
    arguments.callee.base.apply(this, arguments);
    this.setComment(comment);
    this.setMessage(failMessage);
    this.setArguments(args);
  },

  properties: {
    comment: { check: "String" },
    message: { check: "String" },
    arguments: { }
  },

  members: {
    toString: function() {
      return this.getComment() + ": " + this.getMessage();
    }
  }
});