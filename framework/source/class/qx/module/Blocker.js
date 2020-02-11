/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Provides a way to block elements so they will no longer receive (native)
 * events by overlaying them with a DIV element.
 *
 * @require(qx.module.Environment)
 * @require(qx.module.Manipulating)
 * @require(qx.module.Traversing)
 * @require(qx.module.Css)
 * @require(qx.module.Attribute)
 */
qx.Bootstrap.define("qx.module.Blocker", {
  statics :
  {
    /**
     * Attaches a blocker div to the given element.
     *
     * @param item {Element|Document} The element to be overlaid with the blocker
     * @param color {String} The color for the blocker element (any CSS color value)
     * @param opacity {Number} The CSS opacity value for the blocker
     * @param zIndex {Number} The zIndex value for the blocker
     */
    __attachBlocker : function(item, color, opacity, zIndex)
    {
      var win = qxWeb.getWindow(item);
      var isDocument = qxWeb.isDocument(item);

      if (!isDocument && !qxWeb.isElement(item)) {
        return;
      }

      if (!item.__blocker) {
        item.__blocker = {
          div : qxWeb.create("<div class='qx-blocker' />")
        };
      }

      if (isDocument) {
        item.__blocker.div.insertBefore(qxWeb(win.document.body).getChildren(':first'));
      } else {
        item.__blocker.div.appendTo(win.document.body);
      }

      qx.module.Blocker.__styleBlocker(item, color, opacity, zIndex, isDocument);
    },


    /**
     * Styles the blocker element(s)
     *
     * @param item {Element|Document} The element to be overlaid with the blocker
     * @param color {String} The color for the blocker element (any CSS color value)
     * @param opacity {Number} The CSS opacity value for the blocker
     * @param zIndex {Number} The zIndex value for the blocker
     * @param isDocument {Boolean} Whether the item is a document node
     */
    __styleBlocker : function(item, color, opacity, zIndex, isDocument)
    {
      var qItem = qxWeb(item);

      var styles = {
        "display" : "block"
      };

      styles.backgroundColor = typeof color !== 'undefined' ? color : null;
      styles.zIndex =  typeof zIndex !== 'undefined' ? zIndex : null;

      if (qxWeb.env.get("browser.name") === "ie" && qxWeb.env.get("browser.version") <= 8) {
        styles.opacity = typeof opacity !== 'undefined' ? opacity : 0;
      } else {
        styles.opacity = typeof opacity !== 'undefined' ? opacity : null;
      }

      if (isDocument) {
        styles.top = 0 + "px";
        styles.left = 0 + "px";
        styles.position = "fixed";
        styles.width = "100%";
        styles.height = "100%";
      }
      else {
        var pos = qItem.getOffset();
        styles.top = pos.top + "px";
        styles.left = pos.left + "px";
        styles.position = "absolute";
        styles.width = qItem.getWidth() + "px";
        styles.height = qItem.getHeight() + "px";
      }
      item.__blocker.div.setStyles(styles);
    },


    /**
     * Removes the given item's blocker element(s) from the DOM
     *
     * @param item {Element} Blocked element
     * @param index {Number} index of the item in the collection
     */
    __detachBlocker : function(item, index)
    {
      if (!item.__blocker) {
        return;
      }
      item.__blocker.div.remove();
    },


    /**
     * Returns the blocker elements as collection
     *
     * @param collection {qxWeb} Collection to get the blocker elements from
     * @return {qxWeb} collection of blocker elements
     */
    __getBlocker : function(collection)
    {
      var blockerElements = qxWeb();

      collection.forEach(function(item, index) {
        if (typeof item.__blocker !== "undefined") {
          blockerElements = blockerElements.concat(item.__blocker.div);
        }
      });

      return blockerElements;
    }
  },

  members :
  {


    /**
     * Adds an overlay to all items in the collection that intercepts mouse
     * events.
     *
     * @attach {qxWeb}
     * @param color {String ? transparent} The color for the blocker element (any CSS color value)
     * @param opacity {Number ? 0} The CSS opacity value for the blocker (floating point number from 0 to 1)
     * @param zIndex {Number ? 10000} The zIndex value for the blocker
     * @return {qxWeb} The collection for chaining
     */
    block : function(color, opacity, zIndex)
    {
      if (!this[0]) {
        return this;
      }

      this.forEach(function(item, index) {
        qx.module.Blocker.__attachBlocker(item, color, opacity, zIndex);
      });

      return this;
    },


    /**
     * Removes the blockers from all items in the collection
     *
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    unblock : function()
    {
      if (!this[0]) {
        return this;
      }

      this.forEach(qx.module.Blocker.__detachBlocker);

      return this;
    },


    /**
     * Returns all blocker elements as collection.
     *
     * <strong>Note:</strong> This will only return elements if
     * the <code>block</code> method was called at least once,
     * since the blocker elements are created on-demand.
     *
     * @attach {qxWeb}
     * @return {qxWeb} collection with all blocker elements
     */
    getBlocker : function()
    {
      if (!this[0]) {
        return this;
      }

      var collection = qx.module.Blocker.__getBlocker(this);
      return collection;
    }
  },


  defer : function(statics)
  {
    qxWeb.$attachAll(this);
  }
});
