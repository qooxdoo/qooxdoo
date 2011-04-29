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
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Bootstrap.define("qx.bom.request.Script",
{

  construct : function()
  {
    this.__onNativeLoadBound = qx.Bootstrap.bind(this.__onNativeLoad, this);
    this.__onNativeErrorBound = qx.Bootstrap.bind(this.__onNativeError, this);

    this.__headElement = document.head || document.getElementsByTagName( "head" )[0] ||
                         document.documentElement;
  },

  members :
  {

    timeout: 0,

    open: function(method, url) {
      this.__url = url;
    },

    send: function() {
      var script = this.__scriptElement = document.createElement("script"),
          head = this.__headElement,
          that = this;

      script.src = this.__url;

      if (this.timeout > 0) {
        this.__timeoutId = window.setTimeout(function() {
          that.ontimeout();
          that.__removeScriptElement();
        }, this.timeout);
      }
      head.insertBefore(script, head.firstChild);

      script.onload = this.__onNativeLoadBound;
      script.onerror = this.__onNativeErrorBound;
    },

    onload: function() {},

    onerror: function() {},

    ontimeout: function() {},

    dispose: function() {
      if (!this.__disposed) {

        this.__removeScriptElement();

        this.__disposed = true;
      }
    },

    _getUrl: function() {
      return this.__url;
    },

    _getScriptElement: function() {
      return this.__scriptElement;
    },

    __url: "",

    __onNativeLoadBound: null,
    __onNativeErrorBound: null,

    __timeoutId: null,

    __disposed: null,

    __onNativeLoad: function(e) {
      this.__removeScriptElement();
      this.onload();
    },

    __onNativeError: function() {
      this.__removeScriptElement();
      this.onerror();
    },

    __onCompleted: function() {

    },

    __removeScriptElement: function() {
      if (this.__scriptElement && this.__scriptElement.parentNode) {
        this.__headElement.removeChild(this.__scriptElement);
      }
    }
  }
});
