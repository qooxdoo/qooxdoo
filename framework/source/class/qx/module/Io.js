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
/* ************************************************************************
#require(qx.bom.request.Xhr#open)
************************************************************************ */
/**
 * This module provides basic IO functionality. It contains three ways to load
 * data:
 *
 * * XMLHttpRequest: {@link #xhr}
 * * Script tag: {@link #script}
 * * Script tag using JSONP: {@link #jsonp}
 */
qx.Bootstrap.define("qx.module.Io", {
  statics :
  {
    /**
     * Returns a configured XMLHttpRequest object. Using the send method will
     * finally send the request.
     *
     * @param url {String} Mandatory URL to load the data from.
     * @param settings {Map?} Optional settings map which may contain one of
     *   the following settings:
     *
     * * <code>method</code> The method of the request. Default: <pre>GET</pre>
     * * <code>async</code> flag to mark the request as asynchronous. Default: <pre>true</pre>
     * * <code>header</code> A map of request headers.
     *
     * @attachStatic {q, io.xhr}
     * @return {qx.bom.request.Xhr} The request object.
     */
    xhr : function(url, settings) {
      if (!settings) {
        settings = {};
      }
      var xhr = new qx.bom.request.Xhr();
      xhr.open(settings.method, url, settings.async);
      if (settings.header) {
        var header = settings.header;
        for (var key in header) {
          xhr.setRequestHeader(key, header[key]);
        }
      }
      return xhr;
    },


    /**
     * Returns a predefined script tag wrapper which can be used to load data
     * from cross-domain origins.
     *
     * @param url {String} Mandatory URL to load the data from.
     * @attachStatic {q, io.script}
     * @return {qx.bom.request.Script} The request object.
     */
    script : function(url) {
      var script = new qx.bom.request.Script();
      script.open("get", url);
      return script;
    },


    /**
     * Returns a predefined script tag wrapper which can be used to load data
     * from cross-domain origins via JSONP.
     *
     * @param url {String} Mandatory URL to load the data from.
     * @param settings {Map?} Optional settings map which may contain one of
     *   the following settings:
     *
     * * <code>callbackName</code>: The name of the callback which will
     *      be called by the loaded script.
     * * <code>callbackParam</code>: The name of the callback expected by the server
     * @attachStatic {q, io.jsonp}
     * @return {qx.bom.request.Jsonp} The request object.
     */
    jsonp : function(url, settings) {
      var script = new qx.bom.request.Jsonp();
      if (settings && settings.callbackName) {
        script.setCallbackName(settings.callbackName);
      }
      if (settings && settings.callbackParam) {
        script.setCallbackParam(settings.callbackParam);
      }
      script.setPrefix("q.$$"); // needed in case no callback name is given
      script.open("get", url);
      return script;
    }
  },


  defer : function(statics) {
    q.$attachStatic({
      io : {
        xhr : statics.xhr,
        script : statics.script,
        jsonp : statics.jsonp
      }
    });
  }
});