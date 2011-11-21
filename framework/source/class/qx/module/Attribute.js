qx.Bootstrap.define("qx.module.Attribute", {
  statics :
  {
    getHtml : function() {
      if (this[0]) {
        return qx.bom.element.Attribute.get(this[0], "html");
      }
      return null;
    },

    setHtml : function(html) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Attribute.set(this[i], "html", html);
      };
    },


    setAttribute : function(name, value) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Attribute.set(this[i], name, value);
      };
    },


    getAttribute : function(name) {
      if (this[0]) {
        return qx.bom.element.Attribute.get(this[0], name);
      }
      return null;
    },


    setAttributes : function(attributes) {
      for (var name in attributes) {
        this.setAttribute(name, attributes[name]);
      }
    },


    getAttributes : function(names) {
      var attributes = {};
      for (var i=0; i < names.length; i++) {
        attributes[names[i]] = this.getAttribute(names[i]);
      };
      return attributes;
    },


    setProperty : function(name, value) {
      for (var i=0; i < this.length; i++) {
        this[i][name] = value;
      };
    },


    getProperty : function(name) {
      if (this[0]) {
        return this[0][name];
      }
      return null;
    },


    setProperties : function(properties) {
      for (var name in properties) {
        this.setProperty(name, properties[name]);
      }
    },


    getProperties : function(names) {
      var properties = {};
      for (var i=0; i < names.length; i++) {
        properties[names[i]] = this.getProperty(names[i]);
      };
      return properties;
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "getHtml" : statics.getHtml,
      "setHtml" : statics.setHtml,

      "getAttribute" : statics.getAttribute,
      "setAttribute" : statics.setAttribute,
      "getAttributes" : statics.getAttributes,
      "setAttributes" : statics.setAttributes,
      
      
      "getProperty" : statics.getProperty,
      "setProperty" : statics.setProperty,
      "getProperties" : statics.getProperties,
      "setProperties" : statics.setProperties
    });
  }
});
