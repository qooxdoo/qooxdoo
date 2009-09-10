qx.Class.define("apiviewer.test.Methods",
{
  extend : Object,

  members :
  {
    // shadowed keys
    toString : function() {},
    valueOf : function() {},
    isPrototypeOf : function() {},
    hasOwnProperty : function() {},
    toLocaleString : function() {}
  }
});