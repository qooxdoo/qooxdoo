/**
#require(qx.Clazz)
#require(qx.core.Variant)
*/
var c = "qx.client";

qx.Clazz.define("qx.test.Browser", {

  extend: qx.core.Object,
  
  init: function() {},
  
  members: {
    getName: qx.Variant("qx.client", {
      none: function() { return "unknown browser" },
      
      gecko: qx.Variant("qx.gecko.version", {
        "new": function() { return "Gecko new" },
        "old": function() { return "Gecko old" }
      }),
      
      mshtml: function() { return "Internet Explorer" },
      
      webkit: function() {

        if (qx.Variant("debug", "full")) {
          alert("full");
        } else if (qx.Variant("debug", "medium")) {
          alert("medium");
        } else {
          alert("none")
        }
        return "Hurra, Webkit!"
      },
        
      opera: function() { return "Opera" }
    }),
    
    getVersion: function() { return 2; } 

/*      
      getName: function() { return "unknown browser" },
      getName$gecko$opera: function() { return "Gecko" },
      getName$mshtml: function() { return "Internet Explorer" },
      getName$webkit: function() { return "Webkit" },
      //getName$opera: function() { return "Opera" },
      getName$donttouchme: function() {}
*/
  }
});
