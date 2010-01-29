qx.Class.define("qx.test.io.part.MockPackage",
{
  extend : qx.core.Object,
  
  construct : function(id)
  {
    this.base(arguments);
    this.__id = id;
  },

  
  properties : 
  {
    readyState : {
      check : "String",
      init: "initialized"
    },
    
    delay : {
      check : "Integer",
      init : 0
    },
    
    error : {
      check : "Boolean",
      init : false
    }
  },
  
  
  events : 
  {
    "load" : "qx.event.type.Event",
    "error" : "qx.event.type.Event"
  },
  
  
  members :
  {
    load : function()
    {
      var self = this;
      this.setReadyState("loading");
      setTimeout(function()
      {
        if (self.getError())
        {
          self.setReadyState("error");
          self.fireEvent("error");
        }
        else
        {
          qx.test.io.part.MockPackage.LOAD_ORDER.push(self.__id);
          self.setReadyState("complete");
          self.fireEvent("load");
        }
      }, this.getDelay());
    }
  }
});