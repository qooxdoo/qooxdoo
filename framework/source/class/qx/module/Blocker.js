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
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#require(qx.module.Environment)
#require(qx.module.Manipulating)
#require(qx.module.Traversing)
#require(qx.module.Css)
#require(qx.module.Attribute)
************************************************************************ */

/**
 * Provides a way to block elements so they will no longer receive (native)
 * events by overlaying them with a div.
 * For Internet Explorer, an additional Iframe element will be overlayed since
 * native form controls cannot be blocked otherwise.
 *
 * The blocker can also be applied to the entire document, e.g.:
 *
 * <pre class="javascript">
 * q(document).block();
 * </pre>
 */
q.define("qx.module.Blocker", {
  statics :
  {
    /**
     * Attaches a blocker div (and additionally a blocker Iframe for IE) to the
     * given element.
     *
     * @param item {DOMElement|DOMDocument} The element to be overlaid with the blocker
     * @param color {String} The color for the blocker element (any CSS color value)
     * @param opacity {Number} The CSS opacity value for the blocker
     * @param zIndex {Number} The zIndex value for the blocker
     */
    __attachBlocker : function(item, color, opacity, zIndex)
    {
      var win = q.getWindow(item);
      var isDocument = q.isDocument(item);

      if (!item.__blocker) {
        item.__blocker = {
          div : q.create("<div/>")
        };
        if ((q.env.get("engine.name") == "mshtml")) {
          item.__blocker.iframe = qx.module.Blocker.__getIframeElement(win)
        }
      }

      qx.module.Blocker.__styleBlocker(item, color, opacity, zIndex, isDocument);

      item.__blocker.div.appendTo(win.document.body);
      if (item.__blocker.iframe) {
        item.__blocker.iframe.appendTo(win.document.body);
      }

      if (isDocument) {
        q(win).on("resize", qx.module.Blocker.__onWindowResize);
      }
    },


    /**
     * Styles the blocker element(s)
     *
     * @param item {DOMElement|DOMDocument} The element to be overlaid with the blocker
     * @param color {String} The color for the blocker element (any CSS color value)
     * @param opacity {Number} The CSS opacity value for the blocker
     * @param zIndex {Number} The zIndex value for the blocker
     * @param isDocument {Boolean} Whether the item is a document node
     */
    __styleBlocker : function(item, color, opacity, zIndex, isDocument)
    {
      var qItem = q(item);

      var styles = {
        "zIndex" : zIndex,
        "display" : "block",
        "position" : "absolute",
        "backgroundColor" : color,
        "opacity" : opacity,
        "width" : qItem.getWidth() + "px",
        "height" : qItem.getHeight() + "px"
      };

      if (isDocument) {
        styles.top = 0 + "px";
        styles.left = 0 + "px";
      }
      else {
        var pos = qItem.getOffset();
        styles.top = pos.top + "px";
        styles.left = pos.left + "px";
      }
      item.__blocker.div.setStyles(styles);

      if (item.__blocker.iframe) {
        styles.zIndex = styles.zIndex - 1;
        styles.backgroundColor = "transparent";
        styles.opacity = 0;
        item.__blocker.iframe.setStyles(styles);
      }
    },


    /**
     * Creates an iframe element used as a blocker in IE
     *
     * @param win {Window} The parent window of the item to be blocked
     * @return {Iframe} Iframe blocker
     */
    __getIframeElement : function(win)
    {
      var iframe = q.create('<iframe></iframe>');
      iframe.setAttributes({
        frameBorder: 0,
        frameSpacing: 0,
        marginWidth: 0,
        marginHeight: 0,
        hspace: 0,
        vspace: 0,
        border: 0,
        allowTransparency: false,
        src : "javascript:false"
      });

      return iframe;
    },


    /**
     * Callback for the Window's resize event. Applies the window's new sizes
     * to the blocker element(s).
     *
     * @param ev {Event} resize event
     */
    __onWindowResize : function(ev) {
      var win = this[0];
      var size = {
        width : this.getWidth() + "px",
        height : this.getHeight() + "px"
      }
      q(win.document.__blocker.div).setStyles(size);
      if (win.document.__blocker.iframe) {
        q(win.document.__blocker.iframe).setStyles(size);
      }
    },


    /**
     * Removes the given item's blocker element(s) from the DOM
     *
     * @param item {DOMElement} Blocked element
     * @param index {Number} index of the item in the collection
     */
    __detachBlocker : function(item, index)
    {
      if (!item.__blocker) {
        return;
      }
      item.__blocker.div.remove();
      if (item.__blocker.iframe) {
        item.__blocker.iframe.remove();
      }
      if (q.isDocument(item)) {
        q(q.getWindow(item))
        .off("resize", qx.module.Blocker.__onWindowResize);
      }
    },


    /**
     * Adds an overlay to all items in the collection that intercepts mouse
     * events.
     *
     * @attach {q}
     * @param color {String ? transparent} The color for the blocker element (any CSS color value)
     * @param opacity {Float ? 0} The CSS opacity value for the blocker
     * @param zIndex {Number ? 10000} The zIndex value for the blocker
     * @return {q} The collection for chaining
     */
    block : function(color, opacity, zIndex)
    {
      if (!this[0]) {
        return this;
      }

      color = color || "transparent";
      opacity = opacity || 0;
      zIndex = zIndex || 10000;

      this.forEach(function(item, index) {
        qx.module.Blocker.__attachBlocker(item, color, opacity, zIndex);
      });

      return this;
    },


    /**
     * Removes the blockers from all items in the collection
     *
     * @attach {q}
     * @return {q} The collection for chaining
     */
    unblock : function()
    {
      if (!this[0]) {
        return this;
      }

      this.forEach(qx.module.Blocker.__detachBlocker);

      return this;
    }
  },


  defer : function(statics)
  {
    q.$attach({
      "block" : statics.block,
      "unblock" : statics.unblock
    });
  }
});