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
    this.__marshaler = new qx.data.marshal.Json(delegate);
   
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
    
    
    __requestCompleteHandler : function(ev) 
    {
        var data = ev.getContent();
        // create the class
        this.__marshaler.jsonToClass(data);
        // set the initial data
        this.setModel(this.__marshaler.jsonToModel(data));
                
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
