qx.Class.define("classIssue519", {
  statics: {
    test: function() {
      classloop:
      for (var i=0; i<10; i++)
      {
        for (var j=0; j<10; j++)
        {
            break classloop;
        }
      }
    }
  }
});  