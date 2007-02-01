/**
#require(qx.Clazz)
#require(qx.core.Variant)
*/

qx.core.Variant.define("qx.gecko.version", ["new", "old"]);
qx.core.Variant.set("qx.gecko.version", "new");

qx.Clazz.define("qx.test.Browser", {

  extend: qx.core.Object,
  
  init: function() {},
  
  members: {
    getName: qx.core.Variant.select("qx.client", {
      none: function() { return "unknown browser" },
      
      gecko: qx.core.Variant.select("qx.gecko.version", {
        "new": function() { return "Gecko new" },
        "old": function() { return "Gecko old" },
        "none": function() {}
      }),
      
      //mshtml: function() { return "Internet Explorer" },
      
      webkit: function() {

        if (qx.core.Variant.select("debug", "full")) {
          alert("full");
        } else if (qx.core.Variant.select("debug", "medium")) {
          alert("medium");
        } else {
          alert("none")
        }
        return "Hurra, Webkit!"
      },
        
      "opera|mshtml": function() { return "Opera" }
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
