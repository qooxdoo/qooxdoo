qx.Class.define("qx.html.Decorator",
{
  extend : qx.html.Element,
  
  construct : function(decorator, decoratorId)
  {
    this.base(arguments);
    this.__decorator = decorator;
    this.__id = decoratorId || decorator.toHashCode();
    
    this.setStyles({
      position: "absolute",
      top: 0,
      left: 0
    });
    
    this.useMarkup(decorator.getMarkup());    
  },
  
  
  members :
  {
    __id : null,
    __decorator : null,
    
    getId : function() {
      return this.__id;
    },
    
    
    getDecorator : function() {
      return this.__decorator;
    },
    
    
    resize : function(width, height) {
      this.__decorator.resize(this.getDomElement(), width, height);
    },
    
    
    tint : function(color) {
      this.__decorator.tint(this.getDomElement(), color);
    },
    
    
    getInsets : function() {
      return this.__decorator.getInsets();
    }
  }
});