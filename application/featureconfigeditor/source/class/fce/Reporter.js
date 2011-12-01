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
 * Provides backend communication with a report server. The current client's
 * user agent and environment features map are sent to the server. If the server
 * already has data for this user agent, the server data is compared to the
 * detected data to find any discrepancies which could indicate a regression
 * in qooxdoo's feature detection.
 */
qx.Class.define("fce.Reporter", {

  extend : qx.core.Object,

  statics :
  {
    /** Environment features matching any of these expressions will be ignored
     * when comparing server-side and detected feature maps **/
    IGNORED_FEATURES : [/^qx\./, /^plugin\./]
  },

  /**
   * @param server {String} Server host name
   *
   * @param addUrl {String} URL (relative to host name) where client environment
   * data is sent to be added to the database
   *
   * @param getUrl {String} URL (relative to host name) by which server-side
   * environment data is accessed
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

    /** Server URL for data insertion */
    addUrl :
    {
      init : null,
      nullable : true
    },

    /** Server URL for data access */
    getUrl :
    {
      init : null,
      nullable : true
    }
  },

  members :
  {
    __foundData : null,

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
      var req = new qx.io.request.Jsonp(url, "POST");
      req.setRequestData({data: jsonData});
      req.addListener("fail", function(ev) {
        this.error("Request failed!");
      }, this);
      req.addListener("timeout", function(ev) {
        this.error("Request timed out!");
      }, this);
      req.addListener("success", function(ev) {
        var response = ev.getTarget().getResponse();
        if (response.id) {
          this.info("Report saved. ID: " + response.id);
        }
        else {
          this.info("Report ignored to prevent duplicate entry.");
        }
      }, this);

      req.send();
    },

    /**
     * Compares the features detected for this client with server-side values
     *
     * @param foundData {Map} Map of detected environment features
     */
    compare : function(foundData)
    {
      this.__foundData = foundData;
      if (this.getGetUrl()) {
        this.getFeaturesFromServer();
      }
      else {
        this._sendReport(this.__foundData);
      }
    },

    /**
     * Sends this client's detected features to the server. If the server
     * already has an entry for this client, the detected values are compared
     * to the known server values
     */
    getFeaturesFromServer : function()
    {
      var userAgent = navigator.userAgent;
      var serverUrl = this.getServer() + this.getGetUrl();

      var req = new qx.io.request.Jsonp(serverUrl, "GET");
      req.setRequestData({useragent: userAgent});

      req.addListener("success", function(ev) {
        var serverData = ev.getTarget().getResponse();
        if (qx.lang.Object.getKeys(serverData).length == 0) {
          // Server doesn't know about this client yet
          this.debug("Sending this client's environment data to the server");
          this._sendReport(this.__foundData);
        }
        else {
          this._compareFeatureSets(serverData);
        }
      }, this);

      req.addListener("fail", function(ev) {
        this.error("Request failed with status",req.getStatus());
      }, this);

      req.addListener("timeout", function(ev) {
        this.error("Request timed out");
      }, this);

      req.send();
    },

    /**
     * Compares the given features map to the one detected for this client and
     * logs any keys with differing values.
     *
     * @param expected {Map} Expected data
     */
    _compareFeatureSets : function(expected)
    {
      if (!expected["browser.name"] || !this.__foundData["browser.name"]) {
        return;
      }

      var differing = [];

      for (var prop in this.__foundData) {
        if (this.isIgnored(prop)) {
          continue;
        }

        if (!expected.hasOwnProperty(prop)) {
          differing.push(prop);
          continue;
        }

        var expType = typeof expected[prop];
        var foundType = typeof this.__foundData[prop];
        if (expType !== foundType) {
          differing.push(prop);
          continue;
        }

        var expectedValue = expected[prop];
        var foundValue = this.__foundData[prop];

        if (foundValue instanceof Array) {
          if (foundValue.length !== expectedValue.length) {
            differing.push(prop);
            continue;
          }
          for (var i=0,l=foundValue.length; i<l; i++) {
            if (foundValue[i] !== expectedValue[i]) {
              differing.push(prop);
              continue;
            }
          }
        }
        else if (expType === "object") {
          for (var key in expectedValue) {
            if (!foundValue.hasOwnProperty(key) ||
              foundValue[key] !== expectedValue[key])
            {
              differing.push(prop);
              continue;
            }
          }
        }
        else if (expectedValue !== foundValue) {
          differing.push(prop);
        }
      }

      if (differing.length == 0) {
        this.info("No differences found");
      }

      for (var i=0, l=differing.length; i<l; i++) {
        var prop = differing[i];
        this.error(prop, "expected", expected[prop], "found", this.__foundData[prop]);
      }
    },

    /**
     * Checks whether the given environment key name should be ignored for
     * comparison purposes
     *
     * @param setting {String} Environment feature (setting) name
     * @return {Boolean} Whether the key should be ignored
     */
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