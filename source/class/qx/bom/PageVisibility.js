/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class offers a constant API over the Page Visibility Spec:
 * http://www.w3.org/TR/page-visibility/
 *
 * It forwards all the browsers support and provides always a fallback which is
 * of course visible all the time.
 */
qx.Bootstrap.define("qx.bom.PageVisibility",
{
  extend : qx.event.Emitter,

  statics : {
    /**
     * Get an instance of the PageVisibility object using the default document.
     * @return {qx.bom.PageVisibility} An instance of this class.
     */
    getInstance : function() {
      if (!this.$$instance) {
        this.$$instance = new qx.bom.PageVisibility();
      }
      return this.$$instance;
    }
  },


  /**
   * @param document {document?} Optional document element.
   */
  construct : function(document) {
    this.__doc = document || window.document;

    this.__checkAttributeNames();

    var self = this;
    // forward the event
    qx.bom.Event.addNativeListener(this.__doc, this.__eventName, function(e) {
      self.emit("change", e);
    });
  },

  events : {
    /**
     * The change event for the page visibility.
     */
    "change" : "Event"
  },

  members :
  {
    __doc : null,
    __hiddenAttr : null,
    __visibilityAttr : null,
    __eventName : null,


    /**
     * Internal helper to feature check the attribute names and the event name.
     * As the event can not be detected using the on<name> attribute, we need
     * to guess the event name by checking for the hidden attribute.
     */
    __checkAttributeNames : function() {
      var prefix = qx.bom.Style.VENDOR_PREFIXES;

      // check for the hidden attribute name
      for (var i=0; i < prefix.length; i++) {
        var attr = prefix[i].toLowerCase() + "Hidden";
        if (this.__doc[attr] != undefined) {
          this.__hiddenAttr = attr;
          // also use the same prefix for the event name
          this.__eventName = prefix[i].toLowerCase() + "visibilitychange";
          break;
        }
      };

      // check for the visibilityState attribute name
      for (var i=0; i < prefix.length; i++) {
        var attr = prefix[i].toLowerCase() + "VisibilityState";
        if (this.__doc[attr] != undefined) {
          this.__visibilityAttr = attr;
          break;
        }
      };

      // use the non prefixed if not supported prefixed
      if (this.__hiddenAttr == null) {
        this.__hiddenAttr = "hidden";
        this.__eventName = "visibilitychange";
      }
      if (this.__visibilityAttr == null) {
        this.__visibilityAttr = "visibilityState";
      }
    },


    /**
     * Returns weather the page is hidden or not. If we can not detect it,
     * <code>false</code> will always be returned.
     *
     * @return {Boolean} <code>true</code>, if the page is hidden
     */
    isHidden : function() {
      return !!this.__doc[this.__hiddenAttr];
    },


    /**
     * Returns the visibility state of the page. If we can not detect it,
     * <code>"visible"</code> will always be returned.
     *
     * @return {String} The state of the page visibility.
     */
    getVisibilityState : function() {
      return this.__doc[this.__visibilityAttr] || "visible";
    }
  }
});