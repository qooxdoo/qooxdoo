// Regression fixture for GitHub issue #519 - loaded by qx.test.tool.compiler.ClassFile

qx.Class.define("labelledForLoop", {
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