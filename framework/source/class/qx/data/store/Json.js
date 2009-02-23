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

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.data.store.Json", 
{
  extend : qx.core.Object,


  construct : function(url, delegate)
  {
    this.base(arguments);
   
    // store the delegate
    this.__delegate = delegate;
   
    if (url != null) {
      this.setUrl(url);
    }
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
    },
    
    state : {
      check : [ 
        "configured", "queued", "sending", "receiving", 
        "completed", "aborted", "timeout", "failed"
      ],
      init : "configured",
      event : "changeState"
    },
    
    url : {
      check: "String",
      apply: "_applyUrl",
      event: "changeUrl"
    }  
  },

  members :
  {
    
    _applyUrl: function(value, old) {
      if (value != null) {
        this._createRequest(value);
      }
    },
    
    
    _createRequest: function(url) {
      // create the request
      this.__request = new qx.io.remote.Request(
        url, "POST", "application/json"
      );
      this.__request.addListener(
        "completed", this.__requestCompleteHandler, this
      );
      this.__request.addListener("failed", this.__requestFailedHandler, this);
      this.__request.addListener("changeState", function(ev) {
        this.setState(ev.getData());
      }, this);

      this.__request.send();
    },
    
    
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
      if (
        type == "String" 
        || type == "Number" 
        || type == "Boolean" 
        || data == null
      ) {
        return;
      }
      
      var hash = this.__createDataHash(data);
      // class is defined by the model
      if (
        this.__delegate 
        && this.__delegate.getModelClass 
        && this.__delegate.getModelClass(hash) != null
      ) {
        return;
      }
      // class already exists
      if (qx.Class.isDefined("qx.data.model." + hash)) {
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
      
      // try to get the superclass, qx.core.Object as default
      if (this.__delegate && this.__delegate.getModelSuperClass) {
        var superClass = 
          this.__delegate.getModelSuperClass(hash) || qx.core.Object;
      } else {
        var superClass = qx.core.Object;        
      }
      
      // try to get the mixins
      var mixins;
      if (this.__delegate && this.__delegate.getModelMixins) {
        mixins = this.__delegate.getModelMixins(hash);
      }
      if (mixins == null) {
        mixins = [];
      }
      
      var newClass = {
          extend : superClass,
          include : mixins,
          properties : properties 
      };

      qx.Class.define("qx.data.model." + hash, newClass);
    },

    
    __createInstance: function(hash) {
      var delegateClass;
      // get the class from the delegate
      if (this.__delegate && this.__delegate.getModelClass) {
        delegateClass = this.__delegate.getModelClass(hash);        
      }
      if (delegateClass != null) {
        return (new delegateClass());
      } else {
        var clazz = qx.Class.getByName("qx.data.model." + hash);
        return (new clazz());        
      }
    },


    _getData: function(data) {   
      var type = Object.prototype.toString.call(data).slice(8, -1);
      if (
        type == "Number" 
        || type == "String" 
        || type == "Boolean" 
        || data == null
      ) {
        return data;
        
      } else if (type == "Array") {
        var array = new qx.data.Array();
        for (var i = 0; i < data.length; i++) {
          array.push(this._getData(data[i]));
        }
        return array;
        
      } else if (type == "Object") {
        // create an instance for the object
        var hash = this.__createDataHash(data);
        var model = this.__createInstance(hash);
        
        // go threw all element in the data
        for (var key in data) {
          model["set" + qx.lang.String.firstUp(key)](this._getData(data[key]));
        }
        return model;
      }
      
      throw new Error("Unsupported type!");
    },
    
    
    __requestCompleteHandler : function(ev) 
    {
        var data = ev.getContent();
        // create the class
        this._createModelClass(data);
        // set the initial data
        this.setModel(this._getData(data));
                
        // fire complete event
        this.fireDataEvent("loaded", this.getModel());
    },
    
    __requestFailedHandler: function(ev) {
      this.fireEvent("failed");
    },
    
    
    reload: function() {
      var url = this.getUrl();
      if (url != null) {
        this._createRequest(url);        
      }
    }
  }
});
