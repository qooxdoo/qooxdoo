qx.Class.define("qx.event.handler.IframeEventHandler",
{
  extend : qx.event.handler.AbstractEventHandler,
  



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this.base(arguments, manager);


  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  
  members : 
  {
    __eventTypes :
    {
      load : true,
      unbeforeunload : true,
      unload : true,
      onreadystatechange : true
    },
    
    
    // overridden
    canHandleEvent : function(target, type) 
    {
      return target.nodeType !== undefined && 
        target.tagName.toLowerCase() === "iframe" &&
        this.__eventTypes[type];
    }
  },
  
  



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_FIRST);
  }  
});
