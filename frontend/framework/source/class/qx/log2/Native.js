qx.Bootstrap.define("qx.log2.Native",
{
  statics :
  {
    process : function(entry)
    {
      if (window.console && console.firebug) {
        console[entry.level].apply(console, this.__toArguments(entry.items));
      } else if (window.opera && opera.postError) {
        opera.postError.apply(opera, this.__toArguments(entry.items));
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
