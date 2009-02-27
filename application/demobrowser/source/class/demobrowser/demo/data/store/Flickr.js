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
qx.Class.define("demobrowser.demo.data.store.Flickr", 
{
  extend : qx.data.store.Json,

  statics : {
    RESULT : null
  },

  construct : function(tag)
  {
    // store a global function
    jsonFlickrApi = function(data) {
      demobrowser.demo.data.store.Flickr.RESULT = data;
    }
    
    var url = "http://api.flickr.com/services/rest/?tags=" + tag;
    this.base(arguments, url);
  },
  
  members :
  {
    
    searchForTag: function(tag) {
      if (tag != "") {
        this.setUrl("http://api.flickr.com/services/rest/?tags=" + tag);        
      }
    },
    
    _createRequest: function(url) {
      var loader = new qx.io2.ScriptLoader();
      this.setState("receiving");
      url += "&method=flickr.photos.search&api_key=63a8042eead205f7e0040f488c02afd9&format=json";
      loader.load(url, function(data) {
        this.__loaded();
      }, this);
    },
    
    
    __loaded: function() {
      this.setState("completed");
      var data = demobrowser.demo.data.store.Flickr.RESULT;
      
      if (data == undefined) {
        this.setState("failed");
        return;
      }
      
      // create the class
      this._marshaler.jsonToClass(data);
      // set the initial data
      this.setModel(this._marshaler.jsonToModel(data));
              
      // fire complete event
      this.fireDataEvent("loaded", this.getModel());
    }
  }
});
