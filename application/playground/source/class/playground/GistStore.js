/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("playground.GistStore", {
  extend : qx.data.store.Json,
  construct : function(username) {
    var url = "http://gist.github.com/api/v1/json/gists/" + username;
 
    var delegate ={manipulateData: function(data) {
      if (!data.gists) data = {gists: []};
      for (var i = 0; i < data.gists.length; i++) {
        data.gists[i].text = null;
      }
      return data.gists;
    }};
 
    this.base(arguments, username == null ? null : url, delegate);
  },
  
  events: {
    "done" : "qx.event.type.Event" 
  },
  
  members : {
    //overridden
    reload : function(username) 
    {
      var url = "http://gist.github.com/api/v1/json/gists/" + username;
      this.setUrl(url);
    },
    
    
    //overridden
    _createRequest: function(url) {
      // create the request
      this.__request = new qx.io.remote.Request(
        url, "GET"
      );

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(this.__request);
      }

      this.__request.addListener(
        "completed", this.__completeHandler, this
      );
      // mapp the state to its own state
      this.__request.addListener("changeState", function(ev) {
        this.setState(ev.getData());
      }, this);

      this.__request.send();
    },
    
    
    /**
     * Handler for the completion of the requests. It invokes the creation of
     * the needed classes and instances for the fetched data using
     * {@link qx.data.marshal.Json}.
     *
     * @param ev {qx.io.remote.Response} The event fired by the request.
     */
    __completeHandler : function(ev)
    {
      var data = ev.getContent();

      if (data != "error") {
        data = qx.util.Json.parse(data);
      } else {
        this.setModel(new qx.data.Array());
        this.setState("failed");
        // fire complete event
        this.fireDataEvent("loaded", this.getModel());
        return;
      }

      // check for the data manipulation hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.manipulateData)) {
        data = this._delegate.manipulateData(data);
      }

      // create the class
      this._marshaler.toClass(data, false);
      // set the initial data
      this.setModel(this._marshaler.toModel(data));

      // load the content of the gists
      this.__loadGists();      
    },
    
    
    __loadGists : function() {
      var gists = this.getModel();
      var l = gists.getLength();
      for (var i = 0; i < l; i++) {
        var cameBack = 0;
        var gist = gists.getItem(i);
        var url = "http://gist.github.com/" + gist.getRepo() + ".txt";
        var request = new qx.io.remote.Request(
          url, "GET", "text/plain"
        );
        request.addListener("completed", qx.lang.Function.bind(function(i, e) {
          var data = e.getContent();
          gists.getItem(i).setText(data);
          cameBack++;
          if (cameBack == l) {
            this.fireDataEvent("loaded", this.getModel());
          }
        }, this, i));
        request.send();
      }
      if (gists.getLength() == 0) {
        this.fireDataEvent("loaded", this.getModel());
      }      
    }  
  }
});