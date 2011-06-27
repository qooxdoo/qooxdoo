/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Sends arbitrary data to a server using a simple GET request.
 */
qx.Class.define("fce.Reporter", {

  extend : qx.core.Object,
  
  statics :
  {
    //IGNORED_FEATURES : ["qx.debug", "qx.revision", "qx.application", "qx.theme", "qx.allowUrlSettings"]
    IGNORED_FEATURES : [/^qx\./]
  },
  
  /**
   * 
   * @param serverUrl {String} Server URL
   * @param parameterName {String} Name of the URI parameter to be used for the data
   */
  construct : function(server, addUrl, getUrl)
  {
    this.base(arguments);
    if (server) {
      this.setServer(server);
    }
    if (addUrl) {
      this.setAddUrl(addUrl);
    }
    if (getUrl) {
      this.setGetUrl(getUrl);
    }
  },
  
  properties :
  {
    /** Server host name */
    server :
    {
      init : null,
      nullable : true
    },
    
    addUrl :
    {
      init : null,
      nullable : true
    },
    
    getUrl :
    {
      init : null,
      nullable : true
    }
  },
  
  members :
  {
    /**
     * Sends the given data to the server
     * 
     * @param data {var} Payload to send. Must be JSON-serializable, i.e. no 
     * qooxdoo objects
     */
    _sendReport : function(data)
    {
      if (this.getServer() === null || this.getAddUrl() === null) {
        throw new Error("Report server host or URL not specified!");
      }
      
      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Reporting result");
      }
      
      var jsonData = qx.lang.Json.stringify(data);
      var url = this.getServer() + this.getAddUrl();
      var req = new qx.io.remote.Request(url, "POST");
      req.setData(jsonData);
      req.setCrossDomain(true);
      req.addListener("failed", function(ev) {
        this.error("Request failed!");
      }, this);
      req.addListener("timeout", function(ev) {
        this.error("Request timed out!");
      }, this);
      req.addListener("completed", function(response) {
        if (response.getContent().id) {
          this.info("Report saved. ID: " + response.getContent().id);
        }
        else {
          this.info("Report ignored to prevent duplicate entry.");
        }
      }, this);
      
      req.send();
    },
    
    compare : function(detectedData)
    {
      this.__detectedData = detectedData;
      if (this.getGetUrl()) {
        this.getFeaturesFromServer();
      }
      else {
        this._sendReport(this.__detectedData);
      }
    },
    
    getFeaturesFromServer : function()
    {
      var userAgent = navigator.userAgent;
      var serverUrl = this.getServer() + this.getGetUrl();
      console.log("URL", serverUrl);
      
      var req = new qx.io.remote.Request(serverUrl, "GET", "application/json");
      req.setCrossDomain(true);
      req.setData("useragent=" + encodeURIComponent(userAgent));
      
      req.addListener("completed", function(response) {
        var serverData = response.getContent();
        if (qx.lang.Object.getKeys(serverData).length == 0) {
          // Server doesn't know about this client yet
          this.debug("Sending this client's environment data to the server");
          this._sendReport(this.__detectedData);
        }
        else {
          this._compareFeatureSets(serverData);
        }
      }, this);
      
      req.addListener("failed", function(ev) {
        this.error("Request failed with status",req.getStatus());
      }, this);
      
      req.addListener("timeout", function(ev) {
        this.error("Request timed out");
      }, this);
      
      req.send();
    },
    
    _compareFeatureSets : function(expected)
    {
      if (!expected["browser.name"] || !this.__detectedData["browser.name"]) {
        return;
      }
      
      var differing = [];
      
      for (var prop in expected) {
        if (this.__detectedData[prop] && !this.isIgnored(prop)) {
          if (expected[prop] !== this.__detectedData[prop]) {
            differing.push(prop);
          }
        }
      }
      
      if (differing.length == 0) {
        this.info("No differences found");
      }
      
      for (var i=0, l=differing.length; i<l; i++) {
        var prop = differing[i];
        this.error(prop, "expected", expected[prop], "found", this.__detectedData[prop]);
      }
    },
    
    isIgnored : function(setting)
    {
      var ignoreList = fce.Reporter.IGNORED_FEATURES;
      for (var i=0,l=ignoreList.length; i<l; i++) {
        if (ignoreList[i] instanceof RegExp) {
          return ignoreList[i].exec(setting);
        }
        if (setting === ignoreList[i]) {
          return true;
        }
      }
    }
  }
});