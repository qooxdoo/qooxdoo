qx.Bootstrap.define("qx.module.event.Mouse", {
  statics :
  {
    TYPES : ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mousemove",
      "mouseout"],
      
    BIND_METHODS : ["getButton", "getViewportLeft", "getViewportTop", 
      "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],
    
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
            return qx.module.event.Mouse.BUTTONS_MSHTML[this.button] || "none";
          }
      }
    },
    
    /**
     * Get the he horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The horizontal mouse position
     */
    getViewportLeft : function() {
      return this.clientX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Integer} The vertical mouse position
     * @signature function()
     */
    getViewportTop : function() {
      return this.clientY;
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The horizontal mouse position in the document.
     */
    getDocumentLeft : function()
    {
      if (this.pageX !== undefined) {
        return this.pageX;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientX + qx.bom.Viewport.getScrollLeft(win);
      }
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The vertical mouse position in the document.
     */
    getDocumentTop : function()
    {
      if (this.pageY !== undefined) {
        return this.pageY;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientY + qx.bom.Viewport.getScrollTop(win);
      }
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Integer} The horizontal mouse position on the screen.
     */
    getScreenLeft : function() {
      return this.screenX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Integer} The vertical mouse position on the screen.
     */
    getScreenTop : function() {
      return this.screenY;
    },
    
    normalize : function(event)
    {
      if (!event) {
        return event;
      }
      var bindMethods = qx.module.event.Mouse.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") { 
          event[bindMethods[i]] = qx.module.event.Mouse[bindMethods[i]].bind(event);
        }
      }
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization(qx.module.event.Mouse.TYPES, statics.normalize);
  }
});