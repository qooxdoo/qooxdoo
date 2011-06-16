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
  
  /**
   * 
   * @param serverUrl {String} Server URL
   * @param parameterName {String} Name of the URI parameter to be used for the data
   */
  construct : function(serverUrl, parameterName)
  {
    this.base(arguments);
    if (serverUrl) {
      this.setServerUrl(serverUrl);
    }
    if (parameterName) {
      this.setParameterName(parameterName);
    }
  },
  
  properties :
  {
    /** URI parameter for the data */
    parameterName :
    {
      init : null,
      nullable : true
    },
    
    /** Server URL */
    serverUrl :
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
    sendReport : function(data)
    {
      if (this.getServerUrl() === null || this.getParameterName() === null) {
        throw new Error("Report server URL or URL parameter name not specified!");
      }
      
      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Reporting result");
      }
      
      var jsonData = qx.lang.Json.stringify(data);

      var req = new qx.io.remote.Request(this.getServerUrl(), "POST");
      req.setData(this.getParameterName() + "=" + jsonData);
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
    }
  }
});