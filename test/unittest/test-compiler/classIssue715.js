qx.Class.define("classIssue715", {
  members: {
    __privateOne: 1,
    
    myMethod() {
      this["__privateOne"] = "one";
      this["__privateTwo"] = "two";
    }
  },
  statics: {
    __privateStaticOne: 1,
    
    test: function() {
      classIssue715["__privateStaticOne"] = "one";
      classIssue715["__privateStaticTwo"] = "two";
    }
  }
});  