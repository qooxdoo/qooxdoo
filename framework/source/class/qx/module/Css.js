/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * CSS/Style property manipulation module
 */
qx.Bootstrap.define("qx.module.Css", {
  statics: {


    /**
     * Modifies the given style property on all elements in the collection.
     *
     * @attach {q}
     * @param name {String} Name of the style property to modify
     * @param value {var} The value to apply
     * @return {q} The collection for chaining
     */
    setStyle : function(name, value) {
      if (/\w-\w/.test(name)) {
        name = qx.lang.String.camelCase(name);
      }
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Style.set(this[i], name, value);
      };
      return this;
    },


    /**
     * Returns the value of the given style property for the first item in the
     * collection.
     *
     * @attach {q}
     * @param name {String} Style property name
     * @return {var} Style property value
     */
    getStyle : function(name) {
      if (this[0]) {
        if (/\w-\w/.test(name)) {
          name = qx.lang.String.camelCase(name);
        }
        return qx.bom.element.Style.get(this[0], name);
      }
      return null;
    },


    /**
     * Sets multiple style properties for each item in the collection.
     *
     * @attach {q}
     * @param styles {Map} A map of style property name/value pairs
     * @return {q} The collection for chaining
     */
    setStyles : function(styles) {
      for (var name in styles) {
        this.setStyle(name, styles[name]);
      }
      return this;
    },


    /**
     * Returns the values of multiple style properties for each item in the
     * collection
     *
     * @attach {q}
     * @param names {String[]} List of style property names
     * @return {Map} Map of style property name/value pairs
     */
    getStyles : function(names) {
      var styles = {};
      for (var i=0; i < names.length; i++) {
        styles[names[i]] = this.getStyle(names[i]);
      };
      return styles;
    },


    /**
     * Adds a class name to each element in the collection
     *
     * @attach {q}
     * @param name {String} Class name
     * @return {q} The collection for chaining
     */
    addClass : function(name) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.add(this[i], name);
      };
      return this;
    },


    /**
     * Adds multiple class names to each element in the collection
     *
     * @attach {q}
     * @param names {String[]} List of class names to add
     * @return {q} The collection for chaining
     */
    addClasses : function(names) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.addClasses(this[i], names);
      };
      return this;
    },


    /**
     * Removes a class name from each element in the collection
     *
     * @attach {q}
     * @param name {String} The class name to remove
     * @return {q} The collection for chaining
     */
    removeClass : function(name) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.remove(this[i], name);
      };
      return this;
    },


    /**
     * Removes multiple class names from each element in the collection
     *
     * @attach {q}
     * @param names {String[]} List of class names to remove
     * @return {q} The collection for chaining
     */
    removeClasses : function(names) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.removeClasses(this[i], names);
      };
      return this;
    },


    /**
     * Checks if the first element in the collection has the given class name
     *
     * @attach {q}
     * @param name {String} Class name to check for
     * @return {Boolean} <code>true</code> if the first item has the given class name
     */
    hasClass : function(name) {
      if (!this[0]) {
        return false;
      }
      return qx.bom.element.Class.has(this[0], name);
    },


    /**
     * Returns the class name of the first element in the collection
     *
     * @attach {q}
     * @return {String} Class name
     */
    getClass : function() {
      if (!this[0]) {
        return "";
      }
      return qx.bom.element.Class.get(this[0]);
    },


    /**
     * Toggles the given class name on each item in the collection
     *
     * @attach {q}
     * @param name {String} Class name
     * @return {q} The collection for chaining
     */
    toggleClass : function(name) {
      var bCls = qx.bom.element.Class;
      for (var i=0, l=this.length; i<l; i++) {
        bCls.has(this[i], name) ?
          bCls.remove(this[i], name) :
          bCls.add(this[i], name);
      }
      return this;
    },


    /**
     * Toggles the given list of class names on each item in the collection
     *
     * @attach {q}
     * @param names {String[]} Class names
     * @return {q} The collection for chaining
     */
    toggleClasses : function(names) {
      for (var i=0,l=names.length; i<l; i++) {
        this.toggleClass(names[i]);
      }
      return this;
    },


    /**
     * Replaces a class name on each element in the collection
     *
     * @attach {q}
     * @param oldName {String} Class name to remove
     * @param newName {String} Class name to add
     * @return {q} The collection for chaining
     */
    replaceClass : function(oldName, newName) {
      for (var i=0, l=this.length; i<l; i++) {
        qx.bom.element.Class.replace(this[i], oldName, newName);
      }
      return this;
    },


    /**
     * Returns the rendered height of the first element in the collection.
     * @attach {q}
     * @return {Number} The first item's rendered height
     */
    getHeight : function() {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {
          return qx.bom.element.Dimension.getHeight(elem);
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getHeight(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getHeight(elem);
        }
      }

      return null;
    },


    /**
     * Returns the rendered width of the first element in the collection
     * @attach {q}
     * @return {Number} The first item's rendered width
     */
    getWidth : function() {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {
          return qx.bom.element.Dimension.getWidth(elem);
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getWidth(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getWidth(elem);
        }
      }

      return null;
    },


    /**
     * Returns the computed location of the given element in the context of the
     * document dimensions.
     *
     * @attach {q}
     * @return {Map} A map with the keys <code>left<code/>, <code>top<code/>,
     * <code>right<code/> and <code>bottom<code/> which contains the distance
     * of the element relative to the document.
     */
    getOffset : function() {
      var elem = this[0];

      if (elem) {
        return qx.bom.element.Location.get(elem);
      }

      return null;
    },


    /**
     * Returns the content height of the first element in the collection.
     * This is the maximum height the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {q}
     * @return {Number} Computed content height
     */
    getContentHeight : function()
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {
        return qx.bom.element.Dimension.getContentHeight(obj);
      }

      return null;
    },


    /**
     * Returns the content width of the first element in the collection.
     * This is the maximum width the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {q}
     * @return {Number} Computed content width
     */
    getContentWidth : function()
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {
        return qx.bom.element.Dimension.getContentWidth(obj);
      }

      return null;
    },


    /**
     * Returns the distance between the first element in the collection and its
     * offset parent
     *
     * @attach {q}
     * @return {Map} a map with the keys <code>left</code> and <code>top</code>
     * containing the distance between the elements
     */
    getPosition : function()
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {
        return qx.bom.element.Location.getPosition(obj);
      }

      return null;
    },


    /**
     * Includes a Stylesheet file
     *
     * @attachStatic {q}
     * @param uri {String} The stylesheet's URI
     * @param doc {Document?} Document to modify
     */
    includeStylesheet : function(uri, doc) {
      qx.bom.Stylesheet.includeFile(uri, doc);
    }
  },


  defer : function(statics) {
    q.$attach({
      "setStyle" : statics.setStyle,
      "getStyle" : statics.getStyle,
      "setStyles" : statics.setStyles,
      "getStyles" : statics.getStyles,

      "addClass" : statics.addClass,
      "addClasses" : statics.addClasses,
      "removeClass" : statics.removeClass,
      "removeClasses" : statics.removeClasses,
      "hasClass" : statics.hasClass,
      "getClass" : statics.getClass,
      "toggleClass" : statics.toggleClass,
      "toggleClasses" : statics.toggleClasses,
      "replaceClass" : statics.replaceClass,

      "getHeight" : statics.getHeight,
      "getWidth" : statics.getWidth,
      "getOffset" : statics.getOffset,
      "getContentHeight" : statics.getContentHeight,
      "getContentWidth" : statics.getContentWidth,

      "getPosition" : statics.getPosition
    });

    q.$attachStatic({
      "includeStylesheet" : statics.includeStylesheet
    });
  }
});