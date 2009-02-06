/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */


qx.Class.define("qx.data.store.Json", 
{
  extend : qx.core.Object,


  construct : function(url)
  {
    this.base(arguments);
    
    
    // classes hashmap
    this.__classHashMap = {};
   
    // create the request
    this.__request = new qx.io.remote.Request(url, "POST", "application/json");
    // this.__request.setTimeout(3 * 1000);
    this.__request.addListener("completed", this.__requestCompleteHandler, this);
    this.__request.addListener("failed", this.__requestFailHandler, this);
    this.__request.addListener("timeout", this.__requestFailHandler, this);
    this.__request.send();  
  },
  
  
  events : 
  {
    "loaded": "qx.event.type.Data",
    "failed": "qx.event.type.Event"
  },
  
  
  properties : 
  {  
    model : {
      nullable: true,
      event: "changeModel"
    }
  },

  members :
  {
    
    __createDataHash: function(data) {
      var properties = [];
      for (var key in data) {
        properties.push(key);
      }
      return properties.sort().join(" ");
    },
    
    
    _createModelClass: function(data) {
      // get the proper type
      var type = Object.prototype.toString.call(data).slice(8, -1);
      // break on all primitive json types
      if (type == "String" || type == "Number" || type == "Boolean" || data == null) {
        return;
      }
      
      var hash = this.__createDataHash(data);
      if (qx.lang.Object.contains(this.__classHashMap, hash)) {
        return;
      }
      
      var properties = {};
      for (var key in data) {
        if (data[key] instanceof Array) {
          for (var i = 0; i < data[key].length; i++) {
            this._createModelClass(data[key][i]);
          }
        } else if (data[key] instanceof Object) {
          this._createModelClass(data[key]);
        }
        
        properties[key] = {};
        properties[key].nullable = true;
        properties[key].event = "change" + qx.lang.String.firstUp(key);
      }
      
      var newClass = {
          extend : qx.core.Object,          
          properties : properties 
      };

      qx.Class.define("qx.data.model." + hash, newClass);
      
      this.__classHashMap[hash] = qx.Class.getByName("qx.data.model." + hash);
    },

    
    __createInstance: function(hash) {
      return (new this.__classHashMap[hash]());
    },

    
    _setData: function(data) {   
      var type = Object.prototype.toString.call(data).slice(8, -1);
      if (type == "Number" || type == "String" || type == "Boolean" || data == null) {
        return data;
        
      } else if (type == "Array") {
        var array = new qx.data.Array();
        for (var i = 0; i < data.length; i++) {
          array.push(this._setData(data[i]));
        }
        return array;
        
      } else if (type == "Object") {
        // create an instance for the object
        var hash = this.__createDataHash(data);
        var model = this.__createInstance(hash);
        
        // go threw all element in the data
        for (var key in data) {
          model["set" + qx.lang.String.firstUp(key)](this._setData(data[key]));
        }
        return model;
      }
      
      throw new Error("Unsupported type!");
    },
    
    
    __requestCompleteHandler : function(e) 
    {
        var data = e.getContent();
        // create the class
        this._createModelClass(data);
        // set the initial data
        this.setModel(this._setData(data));
                
        // fire complete event
        this.fireDataEvent("loaded", this.getModel());
    },
    
    
    __requestFailHandler: function(ev) {
      this.fireEvent("failed", qx.event.type.Event);
    }
  }
});
