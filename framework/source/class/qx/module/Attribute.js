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
      return this;
    },


    setAttribute : function(name, value) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Attribute.set(this[i], name, value);
      };
      return this;
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
      return this;
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
      return this;
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
      return this;
    },


    getProperties : function(names) {
      var properties = {};
      for (var i=0; i < names.length; i++) {
        properties[names[i]] = this.getProperty(names[i]);
      };
      return properties;
    },


    getValue : function() {
      if (this[0]) {
        return qx.bom.Input.getValue(this[0]);
      }
      return null;
    },


    setValue : function(value)
    {
      for (var i=0, l=this.length; i<l; i++) {
        qx.bom.Input.setValue(this[i], value);
      }
      
      return this;
    }
  },


  defer : function(statics) {
    q.attach({
      "getHtml" : statics.getHtml,
      "setHtml" : statics.setHtml,

      "getAttribute" : statics.getAttribute,
      "setAttribute" : statics.setAttribute,
      "getAttributes" : statics.getAttributes,
      "setAttributes" : statics.setAttributes,

      "getProperty" : statics.getProperty,
      "setProperty" : statics.setProperty,
      "getProperties" : statics.getProperties,
      "setProperties" : statics.setProperties,
      
      "getValue" : statics.getValue,
      "setValue" : statics.setValue
    });
  }
});
