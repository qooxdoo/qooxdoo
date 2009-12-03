qx.Class.define("showcase.Page",
{
  extend: qx.core.Object,
  
  construct: function(description)
  {
    this.setDescription(description);
    this.initReadyState();
  },
  
  properties : 
  {
    description : {
      check: "showcase.PageDescription",
      event: "changeDescription"
    },
    
    content : {
      check : "showcase.AbstractContent"
    },
       
    readyState :
    {
      check: ["initialized", "loading", "complete"],
      init: "initialized",
      event: "changeState"
    }
  },
  
  
  members :
  {
    load : function(callback, context)
    {
      var callback = callback || qx.lang.Function.empty;
      var context = context || this;
    
      var state = this.getReadyState();
      if (state == "complete")
      {
        callback.call(context, this);
        return;
      }
      else if (state == "loading")
      {
        return this.addListenerOnce("changeState", function() {
          callback.call(context, this);
        });
      }
      else
      {
        this.setReadyState("loading");
        qx.io2.PartLoader.require(this.getDescription().getPart(), function() {
          this._initializeContent();
          this.setReadyState("complete");
          callback.call(context, this);
        }, this);
      }
    },
    
    
    _initializeContent : function()
    {
      var description = this.getDescription();
      
      var contentClass = qx.Class.getByName(description.getContentClass());
      this.setContent(new contentClass(this));
    }
  }
});