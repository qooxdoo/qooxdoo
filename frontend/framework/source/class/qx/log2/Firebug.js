qx.Class.define("qx.log2.Firebug",
{
  statics :
  {
    process : function(entry)
    {
      if (window.console && console.firebug) {
        console[entry.level].apply(console, this.__toArguments(entry.items));
      }
    },

    __toArguments : function(items)
    {
      var output = [];

      for (var i=0, l=items.length; i<l; i++) {
        output.push(items[i].text);
      }

      return output;
    }
  },

  defer : function(statics) {
    qx.log2.Logger.register(statics);
  }
});
