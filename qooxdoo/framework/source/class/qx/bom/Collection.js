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

#require(qx.core.BaseArray)

#require(qx.bom.Document)
#require(qx.bom.Element)
#require(qx.bom.Input)
#require(qx.bom.Viewport)

#require(qx.bom.element.Attribute)
#require(qx.bom.element.Class)
#require(qx.bom.element.Location)
#require(qx.bom.element.Style)

************************************************************************ */

(function()
{
  /**
   * Helper method to create setters for all DOM elements in the collection
   *
   * @param clazz {Class} Static class which contains the given method
   * @param method {String} Name of the method
   * @return {Function} Returns a new function which wrapps the given function
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
   * @return {Function} Returns a new function which wrapps the given function
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
   * The collection uses an interesting concept called a "Builder" to make 
   * its code short and simple. The Builder pattern is an object-oriented 
   * programming design pattern that has been gaining popularity.
   *
   * In a nutshell: Every method on the collection returns the collection object itself, 
   * allowing you to 'chain' upon it, for example:
   *
   * <pre class="javascript">
   * qx.bom.Selector.query("a").addClass("test")
   *   .setStyle("visibility", "visible").setAttribute("html", "foo");
   * </pre>
   */
  qx.Class.define("qx.bom.Collection",
  {
    extend : qx.core.BaseArray,
    
    
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
      
    statics : 
    {
      /** {RegExp} Test for HTML or ID */
      __expr : /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
      
      
      /** 
       * Processes the input and translates it to a collection instance.
       *
       * @param input {Element|Html|Selector} Support HTML elements, HTML strings and selector strings
       * @return {Collection} Newly created collection 
       */
      from : function(input)
      {
        if (input.nodeType)
        {
          return new qx.bom.Collection(input);
        }
        else if (typeof input === "string")
        {
          var match = this.__expr.exec(input);
          if (match)
          {
            if (match[1]) 
            {
              console.debug("From HTML", match[1]);  
              
              // TODO
              
            } 
            else if (match[3]) 
            {
              var id = match[3];
              var elem = document.getElementById(id);
              
              // Handle the case where IE and Opera return items
              // by name instead of ID
              if (elem && elem.id != id) {
                return qx.bom.Selector.query(input);
              }
              
              return new qx.bom.Collection(elem);              
            }
          }
          else
          {
            return qx.bom.Selector.query(input);
          }    
        }
        else
        {
          throw new Error("Unsupported type: " + input);
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
       * radiobutton use {@link qx.bom.element.Attribute.set} instead.
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
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
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
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @return {Collection} The collection is returned for chaining proposes     
       */
      resetStyle : setter(qx.bom.element.Style, "reset"),
     
       /**
        * Figures out the value of the given style property of 
        * the first element stored in the collection.
        *
        * @signature function(name, mode)
        * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
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
      getCss : setter(qx.bom.element.Style, "getCss"),   
      
               
    

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
       * @return {Collection} Detected offset parent capsulated into a new collection instance
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
       * Returns the left scroll position of the first element in the collection.
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
       * @param self {Object} Reference to the 'this' variable inside
       *       the event listener.
       * @param capture {Boolean} Whether to attach the event to the
       *       capturing phase of the bubbling phase of the event. The default is
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
       * @param self {Object} Reference to the 'this' variable inside
       *       the event listener.
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
        
        if (qx.lang.Function.isFunction(selector)) {
          res = qx.core.BaseArray.prototype.filter.call(this, selector, context);
        } else {
          res = qx.bom.Selector.matches(selector, this);
        }
        
        return this.__pushStack(res);
      },
      
      
      /**
       * Checks the current selection against a class and returns true, if 
       * at least one element of the selection has the given class.
       *
       * @param classname {String} Classname to check for
       * @return {Boolean} Whether at least one element uses the given class
       */
      hasClass: function(classname) {
        return !!classname && this.is("." + classname);
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
        var arr = qx.lang.Array.unique(res.concat(this));
        
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
          return this.__pushStack(Selector.queryNative(selector, this[0]));
        }
        else
        {
          // Let the selector do the work and merge all result arrays.
          var ret = [];
          for (var i=0, l=this.length; i<l; i++) {
            ret.push.apply(ret, Selector.queryNative(selector, this[i]));
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
         MANIPULATION: INSERTING INSIDE
      ---------------------------------------------------------------------------
      */    
      
      append : function()
      {
        
      },
      
      appendTo : function()
      {
        
      },

      prepend : function()
      {
        
      },
      
      prependTo : function()
      {
        
      },
      
      



      /*
      ---------------------------------------------------------------------------
         MANIPULATION: REMOVING
      ---------------------------------------------------------------------------
      */    

      /**
       * Removes all content from the elements
       *
       * @signature function()
       * @return {Collection} The collection is returned for chaining proposes     
       */
      empty : setter(qx.bom.Element, "empty") 
    }
  });
})();  