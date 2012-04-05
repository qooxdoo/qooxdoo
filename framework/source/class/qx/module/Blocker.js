/**
 * Provides a way to block elements so they will no longer receive (native) 
 * events by overlaying them with a div.
 * For Internet Explorer, an additional Iframe element will be overlayed since 
 * this is the only way to block events on native form controls.
 * 
 * The blocker can also be applied to the entire document, e.g.:
 * <br/><code>q.wrap(document).block()</code>
 */
qx.Bootstrap.define("qx.module.Blocker", {
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
      var win = qx.dom.Node.getWindow(item);
      var isDocument = qx.dom.Node.isDocument(item);
      
      if (!item.__blocker) {
        item.__blocker = {
          div : qx.dom.Element.create("div", null, win)
        };
        if ((qx.core.Environment.get("engine.name") == "mshtml")) {
          item.__blocker.iframe = qx.module.Blocker.__getIframeElement(win)
        }
      }
      
      qx.module.Blocker.__styleBlocker(item, color, opacity, zIndex, isDocument, win);
      
      var bodyEl = qx.dom.Node.getBodyElement(item);
      qx.dom.Element.insertEnd(item.__blocker.div, bodyEl);
      if (item.__blocker.iframe) {
        qx.dom.Element.insertEnd(item.__blocker.iframe, bodyEl);
      }
      
      if (isDocument) {
        q.wrap(win).on("resize", qx.module.Blocker.__onWindowResize);
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
     * @param win {Window} The parent window of the item
     */
    __styleBlocker : function(item, color, opacity, zIndex, isDocument, win)
    {
      if (isDocument) {
        var location = {
          left : 0,
          top : 0
        };
        var size = {
          width : qx.bom.Document.getWidth(win),
          height : qx.bom.Document.getHeight(win)
        };
      }
      else {
        var location = qx.bom.element.Location.get(item);
        var size = qx.bom.element.Dimension.getSize(item);
      }
      
      var styles = {
        "zIndex" : zIndex,
        "display" : "block",
        "position" : "absolute",
        "top" : location.top + "px",
        "left" : location.left + "px",
        "width" : size.width + "px",
        "height" : size.height + "px",
        "backgroundColor" : color,
        "opacity" : opacity
      };
      
      qx.bom.element.Style.setStyles(item.__blocker.div, styles);
      
      if (item.__blocker.iframe) {
        styles.zIndex = styles.zIndex - 1;
        styles.backgroundColor = "transparent";
        styles.opacity = 0;
        qx.bom.element.Style.setStyles(item.__blocker.iframe, styles);
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
      var iframe = qx.dom.Element.create("iframe", null, win);
      qx.bom.element.Attribute.set(iframe, "allowTransparency", false);
      qx.bom.element.Attribute.set(iframe, "src", "javascript:false;");
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
        width : qx.bom.Document.getWidth(win) + "px",
        height : qx.bom.Document.getHeight(win) + "px"
      }
      qx.bom.element.Style.setStyles(win.document.__blocker.div, size);
      if (win.document.__blocker.iframe) {
        qx.bom.element.Style.setStyles(win.document.__blocker.iframe, size);
      }
    },


    /**
     * Removes the given item's blocker element(s) from the DOM
     * 
     * @param item {DOMElement} Blocked element
     * @param index {Integer} index of the item in the collection
     */
    __detachBlocker : function(item, index)
    {
      if (!item.__blocker) {
        return;
      }
      
      qx.dom.Element.remove(item.__blocker.div);
      if (item.__blocker.iframe) {
        qx.dom.Element.remove(item.__blocker.iframe);
      }
      if (qx.dom.Node.isDocument(item)) {
        q.wrap(qx.dom.Node.getWindow(item))
        .off("resize", qx.module.Blocker.__onWindowResize);
      }
    },


    /**
     * Adds an overlay to all items in the collection that intercepts mouse 
     * events
     * 
     * @param color {String ? transparent} The color for the blocker element (any CSS color value)
     * @param opacity {Float ? 0} The CSS opacity value for the blocker
     * @param zIndex {Integer ? 10000} The zIndex value for the blocker
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
    q.attach({
      "block" : statics.block,
      "unblock" : statics.unblock
    });
  }
});