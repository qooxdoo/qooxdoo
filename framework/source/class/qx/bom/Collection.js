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

#require(qx.bom.element.Style)
#require(qx.bom.element.Attribute)
#require(qx.bom.element.Class)

#require(qx.bom.Element)

************************************************************************ */

(function()
{
  var setter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6)
    {
      var length = this.length;
      if (length > 0)
      {
        var ptn = clazz[method];
        for (var i=0; i<length; i++) {
          ptn.call(clazz, this[i], arg1, arg2, arg3, arg4, arg5, arg6);
        }          
      }
    
      return this;        
    };
  }; 

  var getter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6) 
    {
      if (this.length > 0) {
        return clazz[method](this[0], arg1, arg2, arg3, arg4, arg5, arg6);
      }
    
      return null;
    };
  };
  
  /**
   * Wraps a set of elements and offers the often used DOM methods to modify them.
   */
  qx.Class.define("qx.bom.Collection",
  {
    extend : qx.core.BaseArray,
    
    members :
    {
      /*
      ---------------------------------------------------------------------------
         STYLE API
      ---------------------------------------------------------------------------
      */    
      
      /**
       * Executes {@link qx.bom.element.Style.set} to modify the given style property
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
       * Set the full CSS content of the style attribute
       *
       * @signature function(value)
       * @param value {String} The full CSS string
       * @return {Collection} The collection is returned for chaining proposes     
       */
      setCss : setter(qx.bom.element.Style, "setCss"),           
     
      /**
       * Executes {@link qx.bom.element.Style.reset} to reset the given style property 
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
        * @param mode {Number} Choose one of the modes supported by {@link qx.bom.element.Style.get}
        * @return {var} The value of the style property
        */
      getStyle : getter(qx.bom.element.Style, "get"),
    
    
    
    
      /*
      ---------------------------------------------------------------------------
         ATTRIBUTE API
      ---------------------------------------------------------------------------
      */    
      
      /**
       * Executes {@link qx.bom.element.Attribute.set} to modify the given attribute
       * on all selected elements.
       *
       * @signature function(name, value)
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       * @return {Collection} The collection is returned for chaining proposes     
       */
      setAttribute : setter(qx.bom.element.Attribute, "set"),     
     
      /**
       * Executes {@link qx.bom.element.Attribute.reset} to reset the given attribute 
       * on all selected elements.
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
         CSS CLASS API
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
         ELEMENT API
      ---------------------------------------------------------------------------
      */    

      /**
       * Removes all content from the elements
       *
       * @signature function()
       * @return {Collection} The collection is returned for chaining proposes     
       */
      empty : setter(qx.bom.Element, "empty"),
      
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
         COLLECTION CHAINING/MODIFICATION
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
       * do not match the specified expression(s).
       *
       * @param expr {String} The expression to filter
       * @return {Collection} The filtered collection
       */
      filter : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The filtered collection
       */
      find : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The filtered collection
       */
      gt : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The filtered collection
       */
      lt : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The new collection
       */
      next : function() {
        
      },
      

      /** 
       * Removes elements matching the specified expression 
       * from the set of matched elements.
       *
       * @param expr {String} The expression to filter
       * @return {Collection} The filtered collection
       */
      not : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The new collection
       */
      parent : function() {
        
      },

      
      /** 
       *
       *
       * @return {Collection} The new collection
       */
      parents : function() {
        
      },
      

      /** 
       *
       *
       * @return {Collection} The new collection
       */
      siblings : function() {
        
      },
      

      /**
       * Undone of the last modification of the collection.
       *
       * These methods change the selection during a chained method call:
       * <code>add</code>, <code>children</code>, <code>eq</code>, <code>filter</code>, 
       * <code>find</code>, <code>gt</code>, <code>lt</code>, <code>next</code>, 
       * <code>not</code>, <code>parent</code>, <code>parents</code> and <code>siblings</code>
       */
      end : function() {
        return this.__prevObject || new qx.bom.Collection();
      }
    }
  });
})();  