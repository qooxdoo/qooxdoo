qx.Bootstrap.define("qx.module.event.Mouse", {
  statics :
  {
    TYPES : ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mousemove",
      "mouseout"],
    
    BUTTONS_DOM2 : {
      0 : "left",
      2 : "right",
      1 : "middle"
    },
    
    BUTTONS_MSHTML : {
      1 : "left",
      2 : "right",
      4 : "middle"
    },
    
    getButton : function()
    {
      switch(this.type)
      {
        case "contextmenu":
          return "right";

        case "click":
          // IE does not support buttons on click --> assume left button
          if (qx.core.Environment.get("browser.name") === "ie" &&
          qx.core.Environment.get("browser.documentmode") < 9)
          {
            return "left";
          }

        default:
          if (this.target !== undefined) {
            return qx.module.event.Mouse.BUTTONS_DOM2[this.button] || "none";
          } else {
            console.log("IE");
            return qx.module.event.Mouse.BUTTONS_MSHTML[this.button] || "none";
          }
      }
    },
    
    normalize : function(event)
    {
      var bound = qx.module.event.Mouse.getButton.bind(event);
      event.getButton = bound;
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization(qx.module.event.Mouse.TYPES, statics.normalize);
  }
});