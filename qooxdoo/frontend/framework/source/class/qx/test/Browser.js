/**
#require(qx.Clazz)
#require(qx.core.Variant)
*/

qx.Clazz.define("qx.test.Browser", {
    extend: qx.core.Object,

    init: function() {},

    members: {
        getName: function() { return "unknown browser" },
        getName$gecko$opera: function() { return "Gecko" },
        getName$mshtml: function() { return "Internet Explorer" },
        getName$webkit: function() { return "Webkit" },
        //getName$opera: function() { return "Opera" },
        getName$donttouchme: function() {},

        getClient: qx.core.Variant.select("qx.client", {
                   gecko : function() { return "Gecko" },
                   mshtml : function() { return "Internet Explorer" },
                   webkit : function() { return "Webkit" },
                   opera : function() { return "Opera" },
                   none : function() { return "unknown browser" }
        })
    }
});
