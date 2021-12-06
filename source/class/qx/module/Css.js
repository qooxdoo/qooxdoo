/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * CSS/Style property manipulation module
 * @group (Core)
 */
qx.Bootstrap.define("qx.module.Css", {
  statics: {
    /**
     * INTERNAL
     *
     * Returns the rendered height of the first element in the collection.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the height of a <em>non displayed</em> element
     * @return {Number} The first item's rendered height
     */
    _getHeight : function(force) {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {

          var elementHeight;
          if (force) {
            var stylesToSwap = {
              display : "block",
              position : "absolute",
              visibility : "hidden"
            };
            elementHeight = qx.module.Css.__swap(elem, stylesToSwap, "_getHeight", this);
          } else {
            elementHeight = qx.bom.element.Dimension.getHeight(elem);
          }

          return elementHeight;
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getHeight(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getHeight(elem);
        }
      }

      return null;
    },


    /**
     * INTERNAL
     *
     * Returns the rendered width of the first element in the collection
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the width of a <em>non displayed</em> element
     * @return {Number} The first item's rendered width
     */
    _getWidth : function(force) {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {

          var elementWidth;
          if (force) {
            var stylesToSwap = {
              display : "block",
              position : "absolute",
              visibility : "hidden"
            };
            elementWidth = qx.module.Css.__swap(elem, stylesToSwap, "_getWidth", this);
          } else {
            elementWidth = qx.bom.element.Dimension.getWidth(elem);
          }

          return elementWidth;
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getWidth(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getWidth(elem);
        }
      }

      return null;
    },


    /**
     * INTERNAL
     *
     * Returns the content height of the first element in the collection.
     * This is the maximum height the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the content height of a <em>non displayed</em> element
     * @return {Number} Computed content height
     */
    _getContentHeight : function(force)
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {

        var contentHeight;
        if (force) {
          var stylesToSwap = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
          };
          contentHeight = qx.module.Css.__swap(obj, stylesToSwap, "_getContentHeight", this);
        } else {
          contentHeight = qx.bom.element.Dimension.getContentHeight(obj);
        }

        return contentHeight;
      }

      return null;
    },


    /**
     * INTERNAL
     *
     * Returns the content width of the first element in the collection.
     * This is the maximum width the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the content width of a <em>non displayed</em> element
     * @return {Number} Computed content width
     */
    _getContentWidth : function(force)
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {

        var contentWidth;
        if (force) {
          var stylesToSwap = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
          };
          contentWidth = qx.module.Css.__swap(obj, stylesToSwap, "_getContentWidth", this);
        } else {
          contentWidth = qx.bom.element.Dimension.getContentWidth(obj);
        }

        return contentWidth;
      }

      return null;
    },


    /**
     * Maps HTML elements to their default "display" style values.
     */
    __displayDefaults : {},


    /**
     * Attempts tp determine the default "display" style value for
     * elements with the given tag name.
     *
     * @param tagName {String} Tag name
     * @param  doc {Document?} Document element. Default: The current document
     * @return {String} The default "display" value, e.g. <code>inline</code>
     * or <code>block</code>
     */
    __getDisplayDefault : function(tagName, doc)
    {
      var defaults = qx.module.Css.__displayDefaults;
      if (!defaults[tagName]) {
        var docu = doc || document;
        var tempEl = qxWeb(docu.createElement(tagName)).appendTo(doc.body);
        defaults[tagName] = tempEl.getStyle("display");
        tempEl.remove();
      }

      return defaults[tagName] || "";
    },


    /**
     * Swaps the given styles of the element and execute the callback
     * before the original values are restored.
     *
     * Finally returns the return value of the callback.
     *
     * @param element {Element} the DOM element to operate on
     * @param styles {Map} the styles to swap
     * @param methodName {String} the callback functions name
     * @param context {Object} the context in which the callback should be called
     * @return {Object} the return value of the callback
     */
    __swap : function(element, styles, methodName, context)
    {
      // get the current values
      var currentValues = {};
      for (var styleProperty in styles) {
        currentValues[styleProperty] = element.style[styleProperty];
        element.style[styleProperty] = styles[styleProperty];
      }

      var value = context[methodName]();

      for (var styleProperty in currentValues) {
        element.style[styleProperty] = currentValues[styleProperty];
      }

      return value;
    },


    /**
     * Includes a Stylesheet file
     *
     * @attachStatic {qxWeb}
     * @param uri {String} The stylesheet's URI
     * @param doc {Document?} Document to modify
     */
    includeStylesheet : function(uri, doc) {
      qx.bom.Stylesheet.includeFile(uri, doc);
    }
  },


  members :
  {
    /**
     * Returns the rendered height of the first element in the collection.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the height of a <em>non displayed</em> element
     * @return {Number} The first item's rendered height
     */
    getHeight : function(force) {
      return this._getHeight(force);
    },


    /**
     * Returns the rendered width of the first element in the collection
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the width of a <em>non displayed</em> element
     * @return {Number} The first item's rendered width
     */
    getWidth : function(force) {
      return this._getWidth(force);
    },

    /**
     * Returns the content height of the first element in the collection.
     * This is the maximum height the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the content height of a <em>non displayed</em> element
     * @return {Number} Computed content height
     */
    getContentHeight : function(force) {
      return this._getContentHeight(force);
    },

    /**
     * Returns the content width of the first element in the collection.
     * This is the maximum width the element can use, excluding borders,
     * margins, padding or scroll bars.
     * @attach {qxWeb}
     * @param force {Boolean?false} When true also get the content width of a <em>non displayed</em> element
     * @return {Number} Computed content width
     */
    getContentWidth : function(force) {
      return this._getContentWidth(force);
    },

    /**
     * Shows any elements with "display: none" in the collection. If an element
     * was hidden by using the {@link #hide} method, its previous
     * "display" style value will be re-applied. Otherwise, the
     * default "display" value for the element type will be applied.
     *
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    show : function() {
      this._forEachElementWrapped(function(item) {
        var currentVal = item.getStyle("display");
        var prevVal = item[0].$$qPrevDisp;
        var newVal;
        if (currentVal == "none") {
          if (prevVal && prevVal != "none") {
            newVal = prevVal;
          }
          else {
            var doc = qxWeb.getDocument(item[0]);
            newVal = qx.module.Css.__getDisplayDefault(item[0].tagName, doc);
          }
          item.setStyle("display", newVal);
          item[0].$$qPrevDisp = "none";
        }
      });

      return this;
    },


    /**
     * Hides all elements in the collection by setting their "display"
     * style to "none". The previous value is stored so it can be re-applied
     * when {@link #show} is called.
     *
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    hide : function() {
      this._forEachElementWrapped(function(item) {
        var prevStyle = item.getStyle("display");
        if (prevStyle !== "none") {
          item[0].$$qPrevDisp = prevStyle;
          item.setStyle("display", "none");
        }
      });

      return this;
    },


    /**
     * Returns the distance between the first element in the collection and its
     * offset parent
     *
     * @attach {qxWeb}
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
     * Returns the computed location of the given element in the context of the
     * document dimensions.
     *
     * Supported modes:
     *
     * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
     * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
     * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
     * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
     * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
     *
     * @attach {qxWeb}
     * @param mode {String?box} A supported option. See comment above.
     * @return {Map} A map with the keys <code>left</code>, <code>top</code>,
     * <code>right</code> and <code>bottom</code> which contains the distance
     * of the element relative to the document.
     */
    getOffset : function(mode) {
      var elem = this[0];

      if (elem && qx.dom.Node.isElement(elem)) {
        return qx.bom.element.Location.get(elem, mode);
      }

      return null;
    },


    /**
     * Modifies the given style property on all elements in the collection.
     *
     * @attach {qxWeb}
     * @param name {String} Name of the style property to modify
     * @param value {var} The value to apply
     * @return {qxWeb} The collection for chaining
     */
    setStyle : function(name, value) {
      if (/\w-\w/.test(name)) {
        name = qx.lang.String.camelCase(name);
      }
      this._forEachElement(function(item) {
        qx.bom.element.Style.set(item, name, value);
      });
      return this;
    },


    /**
     * Returns the value of the given style property for the first item in the
     * collection.
     *
     * @attach {qxWeb}
     * @param name {String} Style property name
     * @return {var} Style property value
     */
    getStyle : function(name) {
      if (this[0] && qx.dom.Node.isElement(this[0])) {
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
     * @attach {qxWeb}
     * @param styles {Map} A map of style property name/value pairs
     * @return {qxWeb} The collection for chaining
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
     * @attach {qxWeb}
     * @param names {String[]} List of style property names
     * @return {Map} Map of style property name/value pairs
     */
    getStyles : function(names) {
      var styles = {};
      for (var i=0; i < names.length; i++) {
        styles[names[i]] = this.getStyle(names[i]);
      }
      return styles;
    },


    /**
     * Adds a class name to each element in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Class name
     * @return {qxWeb} The collection for chaining
     */
    addClass : function(name) {
      this._forEachElement(function(item) {
        qx.bom.element.Class.add(item, name);
      });
      return this;
    },


    /**
     * Adds multiple class names to each element in the collection
     *
     * @attach {qxWeb}
     * @param names {String[]} List of class names to add
     * @return {qxWeb} The collection for chaining
     */
    addClasses : function(names) {
      this._forEachElement(function(item) {
        qx.bom.element.Class.addClasses(item, names);
      });
      return this;
    },


    /**
     * Removes a class name from each element in the collection
     *
     * @attach {qxWeb}
     * @param name {String} The class name to remove
     * @return {qxWeb} The collection for chaining
     */
    removeClass : function(name) {
      this._forEachElement(function(item) {
        qx.bom.element.Class.remove(item, name);
      });
      return this;
    },


    /**
     * Removes multiple class names from each element in the collection.
     * Use {@link qx.module.Attribute#removeAttribute} to remove all classes.
     *
     * @attach {qxWeb}
     * @param names {String[]} List of class names to remove
     * @return {qxWeb} The collection for chaining
     */
    removeClasses : function(names) {
      this._forEachElement(function(item) {
        qx.bom.element.Class.removeClasses(item, names);
      });
      return this;
    },


    /**
     * Checks if the first element in the collection has the given class name
     *
     * @attach {qxWeb}
     * @param name {String} Class name to check for
     * @return {Boolean} <code>true</code> if the first item has the given class name
     */
    hasClass : function(name) {
      if (!this[0] || !qx.dom.Node.isElement(this[0])) {
        return false;
      }
      return qx.bom.element.Class.has(this[0], name);
    },


    /**
     * Returns the class name of the first element in the collection
     *
     * @attach {qxWeb}
     * @return {String} Class name
     */
    getClass : function() {
      if (!this[0] || !qx.dom.Node.isElement(this[0])) {
        return "";
      }
      return qx.bom.element.Class.get(this[0]);
    },


    /**
     * Toggles the given class name on each item in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Class name
     * @return {qxWeb} The collection for chaining
     */
    toggleClass : function(name) {
      var bCls = qx.bom.element.Class;
      this._forEachElement(function(item) {
        bCls.has(item, name) ?
          bCls.remove(item, name) :
          bCls.add(item, name);
      });
      return this;
    },


    /**
     * Toggles the given list of class names on each item in the collection
     *
     * @attach {qxWeb}
     * @param names {String[]} Class names
     * @return {qxWeb} The collection for chaining
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
     * @attach {qxWeb}
     * @param oldName {String} Class name to remove
     * @param newName {String} Class name to add
     * @return {qxWeb} The collection for chaining
     */
    replaceClass : function(oldName, newName) {
      this._forEachElement(function(item) {
        qx.bom.element.Class.replace(item, oldName, newName);
      });
      return this;
    }
  },


  defer : function(statics) {
    qxWeb.$attachAll(this);
    // manually attach private method which is ignored by attachAll
    qxWeb.$attach({
      "_getWidth" : statics._getWidth,
      "_getHeight" : statics._getHeight,
      "_getContentHeight" : statics._getContentHeight,
      "_getContentWidth" : statics._getContentWidth
    });
  }
});
