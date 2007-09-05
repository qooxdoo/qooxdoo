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
    // These are created dynamically as required.
    // this.__attribValues = {};
    // this.__styleValues = {};
    // this.__eventValues = {};
    
    // Maps which contains the names / identifiers of the attributes,
    // styles or events which needs syncronization to the DOM.
    // These are created dynamically as required.
    // this.__attribJobs = {};
    // this.__styleJobs = {};
    // this.__eventJobs = {};
    
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
        console.debug("Flush: " + obj.getAttribute("id") + " [new]");
        
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
          if (qx.core.Variant.isSet("qx.domEditDistance", "on")) 
          {
            if (obj.__useEditDistance) {
              this.__syncChildrenEditDistance(obj)
            } else {
              this.__syncChildren(obj);
            }
          }
          else
          {
            this.__syncChildren(obj);
          }
          
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
      
      // Copy attributes
      var data = obj.__attribValues;
      if (data)
      {
        var Attribute = qx.bom.element.Attribute;
        
        for (var key in data) {
          Attribute.set(elem, key, data[key]);
        }
      }
      
      // Copy styles
      var data = obj.__styleValues;
      if (data)
      {
        var Style = qx.bom.element.Style;
        
        for (var key in data) {
          Style.set(elem, key, data[key]);
        }
      }
      
      // Attach events
      var data = obj.__eventValues;
      if (data)
      {
        var Event = qx.event.Manager;
        
        var entry;
        for (var key in data) 
        {
          entry = data[key];
          Event.addListener(entry.type, entry.listener, entry.self, entry.capture); 
        }
        
        // Cleanup old event map
        // Events are directly used through event manager
        // after intial creation. This differs from the 
        // handling of styles and attributes.
        delete obj.__eventValues;
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
        
        if (data)
        {
          var value;
          for (var key in jobs) 
          {
            value = data[key];
            
            if (value !== undefined) {
              Attribute.set(elem, key, value);
            } else {
              Attribute.reset(elem, key); 
            }
          }
        }
        
        obj.__attribJobs = null;
      }
      
      // Sync styles
      var jobs = obj.__styleJobs;
      if (jobs)
      {
        var data = obj.__styleValues;
        
        if (data)
        {
          var value;
          for (var key in data) 
          {
            value = data[key];
            
            if (value !== undefined) {
              Style.set(elem, key, value);
            } else {
              Style.reset(elem, key);
            }
          }
        }
        
        obj.__styleJobs = null;
      }
      
      // Events are directly kept in sync
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
        // TODO: documentFragment helpful here?
        if (children[i].__included) {
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
      
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        var domOperations = 0;
      }
      
      // TODO: remove children first
      
      // Start from beginning and bring DOM in sync 
      // with the data structure
      for (var i=0; i<dataLength; i++) 
      {
        dataChild = dataChildren[i];
        
        // Only process visible childs
        if (dataChild.__included) 
        {
          dataEl = dataChild.__element;
          domEl = domChildren[dataPos];
          
          // Only do something when out of sync
          if (dataEl != domEl) 
          {
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              domOperations++
            }
            
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
      while (domChildren[dataPos]) 
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          domOperations++
        }
        
        domParent.removeChild(domParent.lastChild); 
      }
      
      // User feedback
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__debug) {
          console.debug("  - Modified DOM with " + domOperations + " operations");
        }
      }
    },
    

    /**
     * Apply the DOM structure of the given parent. Used edit distance 
     * algorithm which means quadratic, more intensive computing but may 
     * reduce the number of DOM transactions needed.
     *
     * @type static
     * @param obj {qx.html.Element} the element to syncronize
     * @return {void}
     */
    __syncChildrenEditDistance : function(obj)
    { 
      if (qx.core.Variant.isSet("qx.domEditDistance", "on"))
      {
        // **********************************************************************
        //   Compute needed operations
        // **********************************************************************
        
        var domElement = obj.__element;
        var source = domElement.childNodes;
        var target = [];
        for (var i=0, ch=obj.__children, cl=ch.length; i<cl; i++) 
        {
          if (ch[i].__included) {
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
            console.debug("  - Modified DOM with " + domOperations + " operations (editdistance)");
          }
        }
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
      var modified = this.__modified;
      
      if (qx.lang.Object.isEmpty(modified)) 
      {
        console.warn("Flush with no modificiations!");
        return; 
      }




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
        
        if (entry.__hasIncludedRoot())
        {
          // Add self to modified
          if (entry.__element && qx.dom.Hierarchy.isRendered(entry.__element)) {
            domRendered[hc] = entry;
          } else {
            domInvisible[hc] = entry;
          }

          // Add children on all newly created elements or 
          // elements with new children
          if (!entry.__element || entry.__new || entry.__modifiedChildren) {
            entry.__addDirtyChildren(domRendered, domInvisible);
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
    
    
    /** {Boolean} Whether the element should be included in the render result */
    __included : true,
    
    
    /** {Boolean} Whether the elements children should be syncronized using the edit distance algorithm. */
    __useEditDistance : false,
    
    
    /** {Boolean} If the element is dirty (changes have applied to it or to one of its children) */
    __isDirty : false,
    
    
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
     * Marks the element as dirty
     *
     * @type static
     * @return {void}
     */
    __makeDirty : function()
    {
      pa = this;
      while (pa && !pa.__isDirty)
      {
        pa.__isDirty = true;
        pa = pa.__parent;
      }
    },


    /**
     * Finds all children (recursivly) of this element which are included
     * and marked as dirty.
     *
     * @type static
     * @param res {Array?} Optional array of already found children.
     *   Normally only used by the recursion
     * @return {Array} list of all found children
     */
    __addDirtyChildren : function(domRendered, domInvisible)
    {
      var children = this.__children;      
      var child, hc;
      var Map = qx.lang.Object;
      
      if (children)
      {
        for (var i=0, l=children.length; i<l; i++) 
        {
          child = children[i];
          
          // All elements which are not included are ignored (including their children)
          if (child.__included)
          {
            hc = child.toHashCode();
            
            // Differ between created and new elements
            if (child.__element)
            {
              // All elements which are not dirty are ignored (including their children)
              if (!child.__isDirty) 
              {
                // console.info("OPTIMIZE: " + child.getAttribute("id"));
                continue;
              }
              else if (child.__modifiedChildren || !Map.isEmpty(child.__styleJobs) || !Map.isEmpty(this.__attribJobs) || !Map.isEmpty(child.__eventJobs))
              {
                if (qx.dom.Hierarchy.isRendered(child.__element)) {
                  domRendered[hc] = child;
                } else {
                  domInvisible[hc] = child;
                }                  
              }
            }
            else
            {
              child.__createDomElement();
              child.__new = true;
              
              domInvisible[hc] = child;              
            }
            
            // Remove dirty flag
            delete child.__isDirty;
            
            // Add children, too
            child.__addDirtyChildren(domRendered, domInvisible);
          }
        }
      }
    },
    
    
    /**
     * Walk up the internal children hierarchy and 
     * look if one of the children is marked as root
     */
    __hasIncludedRoot : function()
    {
      var pa = this;
      
      // Any chance to cache this information in the parents?
      while(pa)
      {
        if (pa.__root) {
          return true; 
        }
        
        if (!pa.__included) {
          return false; 
        }
        
        pa = pa.__parent;
      }
      
      return false;
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
    },

    
    /**
     * Generates a unique key for a listener configuration
     *
     * @type member
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {String} A unique ID for this configuration
     */
    __generateListenerId : function(type, listener, self, capture)
    {
      var Object = qx.core.Object;
      
      var id = "evt" + Object.toHashCode(type) + "-" + Object.toHashCode(listener);
      
      if (self) {
        id += "-" + Object.toHashCode(self);
      }
      
      if (capture) {
        id += "-capture"; 
      }
      
      return id;
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
      
      if (child.__root) {
        throw new Error("Root elements could not be inserted into other ones."); 
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
        // Mark as dirty
        this.__makeDirty();

        // Store job hint
        this.__modifiedChildren = true;
        
        if (this.__included && child.__included) {
          this.__scheduleSync();
        }
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
        // Mark as dirty
        this.__makeDirty();      
        
        // Store job hint
        this.__modifiedChildren = true;
        
        if (this.__included && child.__included) {
          this.__scheduleSync();
        }
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
        // Mark as dirty
        this.__makeDirty();      
        
        // Store job hint
        this.__modifiedChildren = true;
        
        if (this.__included && child.__included) {
          this.__scheduleSync();
        }
      }
    },


    /**
     * Internal helper to manage children include/exclude changes
     *
     * @type member
     * @return {void}
     */
    __includeExcludeHelper : function()
    {
      // If the parent element is created, schedule 
      // the modification for it
      var pa = this.__parent;
      if (pa && pa.__element && pa.__included) 
      {
        // Remember job
        pa.__modifiedChildren = true;
        
        // Add to scheduler
        pa.__scheduleSync();
        
        // Mark as dirty
        pa.__makeDirty();
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
      if (this.__included) {
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
      VISIBILITY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Marks the element as excluded which means it will be removed
     * from the DOM and ignored for updates until get included again.
     *
     * @type member
     * @return {void}
     */    
    exclude : function() 
    {
      if (!this.__included) {
        return; 
      }
      
      this.__included = false; 
      this.__includeExcludeHelper();
      
      return this;
    },
    
    
    /**
     * Marks the element as included which means it will be moved into
     * the DOM again and synced with the internal data representation.
     *
     * @type member
     * @return {void}
     */   
    include : function() 
    {
      if (this.__included) {
        return; 
      }
      
      delete this.__included;
      this.__includeExcludeHelper();
      
      return this;
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
      if (!this.__styleValues) {
        this.__styleValues = {};
      }
            
      this.__styleValues[key] = value;
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Mark as dirty
        this.__makeDirty();

        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }
        
        // Store job info
        this.__styleJobs[key] = true;
        
        // Normally we need to do a deep lookup here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__included) {
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
      if (!this.__styleValues) {
        this.__styleValues = {};
      }
            
      for (var key in map) {
        this.__styleValues[key] = map[key];
      }
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.        
      if (this.__element) 
      {
        // Mark as dirty
        this.__makeDirty();

        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }
        
        // Copy to jobs map
        for (var key in map) {
          this.__styleJobs[key] = true;
        }
        
        // Normally we need to do a deep lookup here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__included) {
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
      return this.__styleValues ? this.__styleValues[key] : null;
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
      if (!this.__attribValues) {
        this.__attribValues = {};
      }
      
      this.__attribValues[key] = value;
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Mark as dirty
        this.__makeDirty();
        
        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }
        
        // Store job info
        this.__attribJobs[key] = true;
        
        // Normally we need to do a deep lookup here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.        
        if (this.__included) {
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
      if (!this.__attribValues) {
        this.__attribValues = {};
      }
            
      for (var key in map) {
        this.__attribValues[key] = map[key];
      }
      
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this.__element) 
      {
        // Mark as dirty
        this.__makeDirty();
        
        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }

        // Copy to jobs map
        for (var key in map) {
          this.__attribJobs[key] = true;
        }
        
        // Normally we need to do a deep lookup here (go parents up)
        // but this is too slow. To just have a look at this element
        // itself is fast and also could save the function call at all.
        // The real control visible/inRoot will be done when the element
        // is scheduled and should be flushed.
        if (this.__included) {
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
      return this.__attribValues ? this.__attribValues[key] : null;
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
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    addListener : function(type, listener, self, capture)
    {
      if (this.__element) 
      {
        qx.event.Manager.addListener(this.__element, type, listener, self, capture); 
      }
      else
      {
        if (!this.__eventValues) {
          this.__eventValues = {};
        }
        
        var key = this.__generateListenerId(type, listener, self, capture);
        
        if (this.__eventValues[key]) {
          throw new Error("A listener of this configuration does already exist!"); 
        }        
              
        this.__eventValues[key] = {
          type : type,
          listener : listener,
          self : self,
          capture : capture
        };        
      }

      return this;
    },
    
    
    /**
     * Removes an event listener from the element.
     *
     * @type member
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (this.__element) 
      {
        qx.event.Manager.removeListener(this.__element, type, listener, self, capture); 
      }
      else
      {
        var key = this.__generateListenerId(type, listener, self, capture);
        
        if (!this.__eventValues || !this.__eventValues[key]) {
          throw new Error("A listener of this configuration does not exist!"); 
        }
        
        delete this.__eventValues[key];
      }
      
      return this;
    },
    
    
    /**
     * Whether an element has the specified event listener
     *
     * @type member
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {Boolean} <code>true</code> when such an event listener already exists
     */
    hasListener : function(type, listener, self, capture)
    {
      if (this.__element)
      {
        return qx.event.Manager.hasListener(this.__element, type, listener, self, capture);
      }
      else
      {
        var key = this.__generateListenerId(type, listener, self, capture);
        return (this.__eventValues && this.__eventValues[key]);
      }
    }  
  },
  




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */  
  
  destruct : function()
  {
    this._disposeObjectDeep("__children", 1);
    this._disposeFields("__attribValues", "__styleValues", "__eventValues");
    this._disposeFields("__attribJobs", "__styleJobs", "__eventJobs");
  },
  
  
  
  


  /*
  *****************************************************************************
     VARIANTS
  *****************************************************************************
  */  
  
  variants : 
  {
    "qx.domEditDistance" : 
    {
      allowedValues : [ "on", "off" ],
      defaultValue : "off" 
    } 
  }
});
