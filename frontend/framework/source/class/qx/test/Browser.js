qx.Clazz.define("qx.test.Browser", {
    extend: Object,
    
    init: function() {},
    
    members: {
        getName: function() { return "unknown browser" },
        getName$gecko: function() { return "Gecko" },
        getName$mshtml: function() { return "Internet Explorer" },
        getName$webkit: function() { return "Webkit" },
        getName$opera: function() { return "Opera" }
    }
});