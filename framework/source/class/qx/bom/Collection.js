/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/* ************************************************************************

*#require(qx.type.BaseArray)

#require(qx.bom.Document)
 *#require(qx.bom.Element)
 *#require(qx.bom.Input)
#require(qx.bom.Viewport)
#require(qx.bom.Selector)

 *#require(qx.bom.element.Attribute)
 *#require(qx.bom.element.Class)
 *#require(qx.bom.element.Location)
 *#require(qx.bom.element.Style)

************************************************************************ */

(function()
{
  /**
   * Helper method to create setters for all DOM elements in the collection
   *
   * @param clazz {Class} Static class which contains the given method
   * @param method {String} Name of the method
   * @return {Function} Returns a new function which wraps the given function
   */
  var setter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6)
    {
      var length = this.length;
      if (length > 0)
      {
        var ptn = clazz[method];
        for (var i=0; i<length; i++)
        {
          if (this[i].nodeType === 1) {
            ptn.call(clazz, this[i], arg1, arg2, arg3, arg4, arg5, arg6);
          }
        }
      }

      return this;
    };
  };


  /**
   * Helper method to create getters for the first DOM element in the collection.
   *
   * Automatically push the result to the stack if it is an element as well.
   *
   * @param clazz {Class} Static class which contains the given method
   * @param method {String} Name of the method
   * @return {Function} Returns a new function which wraps the given function
   */
  var getter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6)
    {
      if (this.length > 0)
      {
        var ret = this[0].nodeType === 1 ?
          clazz[method](this[0], arg1, arg2, arg3, arg4, arg5, arg6) : null;

        if (ret && ret.nodeType) {
          return this.__pushStack([ret]);
        } else {
          return ret;
        }
      }

      return null;
    };
  };


  /**
   * Wraps a set of elements and offers a whole set of features to query or modify them.
   *
   * *Chaining*
   *
   * The collection uses an interesting concept called a "Builder" to make
   * its code short and simple. The Builder pattern is an object-oriented
   * programming design pattern that has been gaining popularity.
   *
   * In a nutshell: Every method on the collection returns the collection object itself,
   * allowing you to 'chain' upon it, for example:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("a").addClass("test")
   *   .setStyle("visibility", "visible").setAttribute("html", "foo");
   * </pre>
   *
   * *Content Manipulation*
   *
   * Most methods that accept "content" will accept one or more
   * arguments of any of the following:
   *
   * * A DOM node element
   * * An array of DOM node elements
   * * A collection
   * * A string representing HTML
   *
   * Example:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#div1").append(
   *   document.createElement("br"),
   *   qx.bom.Collection.query("#div2"),
   *   "<em>after div2</em>"
   * );
   * </pre>
   *
   * Content inserting methods ({@link #append}, {@link #prepend},
   * {@link #before}, {@link #after}, and
   * {@link #replaceWith}) behave differently depending on the number of DOM
   * elements currently selected by the collection. If there is only one
   * element in the collection, the content is inserted to that element;
   * content that was in another location in the DOM tree will be moved by
   * this operation. This is essentially the same as the W3C DOM
   * <code>appendChild</code> method.
   *
   * When multiple elements are selected by a collection, these methods
   * clone the content before inserting it to each element. Since the
   * content can only exist in one location in the document tree, cloning
   * is required in these cases so that the same content can be used in
   * multiple locations.
   *
   * This rule also applies to the selector-insertion methods ({@link #appendTo},
   * {@link #prependTo}, {@link #insertBefore}, {@link #insertAfter},
   * and {@link #replaceAll}), but the auto-cloning occurs if there is more
   * than one element selected by the
   * Selector provided as an argument to the method.
   *
   * When a specific behavior is needed regardless of the number of
   * elements selected, use the {@link #clone} or {@link #remove} methods in
   * conjunction with a selector-insertion method. This example will always
   * clone <code>#Thing</code>, append it to each element with class OneOrMore, and
   * leave the original <code>#Thing</code> unmolested in the document:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#Thing").clone().appendTo(".OneOrMore");
   * </pre>
   *
   * This example will always remove <code>#Thing</code> from the document and append it
   * to <code>.OneOrMore</code>:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#Thing").remove().appendTo(".OneOrMore");
   * </pre>
   */
  qx.Class.define("qx.bom.Collection",
  {
    extend : qx.type.BaseArray,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Collection with the given size or the listed elements.
   *
   * <pre class="javascript">
   * var col1 = new qx.bom.Collection(length);
   * var col2 = new qx.bom.Collection(elem0, elem1, ..., elemN);
   * </pre>
   *
   * * <code>length</code>: The initial size of the collection of elements.
   * * <code>elem1, elem2. .. elemN</code>:  the elements that will compose the newly created collection
   *
   * @param length_or_items {Integer|varargs?null} The initial size of the collection
   *        OR an argument list of elements.
   */
  construct : function(length_or_items) {
    qx.type.BaseArray.apply(this,arguments);
  },



    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */

    statics :
    {
      /**
       * Queries the selector engine and returns a new collection
       * for convenient modification and querying.
       *
       * @see qx.bom.Selector#query
       * @param selector {String} CSS Selector String
       * @param context {Element|Document?document} Context element to filter start search in
       * @return {Collection} Collection instance to wrap found elements
       */
      query : function(selector, context)
      {
        var arr = qx.bom.Selector.query(selector, context);
        return qx.lang.Array.cast(arr, qx.bom.Collection);
      },


      /**
       * Queries the DOM for an element matching the given ID. Must not contain
       * the "#" like when using the query engine.
       *
       * This is mainly a wrapper for <code>document.getElementById</code> and
       * returns a collection for easy querying and modification instead of the
       * pure DOM node.
       *
       * @param id {String} Identifier for DOM element to found
       * @return {Collection} Found element wrapped into Collection
       */
      id : function(id)
      {
        var elem = document.getElementById(id);

        // Handle the case where IE and Opera return items
        // by name instead of ID
        if (elem && elem.id != id) {
          return qx.bom.Collection.query("#" + id);
        }

        // check if the element does exist
        if (elem) {
          return new qx.bom.Collection(elem);
        } else {
          return new qx.bom.Collection();
        }
      },


      /**
       * Converts a HTML string into a collection
       *
       * Please make sure you understand the security implications of this
       * method when passing HTML strings from untrusted input. See
       * {@link qx.bom.Html#clean}.
       *
       * @param html {String} String containing one or multiple elements or pure text content
       * @param context {Element|Document?document} Context in which newly DOM elements are created from the markup
       * @return {Collection} Collection containing the create DOM elements
       */
      html : function(html, context)
      {
        // Translate HTML into DOM elements
        var arr = qx.bom.Html.clean([html], context);

        // Translate into Collection
        return qx.lang.Array.cast(arr, qx.bom.Collection);
      },


      /** {RegExp} Test for HTML or ID */
      __expr : /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,


      /**
       * Processes the input and translates it to a collection instance.
       *
       * Please make sure you understand the security implications of this
       * method when passing HTML strings from untrusted input. See
       * {@link qx.bom.Html#clean}.
       *
       * @see #query
       * @see #id
       * @see #html
       * @param input {Element|String|Element[]} Supports HTML elements, HTML strings and selector strings
       * @param context {Element|Document?document} Where to start looking for the expression or
       *   any element in the document which refers to a valid document to create new elements
       *   (useful when dealing with HTML->Element translation in multi document environments).
       * @return {Collection} Newly created collection
       */
      create : function(input, context)
      {
        // Work with aliases to make it possible to call this
        // method context free e.g for "$" support.
        var Collection = qx.bom.Collection;

        // Element
        if (input.nodeType) {
          return new Collection(input);
        }

        // HTML, ID or Selector
        else if (typeof input === "string")
        {
          var match = Collection.__expr.exec(input);
          if (match) {
            return match[1] ? Collection.html(match[1], context) : Collection.id(match[3]);
          } else {
            return Collection.query(input, context);
          }
        }

        // Element Array
        else {
          return qx.lang.Array.cast(input, qx.bom.Collection);
        }
      }
    },



    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members :
    {
      __prevObject : null,

      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Modify the given attribute on all selected elements.
       *
       * @signature function(name, value)
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       * @return {Collection} The collection is returned for chaining proposes
       */
      setAttribute : setter(qx.bom.element.Attribute, "set"),

      /**
       * Reset the given attribute on all selected elements.
       *
       * @signature function(name)
       * @param name {String} Name of the attribute
       * @return {Collection} The collection is returned for chaining proposes
       */
      resetAttribute : setter(qx.bom.element.Attribute, "reset"),

       /**
        * Figures out the value of the given attribute of
        * the first element stored in the collection.
        *
        * @signature function(name)
        * @param name {String} Name of the attribute
        * @return {var} The value of the attribute
        */
      getAttribute : getter(qx.bom.element.Attribute, "get"),



      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: CLASS
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a className to the given element
       * If successfully added the given className will be returned
       *
       * @signature function(name)
       * @param name {String} The class name to add
       * @return {Collection} The collection is returned for chaining proposes
       */
      addClass : setter(qx.bom.element.Class, "add"),

      /**
       * Gets the classname of the first selected element
       *
       * @signature function()
       * @return {String} The retrieved classname
       */
      getClass : getter(qx.bom.element.Class, "get"),

      /**
       * Whether the first selected element has the given className.
       *
       * @signature function(name)
       * @param name {String} The class name to check for
       * @return {Boolean} true when the element has the given classname
       */
      hasClass : getter(qx.bom.element.Class, "has"),

      /**
       * Removes a className from the given element
       *
       * @signature function(name)
       * @param name {String} The class name to remove
       * @return {Collection} The collection is returned for chaining proposes
       */
      removeClass : setter(qx.bom.element.Class, "remove"),

      /**
       * Replaces the first given class name with the second one
       *
       * @signature function(oldName, newName)
       * @param oldName {String} The class name to remove
       * @param newName {String} The class name to add
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceClass : setter(qx.bom.element.Class, "replace"),

      /**
       * Toggles a className of the selected elements
       *
       * @signature function(name)
       * @param name {String} The class name to toggle
       * @return {Collection} The collection is returned for chaining proposes
       */
      toggleClass : setter(qx.bom.element.Class, "toggle"),




      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: VALUE
      ---------------------------------------------------------------------------
      */

      /**
       * Applies the given value to the element.
       *
       * Normally the value is given as a string/number value and applied
       * to the field content (textfield, textarea) or used to
       * detect whether the field is checked (checkbox, radiobutton).
       *
       * Supports array values for selectboxes (multiple-selection)
       * and checkboxes or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or
       * radiobutton use {@link qx.bom.element.Attribute#set} instead.
       *
       * @signature function(value)
       * @param value {String|Number|Array} Value to apply to each element
       * @return {Collection} The collection is returned for chaining proposes
       */
      setValue : setter(qx.bom.Input, "setValue"),

      /**
       * Returns the currently configured value of the first
       * element in the collection.
       *
       * Works with simple input fields as well as with
       * select boxes or option elements.
       *
       * Returns an array in cases of multi-selection in
       * select boxes but in all other cases a string.
       *
       * @signature function()
       * @return {String|Array} The value of the first element.
       */
       getValue : getter(qx.bom.Input, "getValue"),






      /*
      ---------------------------------------------------------------------------
         CSS: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Modify the given style property
       * on all selected elements.
       *
       * @signature function(name, value)
       * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
       * @param value {var} The value for the given style
       * @return {Collection} The collection is returned for chaining proposes
       */
      setStyle : setter(qx.bom.element.Style, "set"),

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @signature function(styles)
       * @param styles {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @return {Collection} The collection is returned for chaining proposes
       */
      setStyles : setter(qx.bom.element.Style, "setStyles"),

      /**
       * Reset the given style property
       * on all selected elements.
       *
       * @signature function(name)
       * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
       * @return {Collection} The collection is returned for chaining proposes
       */
      resetStyle : setter(qx.bom.element.Style, "reset"),

       /**
        * Figures out the value of the given style property of
        * the first element stored in the collection.
        *
        * @signature function(name, mode)
        * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
        * @param mode {Number} Choose one of the modes supported by {@link qx.bom.element.Style#get}
        * @return {var} The value of the style property
        */
      getStyle : getter(qx.bom.element.Style, "get"),




      /*
      ---------------------------------------------------------------------------
         CSS: SHEET
      ---------------------------------------------------------------------------
      */

      /**
       * Set the full CSS content of the style attribute for all elements in the
       * collection.
       *
       * @signature function(value)
       * @param value {String} The full CSS string
       * @return {Collection} The collection is returned for chaining proposes
       */
      setCss : setter(qx.bom.element.Style, "setCss"),

      /**
       * Returns the full content of the style attribute of the first element
       * in the collection.
       *
       * @signature function()
       * @return {String} the full CSS string
       */
      getCss : getter(qx.bom.element.Style, "getCss"),




      /*
      ---------------------------------------------------------------------------
         CSS: POSITIONING
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the location of the first element in context of
       * the document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @signature function(mode)
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      getOffset : getter(qx.bom.element.Location, "get"),

      /**
       * Returns the distance between the first element of the collection to its offset parent.
       *
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getPosition : getter(qx.bom.element.Location, "getPosition"),

      /**
       * Detects the offset parent of the first element
       *
       * @signature function()
       * @return {Collection} Detected offset parent encapsulated into a new collection instance
       */
      getOffsetParent : getter(qx.bom.element.Location, "getOffsetParent"),


      /**
       * Scrolls the elements of the collection to the given coordinate.
       *
       * @param value {Integer} Left scroll position
       * @return {Collection} This collection for chaining
       */
      setScrollLeft : function(value)
      {
        var Node = qx.dom.Node;

        for (var i=0, l=this.length, obj; i<l; i++)
        {
          obj = this[i];

          if (Node.isElement(obj)) {
            obj.scrollLeft = value;
          } else if (Node.isWindow(obj)) {
            obj.scrollTo(value, this.getScrollTop(obj));
          } else if (Node.isDocument(obj)) {
            Node.getWindow(obj).scrollTo(value, this.getScrollTop(obj));
          }
        }

        return this;
      },


      /**
       * Scrolls the elements of the collection to the given coordinate.
       *
       * @param value {Integer} Top scroll position
       * @return {Collection} This collection for chaining
       */
      setScrollTop : function(value)
      {
        var Node = qx.dom.Node;

        for (var i=0, l=this.length, obj; i<l; i++)
        {
          obj = this[i];

          if (Node.isElement(obj)) {
            obj.scrollTop = value;
          } else if (Node.isWindow(obj)) {
            obj.scrollTo(this.getScrollLeft(obj), value);
          } else if (Node.isDocument(obj)) {
            Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
          }
        }

        return this;
      },


      /**
       * Returns the left scroll position of the first element in the collection.
       *
       * @return {Integer} Current left scroll position
       */
      getScrollLeft : function()
      {
        var obj = this[0];
        if (!obj) {
          return null;
        }

        var Node = qx.dom.Node;
        if (Node.isWindow(obj) || Node.isDocument(obj)) {
          return qx.bom.Viewport.getScrollLeft();
        }

        return obj.scrollLeft;
      },


      /**
       * Returns the top scroll position of the first element in the collection.
       *
       * @return {Integer} Current top scroll position
       */
      getScrollTop : function()
      {
        var obj = this[0];
        if (!obj) {
          return null;
        }

        var Node = qx.dom.Node;
        if (Node.isWindow(obj) || Node.isDocument(obj)) {
          return qx.bom.Viewport.getScrollTop();
        }

        return obj.scrollTop;
      },




      /*
      ---------------------------------------------------------------------------
         CSS: WIDTH AND HEIGHT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the width of the first element in the collection.
       *
       * This is the rendered width of the element which includes borders and
       * paddings like the <code>offsetWidth</code> property in plain HTML.
       *
       * @return {Integer} The width of the first element
       */
      getWidth : function()
      {
        var obj = this[0];
        var Node = qx.dom.Node;

        if (obj)
        {
          if (Node.isElement(obj)) {
            return qx.bom.element.Dimension.getWidth(obj);
          } else if (Node.isDocument(obj)) {
            return qx.bom.Document.getWidth(Node.getWindow(obj));
          } else if (Node.isWindow(obj)) {
            return qx.bom.Viewport.getWidth(obj);
          }
        }

        return null;
      },


      /**
       * Returns the content width of the first element in the collection.
       *
       * The content width is basically the maximum
       * width used or the maximum width which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content width returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * Only works for DOM elements and not for the window object or the document
       * object!
       *
       * @return {Integer} Computed content width
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
       * Returns the height of the first element in the collection.
       *
       * This is the rendered height of the element which includes borders and
       * paddings like the <code>offsetHeight</code> property in plain HTML.
       *
       * @return {Integer} The height of the first element
       */
      getHeight : function()
      {
        var obj = this[0];
        var Node = qx.dom.Node;

        if (obj)
        {
          if (Node.isElement(obj)) {
            return qx.bom.element.Dimension.getHeight(obj);
          } else if (Node.isDocument(obj)) {
            return qx.bom.Document.getHeight(Node.getWindow(obj));
          } else if (Node.isWindow(obj)) {
            return qx.bom.Viewport.getHeight(obj);
          }
        }

        return null;
      },


      /**
       * Returns the content height of the first element in the collection.
       *
       * The content height is basically the maximum
       * height used or the maximum height which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content height returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * Only works for DOM elements and not for the window object or the document
       * object!
       *
       * @return {Integer} Computed content height
       */
      getContentHeight : function()
      {
        var obj = this[0];
        if (qx.dom.Node.isElement(obj)) {
          return qx.bom.element.Dimension.getContentHeight(obj);
        }

        return null;
      },





      /*
      ---------------------------------------------------------------------------
         EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Add an event listener to the selected elements. The event listener is passed an
       * instance of {@link Event} containing all relevant information
       * about the event as parameter.
       *
       * @signature function(type, listener, self, capture)
       * @param type {String} Name of the event e.g. "click", "keydown", ...
       * @param listener {Function} Event listener function
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean} Whether to attach the event to the
       *       capturing phase or the bubbling phase of the event. The default is
       *       to attach the event handler to the bubbling phase.
       * @return {Collection} The collection is returned for chaining proposes
       */
      addListener : setter(qx.bom.Element, "addListener"),

      /**
       * Removes an event listener from the selected elements.
       *
       * Note: All registered event listeners will automatically be removed from
       *   the DOM at page unload so it is not necessary to detach events yourself.
       *
       * @signature function(type, listener, self, capture)
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener.
       * @param capture {Boolean} Whether to remove the event listener of
       *       the bubbling or of the capturing phase.
       * @return {Collection} The collection is returned for chaining proposes
       */
      removeListener : setter(qx.bom.Element, "removeListener"),






      /*
      ---------------------------------------------------------------------------
         TRAVERSING: FILTERING
      ---------------------------------------------------------------------------
      */

      /**
       * Reduce the set of matched elements to a single element.
       *
       * The position of the element in the collection of matched
       * elements starts at 0 and goes to length - 1.
       *
       * @param index {Integer} The position of the element
       * @return {Collection} The filtered collection
       */
      eq : function(index) {
        return this.slice(index, +index + 1);
      },


      /**
       * Removes all elements from the set of matched elements that
       * do not match the specified expression(s) or be valid
       * after being tested with the given function.
       *
       * A selector function is invoked with three arguments: the value of the element, the
       * index of the element, and the Array object being traversed.
       *
       * @param selector {String|Function} An expression or function to filter
       * @param context {Object?null} Optional context for the function to being executed in.
       * @return {Collection} The filtered collection
       */
      filter : function(selector, context)
      {
        var res;

        if (qx.lang.Type.isFunction(selector)) {
          res = qx.type.BaseArray.prototype.filter.call(this, selector, context);
        } else {
          res = qx.bom.Selector.matches(selector, this);
        }

        return this.__pushStack(res);
      },


      /**
       * Checks the current selection against an expression
       * and returns true, if at least one element of the
       * selection fits the given expression.
       *
       * @param selector {String} Selector to check the content for
       * @return {Boolean} Whether at least one element matches the given selector
       */
      is : function(selector) {
        return !!selector && qx.bom.Selector.matches(selector, this).length > 0;
      },


      /** {RegExp} Test for simple selectors */
      __simple : /^.[^:#\[\.,]*$/,


      /**
       * Removes elements matching the specified expression from the collection.
       *
       * @param selector {String} CSS selector expression
       * @return {Collection} A newly created collection where the matching elements
       *    have been removed.
       */
      not : function(selector)
      {
        // Test special case where just one selector is passed in
        if (this.__simple.test(selector))
        {
          var res = qx.bom.Selector.matches(":not(" + selector + ")", this);
          return this.__pushStack(res);
        }

        // Otherwise do it in a more complicated way
        var res = qx.bom.Selector.matches(selector, this);
        return this.filter(function(value) {
          return res.indexOf(value) === -1;
        });
      },





      /*
      ---------------------------------------------------------------------------
         TRAVERSING: FINDING
      ---------------------------------------------------------------------------
      */

      /**
       * Adds more elements, matched by the given expression,
       * to the set of matched elements.
       *
       * @param selector {String} Valid selector (CSS3 + extensions)
       * @param context {Element} Context element (result elements must be children of this element)
       * @return {qx.bom.Collection} The collection is returned for chaining proposes
       */
      add : function(selector, context)
      {
        var res = qx.bom.Selector.query(selector, context);
        var arr = qx.lang.Array.unique(this.concat(res));

        return this.__pushStack(arr);
      },


      /**
       * Get a set of elements containing all of the unique immediate children
       * of each of the matched set of elements.
       *
       * This set can be filtered with an optional expression that will cause
       * only elements matching the selector to be collected.
       *
       * Also note: while <code>parents()</code> will look at all ancestors,
       * <code>children()</code> will only consider immediate child elements.
       *
       * @param selector {String?null} Optional selector to match
       * @return {Collection} The new collection
       */
      children : function(selector)
      {
        var children = [];
        for (var i=0, l=this.length; i<l; i++) {
          children.push.apply(children, qx.dom.Hierarchy.getChildElements(this[i]));
        }

        if (selector) {
          children = qx.bom.Selector.matches(selector, children);
        }

        return this.__pushStack(children);
      },


      /**
       * Get a set of elements containing the closest parent element
       * that matches the specified selector, the starting element included.
       *
       * Closest works by first looking at the current element to see if
       * it matches the specified expression, if so it just returns the
       * element itself. If it doesn't match then it will continue to
       * traverse up the document, parent by parent, until an element
       * is found that matches the specified expression. If no matching
       * element is found then none will be returned.
       *
       * @param selector {String} Expression to filter the elements with
       * @return {Collection} New collection which contains all interesting parents
       */
      closest : function(selector)
      {
        // Initialize array for reusing it as container for
        // selector match call.
        var arr = new qx.bom.Collection(1);

        // Performance tweak
        var Selector = qx.bom.Selector;

        // Map all children to given selector
        var ret = this.map(function(current)
        {
          while (current && current.ownerDocument)
          {
            arr[0] = current;

            if (Selector.matches(selector, arr).length > 0) {
              return current;
            }

            // Try the next parent
            current = current.parentNode;
          }
        });

        return this.__pushStack(qx.lang.Array.unique(ret));
      },


      /**
       * Find all the child nodes inside the matched elements (including text nodes).
       *
       * @return {Collection} A new collection containing all child nodes of the previous collection.
       */
      contents : function()
      {
        var res = [];
        var lang = qx.lang.Array;

        for (var i=0, l=this.length; i<l; i++) {
          res.push.apply(res, lang.fromCollection(this[i].childNodes));
        }

        return this.__pushStack(res);
      },


      /**
       * Searches for all elements that match the specified expression.
       * This method is a good way to find additional descendant
       * elements with which to process.
       *
       * @param selector {String} Selector for children to find
       * @return {Collection} The found elements in a new collection
       */
      find : function(selector)
      {
        var Selector = qx.bom.Selector;

        // Fast path for single item selector
        if (this.length === 1) {
          return this.__pushStack(Selector.query(selector, this[0]));
        }
        else
        {
          // Let the selector do the work and merge all result arrays.
          var ret = [];
          for (var i=0, l=this.length; i<l; i++) {
            ret.push.apply(ret, Selector.query(selector, this[i]));
          }

          return this.__pushStack(qx.lang.Array.unique(ret));
        }
      },


      /**
       * Get a set of elements containing the unique next siblings of each of the given set of elements.
       *
       * <code>next</code> only returns the very next sibling for each element, not all next siblings
       * (see {@link #nextAll}). Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all very next siblings of the current collection.
       */
      next : function(selector)
      {
        var Hierarchy = qx.dom.Hierarchy;
        var ret = this.map(Hierarchy.getNextElementSibling, Hierarchy);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Find all sibling elements after the current element.
       *
       * Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all siblings following the elements of the current collection.
       */
      nextAll : function(selector) {
        return this.__hierarchyHelper("getNextSiblings", selector);
      },


      /**
       * Get a set of elements containing the unique previous siblings of each of the given set of elements.
       *
       * <code>prev</code> only returns the very previous sibling for each element, not all previous siblings
       * (see {@link #prevAll}). Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all very previous siblings of the current collection.
       */
      prev : function(selector)
      {
        var Hierarchy = qx.dom.Hierarchy;
        var ret = this.map(Hierarchy.getPreviousElementSibling, Hierarchy);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Find all sibling elements preceding the current element.
       *
       * Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all siblings preceding the elements of the current collection.
       */
      prevAll : function(selector) {
        return this.__hierarchyHelper("getPreviousSiblings", selector);
      },


      /**
       * Get a set of elements containing the unique parents of the matched set of elements.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique parent elements.
       */
      parent : function(selector)
      {
        var Element = qx.dom.Element;
        var ret = qx.lang.Array.unique(this.map(Element.getParentElement, Element));

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Get a set of elements containing the unique ancestors of the matched set of
       * elements (except for the root element).
       *
       * The matched elements can be filtered with an optional expression.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique parent elements.
       */
      parents : function(selector) {
        return this.__hierarchyHelper("getAncestors", selector);
      },


      /**
       * Get a set of elements containing all of the unique siblings
       * of each of the matched set of elements.
       *
       * Can be filtered with an optional expressions.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique sibling elements.
       */
      siblings : function(selector) {
        return this.__hierarchyHelper("getSiblings", selector);
      },


      /**
       * Internal helper to work with hierarchy result arrays.
       *
       * @param method {String} Method name to execute
       * @param selector {String} Optional selector to filter the result
       * @return {Collection} Collection from all found elements
       */
      __hierarchyHelper : function(method, selector)
      {
        // Iterate ourself, as we want to directly combine the result
        var all = [];
        var Hierarchy = qx.dom.Hierarchy;
        for (var i=0, l=this.length; i<l; i++) {
          all.push.apply(all, Hierarchy[method](this[i]));
        }

        // Remove duplicates
        var ret = qx.lang.Array.unique(all);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },




      /*
      ---------------------------------------------------------------------------
         TRAVERSING: CHAINING
      ---------------------------------------------------------------------------
      */

      /**
       * Extend the chaining with a new collection, while
       * storing the previous collection to make it accessible
       * via <code>end()</code>.
       *
       * @param arr {Array} Array to transform into new collection
       * @return {Collection} The newly created collection
       */
      __pushStack : function(arr)
      {
        var coll = new qx.bom.Collection;

        // Remember previous collection
        coll.__prevObject = this;

        // The "apply" call only accepts real arrays, no extended ones,
        // so we need to convert it first
        arr = Array.prototype.slice.call(arr, 0);

        // Append all elements
        coll.push.apply(coll, arr);

        // Return newly formed collection
        return coll;
      },


      /**
       * Add the previous selection to the current selection.
       *
       * @return {Collection} Newly build collection containing the current and
       *    and the previous collection.
       */
      andSelf : function() {
        return this.add(this.__prevObject);
      },


      /**
       * Undone of the last modification of the collection.
       *
       * These methods change the selection during a chained method call:
       * <code>add</code>, <code>children</code>, <code>eq</code>, <code>filter</code>,
       * <code>find</code>, <code>gt</code>, <code>lt</code>, <code>next</code>,
       * <code>not</code>, <code>parent</code>, <code>parents</code> and <code>siblings</code>
       *
       * @return {Collection} The previous collection
       */
      end : function() {
        return this.__prevObject || new qx.bom.Collection();
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method for all DOM manipulation methods which deal
       * with set of elements or HTML fragments.
       *
       * @param args {Element[]|String[]} Array of DOM elements or HTML strings
       * @param callback {Function} Method to execute for each fragment/element created
       * @return {Collection} The collection is returned for chaining proposes
       */
      __manipulate : function(args, callback)
      {
        var element = this[0];
        var doc = element.ownerDocument || element;

        // Create fragment, cleanup HTML and extract scripts
        var fragment = doc.createDocumentFragment();
        var scripts = qx.bom.Html.clean(args, doc, fragment);
        var first = fragment.firstChild;

        // Process fragment content
        if (first)
        {
          // Clone every fragment except the last one
          var last = this.length-1;
          for (var i=0, l=last; i<l; i++) {
            callback.call(this, this[i], fragment.cloneNode(true));
          }

          callback.call(this, this[last], fragment);
        }

        // Process script elements
        if (scripts)
        {
          var script;
          var Func = qx.lang.Function;

          for (var i=0, l=scripts.length; i<l; i++)
          {
            script = scripts[i];

            // Executing script code or loading source depending on element configuration
            if (script.src) {
              var loader = new qx.bom.request.Script();
              loader.open("GET", script.src);
              loader.send();
            } else {
              Func.globalEval(script.text || script.textContent || script.innerHTML || "");
            }

            // Removing element from old parent
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }
        }

        return this;
      },


      /**
       * Helper for wrapping the methods to insert/replace content
       * so that they can be used in reverse order (selector is
       * given to the target method instead)
       *
       * @param args {String[]} All arguments (selectors) of the original method call
       * @param original {String} Name of the original method to wrap
       * @return {Collection} The collection is returned for chaining proposes
       */
      __manipulateTo : function(args, original)
      {
        var Selector = qx.bom.Selector;
        var Lang = qx.lang.Array;

        // Build a large collection from the individual elements
        var col = [];
        for (var i=0, l=args.length; i<l; i++)
        {
          if (qx.core.Environment.get("qx.debug"))
          {
            if (typeof args[i] !== "string") {
              throw new Error("Invalid argument for selector query: " + args[i]);
            }
          }

          col.push.apply(col, Selector.query(args[i]));
        }

        // Remove duplicates and transform into Collection
        col = Lang.cast(Lang.unique(col), qx.bom.Collection);

        // Process modification
        for (var i=0, il=this.length; i<il; i++) {
          col[original](this[i]);
        }

        return this;
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING INSIDE
      ---------------------------------------------------------------------------
      */

      /**
       * Append content to the inside of every matched element.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * Please make sure you understand the security implications of this
       * method when passing HTML strings from untrusted input. See
       * {@link qx.bom.Html#clean}.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      append : function(varargs) {
        return this.__manipulate(arguments, this.__appendCallback);
      },


      /**
       * Prepend content to the inside of every matched element.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * Please make sure you understand the security implications of this
       * method when passing HTML strings from untrusted input. See
       * {@link qx.bom.Html#clean}.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      prepend : function(varargs) {
        return this.__manipulate(arguments, this.__prependCallback);
      },


      /**
       * Callback for {@link #append} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __appendCallback : function(rel, child) {
        rel.appendChild(child);
      },


      /**
       * Callback for {@link #prepend} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __prependCallback : function(rel, child) {
        rel.insertBefore(child, rel.firstChild);
      },


      /**
       * Append all of the matched elements to another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).append(B)</code>, in that instead
       * of appending B to A, you're appending A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      appendTo : function(varargs) {
        return this.__manipulateTo(arguments, "append");
      },


      /**
       * Append all of the matched elements to another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).prepend(B)</code>,  in that instead
       * of prepending B to A, you're prepending A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      prependTo : function(varargs) {
        return this.__manipulateTo(arguments, "prepend");
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING OUTSIDE
      ---------------------------------------------------------------------------
      */

      /**
       * Insert content before each of the matched elements.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      before : function(varargs) {
        return this.__manipulate(arguments, this.__beforeCallback);
      },


      /**
       * Insert content after each of the matched elements.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      after : function(varargs) {
        return this.__manipulate(arguments, this.__afterCallback);
      },


      /**
       * Callback for {@link #before} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __beforeCallback : function(rel, child) {
        rel.parentNode.insertBefore(child, rel);
      },


      /**
       * Callback for {@link #after} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __afterCallback : function(rel, child) {
        rel.parentNode.insertBefore(child, rel.nextSibling);
      },


      /**
       * Insert all of the matched elements after another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).before(B)</code>, in that instead
       * of inserting B to A, you're inserting A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      insertBefore : function(varargs) {
        return this.__manipulateTo(arguments, "before");
      },


      /**
       * Insert all of the matched elements before another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).after(B)</code>,  in that instead
       * of inserting B to A, you're inserting A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      insertAfter : function(varargs) {
        return this.__manipulateTo(arguments, "after");
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING AROUND
      ---------------------------------------------------------------------------
      */

      /**
       * Wrap all the elements in the matched set into a single wrapper element.
       *
       * This is different from {@link #wrap} where each element in the matched set
       * would get wrapped with an element.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of
       * a document.
       *
       * This works by going through the first element provided (which is
       * generated, on the fly, from the provided HTML) and finds the deepest
       * descendant element within its structure -- it is that element, which
       * will wrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrapAll : function(content)
      {
        var first = this[0];
        if (first)
        {
          // Parse HTML / Clone given content
          var wrap = qx.bom.Collection.create(content, first.ownerDocument).clone();

          // Insert wrapper before first element
          if (first.parentNode) {
            first.parentNode.insertBefore(wrap[0], first);
          }

          // Wrap so that we have the innermost element of every item in the
          // collection. Afterwards append the current items to the wrapper.
          wrap.map(this.__getInnerHelper).append(this);
        }

        return this;
      },


      /**
       * Finds the deepest child inside the given element
       *
       * @param elem {Element} Outer DOM element
       * @return {Element} Inner DOM element
       */
      __getInnerHelper : function(elem)
      {
        while (elem.firstChild) {
          elem = elem.firstChild;
        }

        return elem;
      },


      /**
       * Wrap the inner child contents of each matched element (including
       * text nodes) with an HTML structure.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of a
       * document. This works by going through the first element provided
       * (which is generated, on the fly, from the provided HTML) and finds the
       * deepest ancestor element within its structure -- it is that element
       * that will enwrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrapInner : function(content)
      {
        // Fly weight pattern, reuse collection instance for every iteration.
        var helper = new qx.bom.Collection(1);

        for (var i=0, l=this.length; i<l; i++)
        {
          helper[0] = this[i];
          helper.contents().wrapAll(content);
        }

        return this;
      },


      /**
       * Wrap each matched element with the specified HTML content.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of a
       * document. This works by going through the first element provided (which
       * is generated, on the fly, from the provided HTML) and finds the deepest
       * descendant element within its structure -- it is that element, which
       * will wrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrap : function(content)
      {
        var helper = new qx.bom.Collection(1);

        /*
        // TODO: The current implementation of forEach() breaks in IE7

        return this.forEach(function(elem)
        {
          qx.log.Logger.debug("forEach " + elem);
          helper[0] = elem;
          helper.wrapAll(content);
        });
        */

        for (var i=0, l=this.length; i<l; i++)
        {
          helper[0] = this[i];
          helper.wrapAll(content);
        }

        return this;
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: REPLACING
      ---------------------------------------------------------------------------
      */

      /**
       * Replaces all matched elements with the specified HTML or DOM elements.
       *
       * This returns the JQuery element that was just replaced, which has been
       * removed from the DOM.
       *
       * @param content {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceWith : function(content) {
        return this.after(content).remove();
      },


      /**
       * Replaces the elements matched by the specified selector
       * with the matched elements.
       *
       * This function is the complement to {@link #replaceWith} which does
       * the same task with the parameters reversed.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceAll : function(varargs) {
        return this.__manipulateTo(arguments, "replaceWith");
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: REMOVING
      ---------------------------------------------------------------------------
      */

      /**
       * Removes all matched elements from the DOM. This does NOT remove them
       * from the collection object, allowing you to use the matched
       * elements further. When a selector is given the list is filtered
       * by the selector and the chaining stack is pushed by the new collection.
       *
       * The Collection content can be pre-filtered with an optional selector
       * expression.
       *
       * @param selector {String?null} Selector to filter current collection
       * @return {Collection} The collection is returned for chaining proposes
       */
      remove : function(selector)
      {
        // Filter by given selector
        var coll = this;
        if (selector)
        {
          coll = this.filter(selector);
          if (coll.length == 0) {
            return this;
          }
        }

        // Remove elements from DOM
        for (var i=0, il=coll.length, current; i<il; i++)
        {
          current = coll[i];
          if (current.parentNode) {
            current.parentNode.removeChild(current);
          }
        }

        // Return filtered collection (or original if no selector given)
        return coll;
      },


      /**
       * Removes all matched elements from their parent elements,
       * cleans up any attached events or data and clears up the Collection
       * to free up memory.
       *
       * The Collection content can be pre-filtered with an optional selector
       * expression.
       *
       * Modifies the current collection (without pushing the stack) as it
       * removes all elements from the collection which where removed from the DOM.
       * This normally means all elements in the collection when no selector is given.
       *
       * @param selector {String?null} Selector to filter current collection
       * @return {Collection} The collection is returned for chaining proposes
       */
      destroy : function(selector)
      {
        if (this.length == 0) {
          return this;
        }

        var Selector = qx.bom.Selector;

        // Filter by given selector
        var coll = this;
        if (selector)
        {
          coll = this.filter(selector);
          if (coll.length == 0) {
            return this;
          }
        }

        // Collect all inner elements to prevent memory leaks
        var Manager = qx.event.Registration.getManager(this[0]);
        for (var i=0, l=coll.length, current, inner; i<l; i++)
        {
          // Cache element
          current = coll[i];

          // Remove from element in collection
          Manager.removeAllListeners(current);

          // Remove events from all children (recursive)
          inner = Selector.query("*", current);
          for (var j=0, jl=inner.length; j<jl; j++) {
            Manager.removeAllListeners(inner[j]);
          }

          // Remove collection element from DOM
          if (current.parentNode) {
            current.parentNode.removeChild(current);
          }
        }

        // Revert filter and reduce size
        if (selector)
        {
          // Exit chaining
          coll.end();

          // Remove all selected elements from current list
          qx.lang.Array.exclude(this, coll);
        }
        else
        {
          this.length = 0;
        }

        return this;
      },


      /**
       * Removes all content from the elements
       *
       * @signature function()
       * @return {Collection} The collection is returned for chaining proposes
       */
      empty : function()
      {
        var Collection = qx.bom.Collection;

        for (var i=0, l=this.length; i<l; i++)
        {
          // Remove element nodes and prevent memory leaks
          Collection.query(">*", this[i]).destroy();

          // Remove any remaining nodes
          while (this.firstChild) {
            this.removeChild(this.firstChild);
          }
        }

        return this;
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: CLONING
      ---------------------------------------------------------------------------
      */

      /**
       * Clone all DOM elements of the collection and return them in a newly
       * created collection.
       *
       * @param events {Boolean?false} Whether events should be copied as well
       * @return {Collection} The copied elements
       */
      clone : function(events)
      {
        var Element = qx.bom.Element;

        return events ?
          this.map(function(elem) { return Element.clone(elem, true); }) :
          this.map(Element.clone, Element);
      }
    },




    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */

    defer : function(statics)
    {
      // Define alias as used by jQuery if not already in use.
      if (window.$ == null) {
        window.$ = statics.create;
      }
    }
  });
})();

