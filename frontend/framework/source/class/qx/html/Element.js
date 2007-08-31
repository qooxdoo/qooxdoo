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
 * Includes support for HTML and style attributes. Allows to
 * add children or to apply text or HTML content.
 *
 * Processes DOM insertion and modification based on the concept
 * of edit distance in an optimal way. This means that operations
 * on visible DOM nodes will be reduced at all needs.
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
    
    // Used to schedule modifications after initial display
    this.__attribJobs = {};
    this.__styleJobs = {};
    this.__eventJobs = {};
    
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
    
    __debug : true,
    __modified : {},





    /*
    ---------------------------------------------------------------------------
      FLUSH OBJECT
    ---------------------------------------------------------------------------
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
        this.__syncChildren(obj);
      }
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR ATTRIBUTE/STYLE/EVENT FLUSH
    ---------------------------------------------------------------------------
    */
        
    /**
     *
     *
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
      
      // Attach/Detach events
      // TODO
    },
    

    /**
     *
     *
     */    
    __syncData : function(obj)
    {
      var elem = obj.__element;
      
      var Attribute = qx.bom.element.Attribute;
      var Style = qx.bom.element.Style;
      
      // Sync attributes
      var data = obj.__attribValues;
      var jobs = obj.__attribJobs;
      for (var key in jobs) {
        Attribute.set(elem, key, data[key]);
      }
      
      // Sync styles
      var data = obj.__styleValues;
      var jobs = obj.__styleJobs;
      for (var key in data) {
        Style.set(elem, key, data[key]);
      }
      
      // Attach/Detach events
      // TODO
      
      // Cleanup jobs
      this.__attribJobs = {};
      this.__styleJobs = {};
      this.__eventJobs = {};
    },
    
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR CHILDREN FLUSH
    ---------------------------------------------------------------------------
    */    
    
    /**
     * Internal helper to append all child nodes to the DOM
     * element. This function is used when the element is initially
     * created.
     *
     * @type static
     * @param obj {qx.html.Element} the element to flush
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
     * Internal helper to apply the DOM structure of the
     * defined children.
     *
     * @type static
     * @param obj {qx.html.Element} the element to flush
     */
    __syncChildren : function(obj)
    {
      if (!obj.__modifiedChildren) {
        return;  
      }
      
      delete obj.__modifiedChildren;
      
      // **********************************************************************
      //   Compute needed operations
      // **********************************************************************
      
      var domElement = obj.__element;
      var source = domElement.childNodes;
      var target = [];
      for (var i=0, ch=obj.__children, cl=ch.length; i<cl; i++) 
      {
        if (ch[i].__visible) {
          target.push(ch[i].__element); 
        }
      }

      // Compute edit operations
      var operations = qx.util.EditDistance.getEditOperations(source, target);

      /*
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // We need to convert the collection to an array otherwise
        // FireBug sometimes will display a live view of the DOM and not the
        // the snapshot at this moment.
        source = qx.lang.Array.fromCollection(source);
        
        console.log("Source: ", source.length + ": ", source);
        console.log("Target: ", target.length + ": ", target);
        console.log("Operations: ", operations);
      }
      */



      // **********************************************************************
      //   Process operations
      // **********************************************************************
      var job;
      var domOperations = 0;

      // Store offsets which are a result of element moves
      var offsets = [];

      for (var i=0, l=operations.length; i<l; i++)
      {
        job = operations[i];



        // ********************************************************************
        //   Apply offset
        // ********************************************************************
        if (offsets[job.pos] !== undefined)
        {
          job.pos -= offsets[job.pos];

          // We need to be sure that we don't get negative indexes.
          // This will otherwise break array/collection index access.
          if (job.pos < 0) {
            job.pos = 0;
          }
        }



        // ********************************************************************
        //   Process DOM
        // ********************************************************************
        if (job.operation === qx.util.EditDistance.OPERATION_DELETE)
        {
          // Ignore elements which are not placed at their original position anymore.
          if (domElement.childNodes[job.pos] === job.old)
          {
            // console.log("Remove: ", job.old);
            domElement.removeChild(job.old);
            domOperations++;
          }
        }
        else
        {
          // Operations: insert and replace
          // ******************************************************************
          //   Offset calculation
          // ******************************************************************
          // Element will be moved around in the same parent
          // We use the element on its old position and scan
          // to the begin. A counter will increment on each
          // step.
          //
          // This way we get the index of the element
          // from the beginning.
          //
          // After this we increment the offset of all affected
          // children (the following ones) until we reached the
          // current position in our operation modified. The reason
          // we stop at this point is that the following
          // childrens should already be placed correctly through
          // the operation method from the end to begin of the
          // edit distance algorithm.
          if (job.value.parentNode === domElement)
          {
            // find the position/index where the element is stored currently
            previousIndex = -1;
            iterator = job.value;

            do
            {
              previousIndex++;
              iterator = iterator.previousSibling;
            }
            while (iterator);

            // increment all affected offsets
            for (var j=previousIndex+1; j<=job.pos; j++)
            {
              if (offsets[j] === undefined) {
                offsets[j] = 1;
              } else {
                offsets[j]++;
              }
            }
          }



          // ******************************************************************
          //   The real DOM work
          // ******************************************************************
          if (job.operation === qx.util.EditDistance.OPERATION_REPLACE)
          {
            if (domElement.childNodes[job.pos] === job.old)
            {
              // console.log("Replace: ", job.old, " with ", job.value);
              domElement.replaceChild(job.value, job.old);
              domOperations++;
            }
            else
            {
              // console.log("Pseudo replace: ", job.old, " with ", job.value);
              job.operation = qx.util.EditDistance.OPERATION_INSERT;
            }
          }

          if (job.operation === qx.util.EditDistance.OPERATION_INSERT)
          {
            var before = domElement.childNodes[job.pos];

            if (before)
            {
              // console.log("Insert: ", job.value, " at: ", job.pos);
              domElement.insertBefore(job.value, before);
              domOperations++;
            }
            else
            {
              // console.log("Append: ", job.value);
              domElement.appendChild(job.value);
              domOperations++;
            }
          }
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__debug) {
          console.debug("  - " + domOperations + " DOM operations made");
        }
      }
    },


    /**
     * Flush the global modified for all existing element needs
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
      
      for (var hc in modified)
      {
        entry = modified[hc];
        
        if (entry.hasVisibleRoot())
        {
          // Add self to modified
          if (entry.isDomRendered()) {
            domRendered[entry.toHashCode()] = entry;
          } else {
            domInvisible[entry.toHashCode()] = entry;
          }

          // Remove from old modified data
          delete modified[entry.toHashCode()];
          
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
          console.debug("Ignoring " + qx.lang.Object.getLength(modified) + " hidden elements");

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
            
      
     
      // Complete delete
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
    
    __nodeName : "div",
    __element : null,
    __new : false,
    __root : false,
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
     *
     *
     */    
    __markAsHidden : function() 
    {
      if (!this.__visible) {
        return; 
      }
      
      // If the parent element is created, schedule 
      // the modification for it
      if (this.__parent && this.__parent.__element) 
      {
        this.__parent.__modifiedChildren = true;
        this.__parent.__scheduleSync(); 
      }      
      
      this.__visible = false; 
    },
    
    
    /**
     *
     *
     */    
    __markAsVisible : function() 
    {
      if (this.__visible) {
        return; 
      }
      
      // If the parent element is created, schedule 
      // the modification for it
      if (this.__parent && this.__parent.__element) 
      {
        this.__parent.__modifiedChildren = true;
        this.__parent.__scheduleSync(); 
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
      
      // Queue apply of already inserted children and applied styles etc.
      this.__scheduleSync();
    },


    /**
     * Returns the DOM element (if created). Please use this with caution.
     * It is better to make all changes to the object itself using the public
     * API rather than to the underlying DOM element.
     *
     * @type member
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
      
      if (this.__element) 
      {
        this.__styleJobs[key] = true;
        this.__scheduleSync();
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
      
      if (this.__element) 
      {
        for (var key in map) {
          this.__styleJobs[key] = true;
        }
        
        this.__scheduleSync();
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
      
      if (this.__element) 
      {
        this.__attribJobs[key] = true;
        
        this.__scheduleSync();
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
      
      if (this.__element) 
      {
        for (var key in map) {
          this.__attribJobs[key] = true;
        }
        
        this.__scheduleSync();
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
    }
  }
});
