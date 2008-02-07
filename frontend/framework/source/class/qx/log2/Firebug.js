qx.Class.define("qx.log2.Firebug",
{
  statics :
  {
    process : function(entry)
    {
      if (window.console && console.firebug) {
        console[entry.level].apply(console, this.__toArguments(entry.msgs));
      }      
    },
    
    __toArguments : function(msgs)
    {
      var output = [];
      
      for (var i=0, l=msgs.length; i<l; i++) {
        output.push(msgs[i].msg);
      }
      
      return output; 
    }    
  },
  
  defer : function(statics) {
    qx.log2.Logger.register(statics);    
  } 
});
