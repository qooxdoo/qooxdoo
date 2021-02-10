qx.Class.define("qx.test.testclasses.RootClass", {
  extend: qx.core.Object,
  
  construct: function() {
    this.base(arguments);
    qx.core.Assert.assertTrue(this.state === null);
    this.state = [ "root" ];
  },
  
  members: {
    state: null,
    
    getSomething: function() {
      return "root";
    }
  }
});