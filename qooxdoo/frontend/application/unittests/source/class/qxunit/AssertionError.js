
qx.Class.define("qxunit.AssertionError", {
  extend: Error,

  construct: function(comment, failMessage) {
    Error.call(this, failMessage);
    this.setComment(comment || "");
    this.setMessage(failMessage || "");

    this._trace = qx.dev.StackTrace.getStackTrace();
  },

  properties: {
    comment:
    {
      check: "String",
      init: ""
    },

    message: {
      check: "String",
      init: ""
    }

  },

  members: {

    toString: function() {
      return this.getComment() + ": " + this.getMessage();
    },

    getStackTrace : function()
    {
      return this._trace;
    }

  }
});