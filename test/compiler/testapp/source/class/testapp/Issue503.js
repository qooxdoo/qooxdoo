qx.Class.define("testapp.Issue503", {
  extend: qx.core.Object,
  
  members: {
    testOne(aOptions) {
      var {activeUserOnly = false} = aOptions;
      console.log("activeUserOnly=" + activeUserOnly);
    },
    testTwo(aOptions) {
      var [activeUserOnly = false] = aOptions;
      console.log("activeUserOnly=" + activeUserOnly);
    }
  }
});
