/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */

/**
 *
 * This class offers a constant API over the Fullscreen Spec:
 * http://www.w3.org/TR/fullscreen/
 *
 * It forwards all the browsers support if supported.
 *
 * *Example*
 *
 * <pre class="javascript">
 * var fs = qx.bom.FullScreen.getInstance();
 *
 * var button = new qx.ui.form.Button("Toggle fullscreen");
 * button.addListener("execute", function() {
 *   if (fs.isFullScreen()) {
 *     fs.cancel();
 *   } else {
 *     fs.request();
 *   }
 * });
 *
 * // Enable button if toggling is supported
 * button.setEnabled(qx.core.Environment.get("html.fullscreen"));
 *
 * </pre>
 *
 * *Note*
 *
 * A fullscreen request will only be handled from within an interactive
 * event handler. So there is most likely a mouse or key event involved
 * to trigger it properly.
 */
qx.Bootstrap.define("qx.bom.FullScreen",
{
  extend : qx.event.Emitter,

  statics : {

    /**
     * Get an instance of the FullScreen object using the default document.
     * @return {qx.bom.FullScreen} An instance of this class.
     */
    getInstance : function() {
      if (!this.$$instance) {
        this.$$instance = new qx.bom.FullScreen();
      }
      return this.$$instance;
    }

  },


  /**
   * @param element {Element?} Optional element to show fullscreen.
   */
  construct : function(element) {
    this.__doc = element || window.document;

    this.__checkAttributeNames();

    var self = this;
    // forward the event
    qx.bom.Event.addNativeListener(this.__doc, this.__eventName, function(e) {
      self.emit("change", e);
    });
  },


  events : {
    /**
     * The change event for the fullscreen mode.
     */
    "change" : "Event"
  },


  members :
  {
    __doc : null,
    __fullscreenElementAttr : "fullscreenElement",
    __requestMethodName : "requestFullscreen",
    __cancelMethodName : "cancelFullscreen",
    __eventName : "fullscreenchange",


    /**
     * Internal helper to feature check the attribute names and the event name.
     * As the event can not be detected using the on<name> attribute, we need
     * to guess the event name by checking for the hidden attribute.
     */
    __checkAttributeNames : function() {
      var prefix = qx.bom.Style.VENDOR_PREFIXES;

      // check for the hidden attribute name
      for (var i=0; i < prefix.length; i++) {
        var pfix = prefix[i].toLowerCase();

        if (this.__doc[pfix + "FullScreenElement"] !== undefined ||
            this.__doc[pfix + "FullscreenElement"] !== undefined) {
          this.__eventName = pfix + "fullscreenchange";

          if (pfix == "moz") {
            this.__fullscreenElementAttr = pfix + "FullScreenElement";
            this.__requestMethodName =  pfix + "RequestFullScreen";
          } else {
            this.__fullscreenElementAttr = pfix + "FullscreenElement";
            this.__requestMethodName =  pfix + "RequestFullscreen";
          }

          break;
        }
      }

      // Doh. This needs some upstream consistency though...
      if (this.__doc[pfix + "CancelFullScreen"]) {
        this.__cancelMethodName =  pfix + "CancelFullScreen";
      } else if (this.__doc[pfix + "CancelFullscreen"]) {
        this.__cancelMethodName =  pfix + "CancelFullscreen";
      } else if (this.__doc[pfix + "ExitFullScreen"]) {
        this.__cancelMethodName =  pfix + "ExitFullScreen";
      } else if (this.__doc[pfix + "ExitFullscreen"]) {
        this.__cancelMethodName =  pfix + "ExitFullscreen";
      } else if (this.__doc["exitFullscreen"]) {
        this.__cancelMethodName = "exitFullscreen";
      }

    },


    /**
     * Returns whether the page is shown in fullscreen mode or not. If we
     * can not detect it, <code>false</code> will always be returned.
     *
     * @return {Boolean} <code>true</code>, if the page is shown fullscreen
     */
    isFullScreen : function() {
      return this.__doc[this.__fullscreenElementAttr] !== undefined ?
             !!this.__doc[this.__fullscreenElementAttr] : false;
    },


    /**
     * Request the page to be shown in fullscreen mode. Note that this
     * is only possible when called from within an interactive event
     * handler.
     *
     * It's also worth a note that the user may deny fullscreen mode,
     * so there is no guarantee that it really worked.
     */
    request : function() {
      if (this.__doc.documentElement[this.__requestMethodName]) {
        this.__doc.documentElement[this.__requestMethodName]();
      }
    },


    /**
     * End the fullscreen mode.
     */
    cancel : function() {
      if (this.__doc[this.__cancelMethodName]) {
        this.__doc[this.__cancelMethodName]();
      }
    }
  }
});
