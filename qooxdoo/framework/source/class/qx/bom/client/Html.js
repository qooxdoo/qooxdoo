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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Internal class which contains the checks used by {@link qx.core.Environment}.
 * All checks in here are marked as internal which means you should never use
 * them directly.
 * 
 * This class should contain all checks about HTML.
 * 
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Html", 
{
  statics:
  {
    /** 
     * Whether the client supports Web Workers.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if webworkers are supported
     */
    getWebWorker : function() {
      return window.Worker != null;
    },


    /** 
     * Whether the client supports Geo Location.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if geolocation supported
     */
    getGeoLocation : function() {
      return navigator.geolocation != null;
    },


    /** 
     * Whether the client supports audio.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if audio is supported
     */
    getAudio : function() {
      return window.Audio != null;
    },


    /** 
     * Whether the client supports video.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if video is supported
     */
    getVideo : function() {
      return window.Video !=null;
    },


    /** 
     * Whether the client supports local storage.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if local storage is supported
     */
    getLocalStorage : function() {
      return window.LocalStorage != null;
    },


    /** 
     * Whether the client supports session storage.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if session storage is supported
     */
    getSessionStorage : function() {
      return window.SessionStorage != null;
    },


    /**
     * Whether the browser supports CSS class lists.
     * https://developer.mozilla.org/en/DOM/element.classList
     * 
     * @internal
     * @return {Boolean} <code>true</code> if class list is supported.
     */
    getClassList : function() {
      return !!(document.documentElement.classList &&
        qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList"
      );
    },


    /**
     * Checks if XPath could be used.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if xpath is supported.
     */
    getXPath : function() {
      return !!document.evaluate;
    },


    /**
     * Checks if XUL could be used.
     * 
     * @internal
     * @return {Boolean} <code>true</code> if XUL is supported.
     */
    getXUL : function() {
      try {
        document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
        return true;
      } catch (e) {
        return false;
      }
    },


    /**
     * Checks if SVG could be used
     * 
     * @internal
     * @return {Boolean} <code>true</code> if SVG is supported.
     */
    getSVG : function() {
      return document.implementation && document.implementation.hasFeature &&
        (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") ||
        document.implementation.hasFeature(
          "http://www.w3.org/TR/SVG11/feature#BasicStructure",
          "1.1"
        )
      );
    },


    /**
     * Checks if VML could be used
     * 
     * @internal
     * @return {Boolean} <code>true</code> if VML is supported.
     */
    getVML : function() {
      return qx.bom.client.Engine.getName() == "mshtml";
    },


    /**
     * Checks if canvas could be used
     * 
     * @internal
     * @return {Boolean} <code>true</code> if canvas is supported.
     */
    getCanvas : function() {
      return !!window.CanvasRenderingContext2D;
    },


    /**
     * Asynchronous check for using data urls.
     * 
     * @internal
     * @param callback {Function} The function which should be executed as 
     *   soon as the check is done.
     */
    getDataUrl : function(callback) {
      var data = new Image();
      data.onload = data.onerror = function() {
        // wrap that into a timeout because IE might execute it synchronously
        window.setTimeout(function() {
          callback.call(null, (data.width == 1 && data.height == 1));
        }, 0);
      }
      data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";      
    }
  }
});
