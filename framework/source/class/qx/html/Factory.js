qx.Class.define("qx.html.Factory", {
  extend: qx.core.Object,
  type: "singleton",
  
  construct: function() {
    this.base(arguments);
    this.__factoriesByTagName = {};
    this.registerFactory("img", qx.html.Image);
    this.registerFactory("iframe", function(tagName, attributes, styles) {
      return new qx.html.Iframe(attributes.src, attributes, styles);
    });
    this.registerFactory("input", function(tagName, attributes, styles) {
      return new qx.html.Iframe(attributes.type||"text", attributes, styles);
    });
  },
  
  members: {
    __factoriesByTagName: null,
    
    registerFactory: function(tagName, factory) {
      tagName = tagName.toLowerCase();
      if (this.__factoriesByTagName[tagName] === undefined)
        this.__factoriesByTagName[tagName] = [];
      this.__factoriesByTagName[tagName].push(factory);
    },
    
    createElement: function(tagName, attributes) {
      tagName = tagName.toLowerCase();
      
      if (attributes instanceof NamedNodeMap) {
        var newAttrs = {};
        for(var i = attributes.length - 1; i >= 0; i--) {
          newAttrs[attributes[i].name] = attributes[i].value;
        }
        attributes = newAttrs;
      }
      
      var styles = {};
      if (attributes.style) {
        attributes.style.split(/;/).forEach(function(seg) {
          let pos = seg.indexOf(":");
          let key = seg.substring(0, pos);
          let value = seg.substring(pos + 1).trim();
          styles[key] = value.trim();
        });
        delete attributes.style;
      }
      
      var factories = this.__factoriesByTagName[tagName];
      if (factories) {
        for (var i = factories.length - 1; i > -1; i++) {
          var factory = factories[i];
          if (factory.classname && qx.Class.getByName(factory.classname) === factory) {
            return new factory(tagName, attributes, styles);
          }
          
          if (qx.core.Environment.get("qx.debug")) {
            this.assertTrue(typeof factory == "function");
          }
          var element = factory(tagName, attributes, styles);
          if (element) {
            return element;
          }
        }
      }
      
      return new qx.html.Element(tagName, styles, attributes);
    }
  
  }
});

