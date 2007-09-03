/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html)

************************************************************************ */

/**
 * High-performance, high-level DOM element creation and managment.
 *
 * Includes support for HTML and style attributes. Elements also have
 * got a powerful children and visibility managment.
 *
 * Processes DOM insertion and modification with a advanced logic
 * to reduce the real transactions.
 *
 * TODO: Any chance to support domInserted or domRemoved events?
 */
qx.Class.define("qx.html.Element",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Element
   */
  construct : function()
  {
    this.base(arguments);

    // All added children (each one is a qx.html.Element itself)
    this.__children = [];
    
    // Maps which contains styles and attribute
    // These are used to keep data for pre-creation
    // and until the next sync. These are never cleared.
    // They always reflect the presently choosen values.
    // Please note that these need not to be always in
    // sync with the DOM.
    this.__attribValues = {};
    this.__styleValues = {};
    this.__eventValues = {};
    
    // Add hashcode (temporary, while development)
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.setAttribute("hashCode", this.toHashCode());
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      STATIC DATA
    ---------------------------------------------------------------------------
    */
    
    /** {Boolean} If debugging should be enabled */
    __debug : true,
    
    
    /** {Map} Contains the modified {@link qx.html.Element}s. The key is the hash code. */
    __modified : {},





    /*
    ---------------------------------------------------------------------------
      FLUSH OBJECT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Syncs data of an HtmlElement object to the DOM.
     *
     * @type static
     * @param obj {qx.html.Element} Element to flush
     * @return {void}
     */
    __flushObject : function(obj)
    {
      if (obj.__new) 
      {
        console.debug("Flush: " + obj.getAttribute("id") + " [new] (" + obj.__children.length + " children)");
        
        this.__copyData(obj); 
        this.__insertChildren(obj);
        
        delete obj.__new;
      }
      else
      {
        console.debug("Flush: " + obj.getAttribute("id") + " [existing]");
        
        this.__syncData(obj);
        
        if (obj.__modifiedChildren) 
        {
          this.__syncChildren(obj);
          obj.__modifiedChildren = false;
        }
      }
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR ATTRIBUTE/STYLE/EVENT FLUSH
    ---------------------------------------------------------------------------
    */
        
    /**
     * Copies data between the internal representation and the DOM. This
     * simply copies all the data and only works well directly after
     * element creation. After this the data must be synced using {@link #__syncData}
     *
     * @type static
     * @param obj {qx.html.Element} Element to process
     * @return {void}
     */
    __copyData : function(obj)
    {
      var elem = obj.__element;
      
      var Attribute = qx.bom.element.Attribute;
      var Style = qx.bom.element.Style;
      
      // Copy attributes
      var data = obj.__attribValues;
      for (var key in data) {
        Attribute.set(elem, key, data[key]);
      }
      
      // Copy styles
      var data = obj.__styleValues;
      for (var key in data) {
        Style.set(elem, key, data[key]);
      }
      
      // Copy events
      var data = obj.__eventValues;
      for (var key in data) {
        // TODO
      }
    },
    

    /**
     * Syncronizes data between the internal representation and the DOM. This
     * is the counterpart of {@link #__copyData} and is used for further updates
     * after the element has been created.
     *
     * @type static
     * @param obj {qx.html.Element} Element to process
     * @return {void}
     */  
    __syncData : function(obj)
    {
      var elem = obj.__element;
      
      var Attribute = qx.bom.element.Attribute;
      var Style = qx.bom.element.Style;
      
      // Sync attributes
      var jobs = obj.__attribJobs;
      if (jobs)
      {
        var data = obj.__attribValues;
        for (var key in jobs) {
          Attribute.set(elem, key, data[key]);
        }
        
        obj.__attribJobs = null;
      }
      
      // Sync styles
      var jobs = obj.__styleJobs;
      if (jobs)
      {
        var data = obj.__styleValues;
        for (var key in data) {
          Style.set(elem, key, data[key]);
        }
        
        obj.__styleJobs = null;
      }
      
      // Sync events
      var jobs = obj.__eventJobs;
      if (jobs)
      {
        var data = obj.__eventValues;
        for (var key in data) {
          // TODO 
        }
        
        obj.__eventJobs = null;
      }
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR CHILDREN FLUSH
    ---------------------------------------------------------------------------
    */    
    
    /**
     * Append all child nodes to the DOM
     * element. This function is used when the element is initially
     * created. After this initial apply {@link #__syncChildren} is used
     * instead.
     *
     * @type static
     * @param obj {qx.html.Element} the element to process
     * @return {void}
     */    
    __insertChildren : function(obj)
    {
      var domElement = obj.__element;
      
      for (var i=0, children=obj.__children, l=children.length; i<l; i++) 
      {
        if (children[i].__visible) {
          domElement.appendChild(children[i].__element);
        }
      }
    },
    

    /**
     * Syncronize internal children hierarchy to the DOM. This is used
     * for further runtime updates after the element has been created
     * initially.
     *    
     * @type static
     * @param obj {qx.html.Element} the element to process
     * @return {void}
     */    
    __syncChildren : function(obj)
    {
      var dataParent = obj;
      var dataChildren = dataParent.__children;
      var dataLength = dataChildren.length
      var dataChild;
      var dataPos = 0;
      var dataEl;

      var domParent = dataParent.__element;
      var domChildren = domParent.childNodes;
      var domEl;
      
      // Start from beginning and bring DOM in sync 
      // with the data structure
      for (var i=0; i<dataLength; i++) 
      {
        dataChild = dataChildren[i];
        
        // Only process visible childs
        if (dataChild.__visible) 
        {
          dataEl = dataChild.__element;
          domEl = domChildren[dataPos];
          
          // Only do something when out of sync
          if (dataEl != domEl) 
          {
            if (domEl) {
              domParent.insertBefore(dataEl, domEl);
            } else {
              domParent.appendChild(dataEl);  
            }
          }
          
          // Increase counter which ignores invisible entries
          dataPos++;
        }
      }
      
      // Remove remaining children
      while (domChildren[dataLength]) {
        domParent.removeChild(domParent.lastChild); 
      }
    },
    




    /*
    ---------------------------------------------------------------------------
      PUBLIC ELEMENT FLUSH
    ---------------------------------------------------------------------------
    */ 
    
    /**
     * Flush the global modified list
     *
     * @type static
     */
    flush : function()
    {
      if (this.__inFlush) 
      {
        console.warn("Already in flush!");
        return;
      }

      var modified = this.__modified;
      
      if (qx.lang.Object.isEmpty(modified)) 
      {
        console.warn("Flush with no modificiations!");
        return; 
      }

      // Block repeated flush calls
      // TODO: Is this really needed? (Javascript has no threads)
      this.__inFlush = true;




      // User feedback
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__debug) 
        {
          console.debug("Processing " + qx.lang.Object.getLength(modified) + " scheduled modifications...");
          
          for (var hc in modified) {
            console.debug("  - " + modified[hc].getAttribute("id")); 
          }
        }
      }
      
      
      
      
      // Split modified into rendered/invisible and keep
      // logically invisible children in the old modified.
      var domRendered = {};
      var domInvisible = {};
      var entry;
      
      for (var hc in modified)
      {
        entry = modified[hc];
        
        if (entry.hasVisibleRoot())
        {
          // TODO: Optimize this. Remove overlap in children collect
          // ...
          
          // Add self to modified
          if (entry.isDomRendered()) {
            domRendered[entry.toHashCode()] = entry;
          } else {
            domInvisible[entry.toHashCode()] = entry;
          }

          // Test children
          if (!entry.__element || entry.__new || entry.__modifiedChildren)
          {
            children = entry.__recursivelyCollectVisibleChildren();
            
            for (var j=0, cl=children.length; j<cl; j++)
            {
              if (children[j].isDomRendered()) {
                domRendered[children[j].toHashCode()] = children[j];
              } else {
                domInvisible[children[j].toHashCode()] = children[j];
              }                
            }
          }
        }
      }
      
      
      
      // User feedback
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__debug) 
        {
          console.debug("Updating " + qx.lang.Object.getLength(domInvisible) + " DOM invisible elements");
          for (var hc in domInvisible) {
            console.debug("  - " + domInvisible[hc].getAttribute("id")); 
          }

          console.debug("Updating " + qx.lang.Object.getLength(domRendered) + " DOM rendered elements");
          for (var hc in domRendered) {
            console.debug("  - " + domRendered[hc].getAttribute("id")); 
          }
        }
      }
      
      
      
      // Flush queues: Create first
      // This is done previously because the other
      // elements flushed could already need one of these
      // currently missing elements.
      for (var hc in domInvisible)
      {
        if (!domInvisible[hc].__element) {
          domInvisible[hc].__createDomElement();
        }
      }    
      
      // Flush queues: Apply children, styles and attributes
      for (var hc in domInvisible) {
        this.__flushObject(domInvisible[hc]);
      }
             
      for (var hc in domRendered) {
        this.__flushObject(domRendered[hc]);
      }
            
      
     
     
      // Complete delete of modified data
      // Even not processed elements could be removed
      // With the next event they become visible they
      // will dynamically readded to the queue.
      // This action keep the modified data small even
      // after some unsynced elements are invisible.
      this.__modified = {};     
  
      // Remove process flag
      delete this.__inFlush;
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
      INTERNAL HELPERS
    ---------------------------------------------------------------------------
    */    
    
    /** {String} Node name of the element to create */
    __nodeName : "div",
    
    
    /** {Element} DOM element of this object */
    __element : null,
    
    
    /** {Boolean} Temporary marker for just created elements */
    __new : false,
    
    
    /** {Boolean} Marker for always visible root nodes (often the body node) */
    __root : false,
    
    
    /** {Boolean} Whether the element should be visible */
    __visible : true,
    
    
    /**
     * Add the element to the global modification list.
     *
     * @type static
     * @return {void}
     */
    __scheduleSync : function() {
      qx.html.Element.__modified[this.toHashCode()] = this;
    },
    
    
    /**
     * Removed the element from the global modification list.
     *
     * @type static
     * @return {void}
     */
    __unscheduleSync : function() {
      delete qx.html.Element.__modified[this.toHashCode()];
    },


    /**
     * Finds all visible marked children of this element.
     *
     * @type static
     * @param res {Array?} Optional array of already found children.
     *   Normally only used by the recursion
     * @return {Array} list of all found children
     */
    __recursivelyCollectVisibleChildren : function(res)
    {
      if (!res) {
        var res = []; 
      }
      
      var ch = this.__children;      
      if (ch)
      {
        for (var i=0, l=ch.length; i<l; i++) 
        {
          // Ignore invisible children (and all their children)
          if (ch[i].__visible)
          {
            // Only add to modified when uncreated or new or has jobs
            if (!ch[i].__element || ch[i].__new || ch[i].__hasJobs()) {
              res.push(ch[i]);
            }
            
            // Test children, too
            ch[i].__recursivelyCollectVisibleChildren(res);
          }
        }
      }
      
      return res;
    }, 
    
    
    /**
     * If this element has any jobs todo when it becomes visible
     * This only succeeds for already created elements. New elements
     * never have any jobs. (In this case it is just a copy-paste, the
     * element is processed as if it is empty).
     *
     * @type static
     * @return {Boolean} <code>true</code> when the element has at least one job
     */    
    __hasJobs : function() 
    {
      var tool = qx.lang.Object;
      return this.__modifiedChildren || !tool.isEmpty(this.__styleJobs) || !tool.isEmpty(this.__attribJobs) || !tool.isEmpty(this.__eventJobs);
    },
    
    
    /**
     * Marks the element as hidden which means it will be removed
     * from the DOM and ignored for updates until get visible again.
     *
     * @type member
     * @return {void}
     */    
    __markAsHidden : function() 
    {
      if (!this.__visible) {
        return; 
      }
      
      // If the parent element is created, schedule 
      // the modification for it
      var pa = this.__parent;
      if (pa && pa.__element) 
      {
        pa.__modifiedChildren = true;
        pa.__scheduleSync(); 
      }      
      
      this.__visible = false; 
    },
    
    
    /**
     * Marks the element as visible which means it will be moved into
     * the DOM again and synced with the internal data representation.
     *
     * @type member
     * @return {void}
     */   
    __markAsVisible : function() 
    {
      if (this.__visible) {
        return; 
      }
      
      // If the parent element is created, schedule 
      // the modification for it
      var pa = this.__parent;
      if (pa && pa.__element) 
      {
        pa.__modifiedChildren = true;
        pa.__scheduleSync(); 
      }
      
      this.__visible = true; 
    },
    
    
    /**
     * Internal helper to generate the DOM element
     *
     * @type member
     */
    __createDomElement : function() 
    {
      // TODO: Support different node types
      // e.g. "flash" for Flash.create() ?
      // e.g. "iframe" for Iframe.create() ?
      // or is this better placed in separate classes which extends this one?
      
      // console.log("Creating: " + this.getAttribute("id"));
      this.__element = qx.bom.Element.create(this.__nodeName);
      this.__element.QxElement = this;
      
      // Mark as new
      this.__new = true;
    },


    /**
     * Internal helper for all children addition needs
     *
     * @type member
     * @param child {var} the element to add
     * @throws an exception if the given element is already a child
     *     of this element
     */
    __addChildHelper : function(child)
    {
      if (child.__parent === this) {
        throw new Error("Child is already in: " + child);
      }

      // Remove from previous parent
      if (child.__parent) {
        child.__parent.remove(child);
      }

      // Convert to child of this object
      child.__parent = this;

      // Register job and add to queue for existing elements
      if (this.__element)
      {
        this.__modifiedChildren = true;
        this.__scheduleSync();
      }
    },


    /**
     * Internal helper for all children removal needs
     *
     * @type member
     * @param child {qx.html.Element} the removed element
     * @throws an exception if the given element is not a child
     *     of this element
     */
    __removeChildHelper : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      // Register job and add to queue for existing elements
      if (this.__element)
      {
        this.__modifiedChildren = true;
        this.__scheduleSync();
      }

      // Remove reference to old parent
      delete child.__parent;
    },
    
    
    /**
     * Internal helper for all children move needs
     *
     * @type member
     * @param child {qx.html.Element} the moved element
     * @throws an exception if the given element is not a child
     *     of this element
     */    
    __moveChildHelper : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }      
      
      // Register job and add to queue for existing elements
      if (this.__element)
      {
        this.__modifiedChildren = true;
        this.__scheduleSync();
      }
    },






    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGEMENT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Returns a copy of the internal children structure.
     *
     * @type member
     * @return {Array} the children list
     */
    getChildren : function()
    {
      // protect structure using a copy
      return qx.lang.Array.copy(this.__children);
    },


    /**
     * Find the position of the given child
     *
     * @type member
     * @param child {qx.html.Element} the child
     * @return {Integer} returns the position. If the element
     *     is not a child <code>-1</code> will be returned.
     */
    indexOf : function(child) {
      return this.__children.indexOf(child);
    },
        
    
    /**
     * Append all given children at the end of this element.
     *
     * @type member
     * @param childs {qx.html.Element...} elements to insert
     * @return {qx.html.Element} this object (for chaining support)
     */
    add : function(childs)
    {
      if (arguments[1])
      {
        for (var i=0, l=arguments.length; i<l; i++) {
          this.__addChildHelper(arguments[i]);
        }
        
        this.__children.push.apply(this.__children, arguments);
      }
      else
      {
        this.__addChildHelper(childs);
        this.__children.push(childs); 
      }

      return this;
    },


    /**
     * Inserts the given element after the given child.
     *
     * @type member
     * @param child {qx.html.Element} the element to insert
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertAfter : function(child, rel)
    {
      this.__addChildHelper(child);
      qx.lang.Array.insertAfter(this.__children, child, rel);

      return this;
    },


    /**
     * Inserts the given element before the given child.
     *
     * @type member
     * @param child {qx.html.Element} the element to insert
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertBefore : function(child, rel)
    {
      this.__addChildHelper(child);
      qx.lang.Array.insertBefore(this.__children, child, rel);

      return this;
    },


    /**
     * Inserts a new element at the given position
     *
     * @type member
     * @param child {qx.html.Element} the element to insert
     * @param index {Integer} the index (starts at 0 for the
     *     first child) to insert (the index of the following
     *     children will be increased by one)
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertAt : function(child, index)
    {
      this.__addChildHelper(child);
      qx.lang.Array.insertAt(this.__children, child, index);

      return this;
    },


    /**
     * Remove all given children from this element.
     *
     * @type member
     * @param childs {qx.html.Element...} children to remove
     * @return {qx.html.Element} the removed element
     */
    remove : function(childs)
    {
      if (arguments[1])
      {
        var child;
        for (var i=0, l=arguments.length; i<l; i++) 
        {
          child = arguments[i];
          
          this.__removeChildHelper(child);
          qx.lang.Array.remove(this.__children, child);
        }
      }
      else
      {
        this.__removeChildHelper(childs);
        qx.lang.Array.remove(this.__children, childs);        
      }

      return this;
    },


    /**
     * Remove the child at the given index from this element.
     *
     * @type member
     * @param index {Integer} the position of the
     *     child (starts at 0 for the first child)
     * @return {qx.html.Element} the removed element
     */
    removeAt : function(index)
    {
      this.__removeChildHelper(child);
      return qx.lang.Array.removeAt(this.__children, index);
    },


    /**
     * Move the given child to the given index. The index
     * of the child on this index (if so) and all following
     * siblings will be increased by one.
     *
     * @type member
     * @param child {var} the child to move
     * @param index {Integer} the index (starts at 0 for the first child)
     * @return {qx.html.Element} this object (for chaining support)
     * @throws an exception when the given element is not child
     *      of this element.
     */
    moveTo : function(child, index)
    {
      this.__moveChildHelper(child);

      var oldIndex = this.__children.indexOf(child);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      } else if (oldIndex < index) {
        index--;
      }

      qx.lang.Array.removeAt(this.__children, oldIndex);
      qx.lang.Array.insertAt(this.__children, child, index);

      return this;
    },


    /**
     * Move the given <code>child</code> before the child <code>rel</code>.
     *
     * @type member
     * @param child {qx.html.Element} the child to move
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveBefore : function(child, rel) {
      return this.moveTo(child, this.__children.indexOf(rel));
    },


    /**
     * Move the given <code>child</code> after the child <code>rel</code>.
     *
     * @type member
     * @param child {qx.html.Element} the child to move
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveAfter : function(child, rel) {
      return this.moveTo(child, this.__children.indexOf(rel) + 1);
    },






    /*
    ---------------------------------------------------------------------------
      DOM ELEMENT ACCESS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Sets the element to an already existing node. It will be
     * assumed that this DOM element is already visible e.g.
     * like a normal displayed element in the document's body.
     *
     * @type member
     * @param elem {Element} the dom element to set
     * @return {void}
     * @throws TODOC
     */
    setDomElement : function(elem)
    {
      if (this.__element) {
        throw new Error("Elements could not be replaced!");
      }

      // Initialize based on given element
      this.__element = elem;
      
      // Mark as root
      this.__root = true;
      
      // Mark as new
      this.__new = true;
      
      // Register for syncronization
      if (this.__visible) {
        this.__scheduleSync();
      }
    },


    /**
     * Returns the DOM element (if created). Please use this with caution.
     * It is better to make all changes to the object itself using the public
     * API rather than to the underlying DOM element.
     *
     * @type member
     * @internal
     * @return {Element} the DOM element node
     * @throws an error if the element was not yet created
     */
    getDomElement : function()
    {
      if (!this.__element) {
        throw new Error("Element is not yet created!");
      }

      return this.__element;
    },
    
    
    
    


    /*
    ---------------------------------------------------------------------------
      LOGICAL HELPERS FOR FLUSH LOGIC
    ---------------------------------------------------------------------------
    */    
    
    /**
     * Walk up the internal children hierarchy and 
     * look if one of the children is marked as root
     */
    hasVisibleRoot : function()
    {
      var pa = this;
      
      // Any chance to cache this information in the parents?
      while(pa)
      {
        if (pa.__root) {
          return true; 
        }
        
        if (!pa.__visible) {
          return false; 
        }
        
        pa = pa.__parent;
      }
      
      return false;
    },
    
    
    /**
     * If the element is created and inserted into the DOM
     * structure of the underlying document.
     *
     */
    isDomRendered : function()
    {
      var el = this.__element;
      
      if (!el) {
        return false; 
      }
      
      // Any faster solution here?
      var doc = qx.dom.Node.getDocument(el);
      return qx.dom.Hierarchy.contains(doc, el);
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      STYLE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set up the given style attribute
     *
     * @type member
     * @param key {String} the name of the style attribute
     * @param value {var} the value
     * @return {qx.html.Element} this object (for chaining support)
     */
    setStyle : function(key, value)
    {
      this.__styleValues[key] = value;
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }
        
        // Store job info
        this.__styleJobs[key] = true;
        
        // Normally we should made a deep look here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__visible) {
          this.__scheduleSync();
        }
      }
      
      return this;
    },


    /**
     * Apply the given styles
     *
     * @type member
     * @param map {Map} Incoming style map (key=property name, value=property value)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setStyles : function(map)
    {
      for (var key in map) {
        this.__styleValues[key] = map[key];
      }
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.        
      if (this.__element) 
      {
        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }
        
        // Copy to jobs map
        for (var key in map) {
          this.__styleJobs[key] = true;
        }
        
        // Normally we should made a deep look here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__visible) {
          this.__scheduleSync();
        }
      }
      
      return this;
    },
    

    /**
     * Get the value of the given style attribute.
     *
     * @type member
     * @param key {String} name of the style attribute
     * @return {var} the value of the style attribute
     */
    getStyle : function(key) {
      return this.__styleValues[key];
    },





    /*
    ---------------------------------------------------------------------------
      ATTRIBUTE SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Set up the given attribute
     *
     * @type member
     * @param key {String} the name of the attribute
     * @param value {var} the value
     * @return {qx.html.Element} this object (for chaining support)
     */
    setAttribute : function(key, value)
    {
      this.__attribValues[key] = value;
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }
        
        // Store job info
        this.__attribJobs[key] = true;
        
        // Normally we should made a deep look here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.        
        if (this.__visible) {
          this.__scheduleSync();
        }
      }      
      
      return this;
    },
    
    
    /**
     * Apply the given attributes
     *
     * @type member
     * @param map {Map} Incoming attribute map (key=attribute name, value=attribute value)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setAttributes : function(map)
    {
      for (var key in map) {
        this.__attribValues[key] = map[key];
      }
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }

        // Copy to jobs map
        for (var key in map) {
          this.__attribJobs[key] = true;
        }
        
        // Normally we should made a deep look here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__visible) {
          this.__scheduleSync();
        }
      }
      
      return this;
    },


    /**
     * Get the value of the given attribute.
     *
     * @type member
     * @param key {String} name of the attribute
     * @return {var} the value of the attribute
     */
    getAttribute : function(key) {
      return this.__attribValues[key];
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Adds an event listener to the element.
     *
     * @type member
     * @param name {String} Name of the event
     * @param callback {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    addEventListener : function(name, callback, self, capture)
    {
      // TODO
      return this;
    },
    
    
    /**
     * Removes an event listener from the element.
     *
     * @type member
     * @param name {String} Name of the event
     * @param callback {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeEventListener : function(name, callback, self, capture)
    {
      // TODO
      return this;
    }
  }
});
