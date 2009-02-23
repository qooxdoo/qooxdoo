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
qx.Class.define("demobrowser.demo.data.store.Twitter", 
{
  extend : qx.data.store.Json,

  statics : {
    saveResult: function(result) {
      this.__result = result;
    }
  },

  construct : function(user)
  {
    var url = "http://twitter.com/statuses/user_timeline/" + user + ".json";
    this.base(arguments, url);
  },
  
  members :
  {
    _createRequest: function(url) {
      var loader = new qx.io2.ScriptLoader();
      url += "?callback=demobrowser.demo.data.store.Twitter.saveResult";
      loader.load(url, function(data) {
        this.__loaded();
      }, this);
    },
    
    
    __loaded: function() {
      var data = demobrowser.demo.data.store.Twitter.__result;
      
      if (data == undefined) {
        this.setState("failed");
        return;
      }
      
      // create the class
      this._createModelClass(data);
      // set the initial data
      this.setModel(this._setData(data));
              
      // fire complete event
      this.fireDataEvent("loaded", this.getModel());
    }
  }
});