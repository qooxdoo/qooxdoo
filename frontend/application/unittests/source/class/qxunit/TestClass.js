
qx.Class.define("qxunit.TestClass", {

  extend : qxunit.TestSuite,

  construct : function(clazz)
  {
    this.base(arguments);

    if (!clazz) {
      this.addFail("exsitsCheck" + this.__testClassNames.length, "Unkown test class!");
      return;
    }
    if (!qx.Class.isSubClassOf(clazz, qxunit.TestCase)) {
      this.addFail("Sub class check.", "The test class '"+ clazz.classname +"'is not a sub class of 'qxunit.TestCase'");
      return;
    }

    var proto = clazz.prototype;
    var classname = clazz.classname;

    for (var test in proto) {
      if (proto.hasOwnProperty(test)) {
        if (typeof(proto[test]) == "function" && test.indexOf("test") == 0) {
          this.addTestMethod(clazz, test);
        }
      }
    }

    this.setName(clazz.classname);
  },

  properties :
  {
    name : { check : "String"}
  }

});