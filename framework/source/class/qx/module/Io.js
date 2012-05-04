/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Module to offer basic io. It contains three ways to load data acros browsers:
 *
 * * XMLHttpRequest: {@link #xhr}
 * * Script tag: {@link #script}
 * * Script tag using JSONP: {@link #jsonp}
 */
qx.Bootstrap.define("qx.module.Io", {
  statics :
  {
    /**
     * Method to get a defined XMLHttpRequest. Using the send method will finally
     * send the request.
     *
     * @param url {String} The mandatory URL to load the data from.
     * @param settings {Map?} The optional settings map which may contain one of
     *   the following settings:
     *
     * * <code>method</code> The method of the request which will fallback to 'get'
     * * <code>async</code> flag to mark the request as async which will be true by default
     * * <code>header</code> A map of request header.
     *
     * @return {qx.bom.request.Xhr} The request object.
     */
    xhr : function(url, settings) {
      if (!settings) {
        settings = {};
      }
      var xhr = new qx.bom.request.Xhr();
      if (settings.header) {
        var header = settings.header;
        for (var key in header) {
          xhr.setRequestHeader(key, header[key]);
        }
      }
      xhr.open(settings.method, url, settings.async);
      return xhr;
    },


    /**
     * Returns a predefined script tag wrapper which can be used to load data.
     *
     * @param url {String} The mandatory URL to load the data from.
     * @return {qx.bom.request.Script} The request object.
     */
    script : function(url) {
      var script = new qx.bom.request.Script();
      script.open("get", url);
      return script;
    },


    /**
     * Returns a predefined script tag wrapper which can be used to load data via JSONP.
     *
     * @param url {String} The mandatory URL to load the data from.
     * @param settings {Map?} The optional settings map which may contain one of
     *   the following settings:
     *
     * * <code>callbackName</code>: The name of the callback which will
     *      be called by the loaded script.
     * * <code>callbackParam</code>: The name of the parameter the server expects
     *      the name of the callback.
     * @return {qx.bom.request.Script} The request object.
     */
    jsonp : function(url, settings) {
      var script = new qx.bom.request.Jsonp();
      if (settings.callbackName) {
        script.setCallbackName(settings.callbackName);
      }
      if (settings.callbackParam) {
        script.setCallbackParam(settings.callbackParam);
      }
      script.open("get", url);
      return script;
    }
  },


  defer : function(statics) {
    q.attachStatic({
      io : {
        xhr : statics.xhr,
        script : statics.script,
        jsonp : statics.jsonp
      }
    });
  }
});