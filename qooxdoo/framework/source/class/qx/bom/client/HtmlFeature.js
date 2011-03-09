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
qx.Bootstrap.define("qx.bom.client.HtmlFeature", 
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
    }
  }
});
