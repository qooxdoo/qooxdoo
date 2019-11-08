/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * John Spackman (https://github.com/johnspackman)

************************************************************************ */

/**
 * High-performance, high-level DOM element creation and management.
 *
 * Mirrors the DOM structure of Node (see also Element and Text) so to provide 
 * DOM insertion and modification with advanced logic to reduce the real transactions.
 *
 * Each child itself also has got some powerful methods to control its
 * position:
 * {@link #getParent}, {@link #free},
 * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
 * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 * @require(qx.module.Animation)
 */
qx.Class.define("qx.html.Node",
{
  extend : qx.core.Object,
  implement : [ qx.core.IDisposable ],
  
  
  /**
   * Creates a new Element
   *
   * @param nodeName {String} name of the node; will be a tag name for Elements, otherwise it's a reserved
   * name eg "#text"
   */
  construct : function(nodeName)
  {
    this.base(arguments);
    this._nodeName = nodeName;
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * Finds the Widget for a given DOM element
     *
     * @param domElement {DOM} the DOM element
     * @return {qx.ui.core.Widget} the Widget that created the DOM element
     */
    fromDomNode: function(domNode) {
    	if (qx.core.Environment.get("qx.debug")) {
    		qx.core.Assert.assertTrue((!domNode.$$element && !domNode.$$elementObject) ||
    				domNode.$$element === domNode.$$elementObject.toHashCode());
    	}
      return domNode.$$elementObject;
    }

  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {
    /**
     * Controls whether the element is visible which means that a previously applied
     * CSS style of display=none gets removed and the element will inserted into the DOM, 
     * when this had not already happened before.
     * 
     * If the element already exists in the DOM then it will kept in DOM, but configured 
     * hidden using a CSS style of display=none.
     * 
     * Please note: This does not control the visibility or parent inclusion recursively.
     * 
     * @type {Boolean} Whether the element should be visible in the render result
     */
    visible: {
      init: true,
      nullable: true,
      check: "Boolean",
      apply: "_applyVisible"
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
      PROTECTED HELPERS/DATA
    ---------------------------------------------------------------------------
    */

    /** @type {String} the name of the node */
    _nodeName : null,

    /** @type {Node} DOM node of this object */
    _domNode : null,

    /** @type {qx.html.Element} parent element */
    _parent : null,
    
    /** @type {qx.core.Object} the Qooxdoo object this node is attached to */
    _qxObject : null,

    /** @type {Boolean} Whether the element should be included in the render result */
    _included : true,

    _children : null,
    _modifiedChildren : null,

    _propertyJobs : null,
    _propertyValues : null,


    /**
     * Connects a widget to this element, and to the DOM element in this Element.  They
     * remain associated until disposed or disconnectObject is called
     *
     * @param qxObject {qx.core.Object} the object to associate
     */
    connectObject: function(qxObject) {
    	if (qx.core.Environment.get("qx.debug")) {
      	qx.core.Assert.assertTrue(!this._qxObject || this._qxObject === qxObject);
    	}

    	this._qxObject = qxObject;
    	if (this._domNode) {
      	if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue((!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject) ||
              (this._domNode.$$qxObject === qxObject && this._domNode.$$qxObjectHash === qxObject.toHashCode()));
      	}

        this._domNode.$$qxObjectHash = qxObject.toHashCode();
        this._domNode.$$qxObject = qxObject;
    	}

      if (qx.core.Environment.get("module.objectid")) {
        this.updateObjectId();
      }
    },


    /**
     * Disconnects a widget from this element and the DOM element.  The DOM element remains
     * untouched, except that it can no longer be used to find the Widget.
     *
     * @param qxObject {qx.core.Object} the Widget
     */
    disconnectObject: function(qxObject) {
    	if (qx.core.Environment.get("qx.debug")) {
      	qx.core.Assert.assertTrue(this._qxObject === qxObject);
    	}

    	delete this._qxObject;
    	if (this._domNode) {
      	if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue((!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject) ||
              (this._domNode.$$qxObject === qxObject && this._domNode.$$qxObjectHash === qxObject.toHashCode()));
      	}

        this._domNode.$$qxObjectHash = "";
        delete this._domNode.$$qxObject;
    	}
    	
      if (qx.core.Environment.get("module.objectid")) {
        this.updateObjectId();
      }
    },

    /**
     * Internal helper to generate the DOM element
     *
     * @return {Element} DOM element
     */
    _createDomElement : function() {
      throw new Error("No implementation for " + this.classname + "._createDomElement");
    },
    
    /**
     * Serializes the virtual DOM element to a writer; the `writer` function accepts
     *  an varargs, which can be joined with an empty string or streamed.
     *  
     * If writer is null, the element will be serialised to a string which is returned;
     * note that if writer is not null, the return value will be null
     * 
     * @param writer {Function?} the writer
     * @return {String?} the serialised version if writer is null
     */
    serialize(writer) {
      var temporaryQxObjectId = !this.getQxObjectId();
      if (temporaryQxObjectId) {
        this.setQxObjectId(this.classname);
      }
      var id = qx.core.Id.getAbsoluteIdOf(this, true);
      var isIdRoot = !id;
      if (isIdRoot) {
        qx.core.Id.getInstance().register(this);
      }
      
      var result = undefined;
      if (writer) {
        this._serializeImpl(writer);
      } else {
        var buffer = [];
        this._serializeImpl(function() {
          var args = qx.lang.Array.fromArguments(arguments);
          qx.lang.Array.append(buffer, args);
        });
        result = buffer.join(""); 
      }
      
      if (isIdRoot) {
        qx.core.Id.getInstance().unregister(this);
      }
      if (temporaryQxObjectId) {
        this.setQxObjectId(null);
      }
      
      return result;
    },

    /**
     * Serializes the virtual DOM element to a writer; the `writer` function accepts
     *  an varargs, which can be joined with an empty string or streamed.
     * 
     * @param writer {Function} the writer
     */
    _serializeImpl(writer) {
      throw new Error("No implementation for " + this.classname + ".serialize");
    },

    /**
     * Serializes a special property with the given value.
     *
     * This property serialization routine can be easily overwritten and
     * extended by sub classes to add new low level features which
     * are not easily possible using styles and attributes.
     *
     * @param writer {Function} the writer
     * @param name {String} Unique property identifier
     * @param value {var} Any valid value (depends on the property)
     * @return {qx.html.Element} this object (for chaining support)
     * @abstract
     */
    _serializeProperty: function(writer, name, value) {
      // Nothing
    },

    /**
     * Uses an existing element instead of creating one. This may be interesting
     * when the DOM element is directly needed to add content etc.
     *
     * @param domNode {Node} DOM Node to reuse
     */
    useNode: function(domNode) {
      var temporaryQxObjectId = !this.getQxObjectId();
      if (temporaryQxObjectId) {
        this.setQxObjectId(this.classname);
      }
      var id = qx.core.Id.getAbsoluteIdOf(this, true);
      var isIdRoot = !id;
      if (isIdRoot) {
        qx.core.Id.getInstance().register(this);
      }
      
      /*
       * When merging children, we want to keep the original DOM nodes in
       * domNode no matter what - however, where the DOM nodes have a qxObjectId
       * we must reuse the original instances.
       * 
       * The crucial thing is that the qxObjectId hierarchy and the DOM hierarchy
       * are not the same (although they are often similar, the DOM will often have
       * extra Nodes).
       * 
       * However, because the objects in the qxObjectId space will typically already 
       * exist (eg accessed via the constructor) we do not want to discard the original
       * instance of qx.html.Element because there are probably references to them in 
       * code.
       * 
       * In the code below, we map the DOM heirarchy into a temporary Javascript
       * hierarchy, where we can either use existing qx.html.Element instances (found
       * by looking up the qxObjectId) or fabricate new ones.
       * 
       * Once the temporary hierarchy is ready, we go back and synchronise each
       * qx.html.Element with the DOM node and our new array of children.
       * 
       * The only rule to this is that if you are going to call this `useNode`, then
       * you must not keep references to objects *unless* you also access them via
       * the qxObjectId mechanism.
       */
      
      var self = this;
      function convert(domNode) {
        var children = qx.lang.Array.fromCollection(domNode.childNodes);
        children = children
          .map(function(domChild) {
            var child = null;
            if (domChild.nodeType == window.Node.ELEMENT_NODE) {
              var id = domChild.getAttribute("data-qx-object-id");
              if (id) {
                var owningQxObjectId = null;
                var qxObjectId = null;
                var owningQxObject = null;
                var pos = id.lastIndexOf('/');
                if (pos > -1) {
                  owningQxObjectId = id.substring(0, pos);
                  qxObjectId = id.substring(pos + 1);
                  owningQxObject = qx.core.Id.getQxObject(owningQxObjectId);
                  child = owningQxObject.getQxObject(qxObjectId);
                } else {
                  qxObjectId = id;
                  owningQxObject = self;
                  child = self.getQxObject(id);
                }
              }
            }
            if (!child)
              child = qx.html.Factory.getInstance().createElement(domChild.nodeName, domChild.attributes);
            return {
              htmlNode: child,
              domNode: domChild,
              children: convert(domChild)
            };
          });
        return children;
      }
      
      function install(map) {
        var htmlChildren = map.children.map(function(mapEntry) {
          install(mapEntry);
          return mapEntry.htmlNode;
        });
        map.htmlNode._useNodeImpl(map.domNode, htmlChildren);
      }
      
      var rootMap = {
          htmlNode: this,
          domNode: domNode,
          children: convert(domNode)
      };
      
      install(rootMap);
      
      this.flush();
      this._insertChildren();
      
      if (isIdRoot) {
        qx.core.Id.getInstance().unregister(this);
      }
      if (temporaryQxObjectId) {
        this.setQxObjectId(null);
      }
    },
    
    /**
     * Called internally to complete the connection to an existing DOM node
     * 
     * @param domNode {DOM Node} the node we're syncing to 
     * @param newChildren {qx.html.Node[]} the new children
     */
    _useNodeImpl: function(domNode, newChildren) {
      if (this._domNode) {
        throw new Error("Could not overwrite existing element!");
      }

      // Use incoming element
      this._connectDomNode(domNode);
      
      // Copy currently existing data over to element
      this._copyData(true);
      
      // Add children
      var lookup = {};
      var oldChildren = this._children ? qx.lang.Array.clone(this._children) : null;
      newChildren.forEach(function(child) {
        lookup[child.toHashCode()] = child;
      });
      this._children = newChildren;
      
      // Make sure that unused children are disconnected
      if (oldChildren) {
        oldChildren.forEach(function(child) {
          if (!lookup[child.toHashCode()]) {
            if (child._domNode && child._domNode.parentElement)
              child._domNode.parentElement.removeChild(child._domNode);
            child._parent = null;
          }
        });
      }
      
      var self = this;
      this._children.forEach(function(child) {
        child._parent = self;
        if (child._domNode && child._domNode.parentElement !== self._domNode) {
          child._domNode.parentElement.removeChild(child._domNode);
          if (this._domNode) {
            this._domNode.appendChild(child._domNode);
          }
        }
      });
      
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }
    },

    /**
     * Connects a DOM element to this Node; if this Node is already connected to a Widget
     * then the Widget is also connected.
     *
     * @param domNode {DOM} the DOM Node to associate
     */
    _connectDomNode: function(domNode) {
    	if (qx.core.Environment.get("qx.debug")) {
    		qx.core.Assert.assertTrue(!this._domNode || this._domNode === domNode);
        qx.core.Assert.assertTrue((domNode.$$elementObject === this && domNode.$$element === this.toHashCode()) ||
            (!domNode.$$elementObject && !domNode.$$element));
    	};

    	this._domNode = domNode;
    	domNode.$$elementObject = this;
    	domNode.$$element = this.toHashCode();
    	if (this._qxObject) {
      	domNode.$$qxObjectHash = this._qxObject.toHashCode();
      	domNode.$$qxObject = this._qxObject;
    	}
    },
    
    
    /**
     * Detects whether the DOM node has been created and is in the document
     * 
     * @return {Boolean}
     */
    isInDocument() {
      if (document.body) {
        for (var domNode = this._domNode; domNode != null; domNode = domNode.parentElement) {
          if (domNode === document.body) {
            return true;
          }
        }
      }
      return false;
    },

    
    /**
     * Updates the Object ID on the element to match the QxObjectId
     */
    updateObjectId: function() {
      // Copy Object Id
      if (qx.core.Environment.get("module.objectid")) {
        var id = null;
        
        if (!this._qxObject && this.getQxObjectId()) {
          id = qx.core.Id.getAbsoluteIdOf(this, true) || null;
        } else if (this._qxObject && this._qxObject.getQxObjectId()) {
          id = qx.core.Id.getAbsoluteIdOf(this._qxObject, true) || null;
        }
        
        this.setAttribute("data-qx-object-id", id, true);
      }
    },
    
    _cascadeQxObjectIdChanges: function() {
      if (qx.core.Environment.get("module.objectid")) {
        this.updateObjectId();
      }
      this.base(arguments);
    },


    /*
    ---------------------------------------------------------------------------
      FLUSH OBJECT
    ---------------------------------------------------------------------------
    */

    /**
     * Add the element to the global modification list.
     *
     */
    _scheduleChildrenUpdate : function()
    {
      if (this._modifiedChildren) {
        return;
      }

      this._modifiedChildren = true;

      qx.html.Element._modified[this.toHashCode()] = this;
      qx.html.Element._scheduleFlush("element");
    },


    /**
     * Syncs data of an HtmlElement object to the DOM.
     * 
     * This is just a public wrapper around `flush`, because the scope has changed
     * 
     * @deprecated {6.0} Please use `.flush()` instead
     */
    _flush : function() {
      this._flush();
    },


    /**
     * Syncs data of an HtmlElement object to the DOM.
     *
     */
    flush : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this.DEBUG) {
          this.debug("Flush: " + this.getAttribute("id"));
        }
      }

      var length;
      var children = this._children;
      if (children)
      {
        length = children.length;
        var child;
        for (var i=0; i<length; i++)
        {
          child = children[i];

          if (child.isVisible() && child._included && !child._domNode) {
            child.flush();
          }
        }
      }

      if (!this._domNode)
      {
        this._connectDomNode(this._createDomElement());

        this._copyData(false);

        if (children && length > 0) {
          this._insertChildren();
        }
      }
      else
      {
        this._syncData();

        if (this._modifiedChildren) {
          this._syncChildren();
        }
      }

      delete this._modifiedChildren;
    },

    /**
     * Returns this element's root flag
     * 
     * @return {Boolean}
     */
    isRoot : function() {
      throw new Error("No implementation for " + this.classname + ".isRoot");
    },

    /**
     * Walk up the internal children hierarchy and
     * look if one of the children is marked as root.
     *
     * This method is quite performance hungry as it
     * really walks up recursively.
     * @return {Boolean} <code>true</code> if the element will be seeable
     */
    _willBeSeeable : function()
    {
      if (!qx.html.Element._hasRoots) {
        return false;
      }
      var pa = this;

      // Any chance to cache this information in the parents?
      while(pa)
      {
        if (pa.isRoot()) {
          return true;
        }

        if (!pa._included || !pa.isVisible()) {
          return false;
        }

        pa = pa._parent;
      }

      return false;
    },





    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR CHILDREN FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Append all child nodes to the DOM
     * element. This function is used when the element is initially
     * created. After this initial apply {@link #_syncChildren} is used
     * instead.
     *
     */
    _insertChildren : function()
    {
      var children = this._children;
      if (!children) {
        return;
      }
      var length = children.length;
      var child;

      if (length > 2)
      {
        var domElement = document.createDocumentFragment();
        for (var i=0; i<length; i++)
        {
          child = children[i];
          if (child._domNode && child._included) {
            domElement.appendChild(child._domNode);
          }
        }

        this._domNode.appendChild(domElement);
      }
      else
      {
        var domElement = this._domNode;
        for (var i=0; i<length; i++)
        {
          child = children[i];
          if (child._domNode && child._included) {
            domElement.appendChild(child._domNode);
          }
        }
      }
    },


    /**
     * Synchronize internal children hierarchy to the DOM. This is used
     * for further runtime updates after the element has been created
     * initially.
     *
     */
    _syncChildren : function()
    {
      var dataChildren = this._children||[];
      var dataLength = dataChildren.length;
      var dataChild;
      var dataEl;

      var domParent = this._domNode;
      var domChildren = domParent.childNodes;
      var domPos = 0;
      var domEl;

      if (qx.core.Environment.get("qx.debug")) {
        var domOperations = 0;
      }

      // Remove children from DOM which are excluded or remove first
      for (var i=domChildren.length-1; i>=0; i--)
      {
        domEl = domChildren[i];
        dataEl = qx.html.Node.fromDomNode(domEl);

        if (!dataEl || !dataEl._included || dataEl._parent !== this)
        {
          domParent.removeChild(domEl);

          if (qx.core.Environment.get("qx.debug")) {
            domOperations++;
          }
        }
      }

      // Start from beginning and bring DOM in sync
      // with the data structure
      for (var i=0; i<dataLength; i++)
      {
        dataChild = dataChildren[i];

        // Only process visible childs
        if (dataChild._included)
        {
          dataEl = dataChild._domNode;
          domEl = domChildren[domPos];

          if (!dataEl) {
            continue;
          }

          // Only do something when out of sync
          // If the data element is not there it may mean that it is still
          // marked as visible=false
          if (dataEl != domEl)
          {
            if (domEl) {
              domParent.insertBefore(dataEl, domEl);
            } else {
              domParent.appendChild(dataEl);
            }

            if (qx.core.Environment.get("qx.debug")) {
              domOperations++;
            }
          }

          // Increase counter
          domPos++;
        }
      }

      // User feedback
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.html.Element.DEBUG) {
          this.debug("Synced DOM with " + domOperations + " operations");
        }
      }
    },


    
    /**
     * Copies data between the internal representation and the DOM. This
     * simply copies all the data and only works well directly after
     * element creation. After this the data must be synced using {@link #_syncData}
     *
     * @param fromMarkup {Boolean} Whether the copy should respect styles
     *   given from markup
     */
    _copyData : function(fromMarkup)
    {
      var elem = this._domNode;
      
      // Copy properties
      var data = this._propertyValues;
      if (data)
      {
        for (var key in data) {
          this._applyProperty(key, data[key]);
        }
      }

      // Attach events
      var data = this.__eventValues;
      if (data)
      {
        // Import listeners
        qx.event.Registration.getManager(elem).importListeners(elem, data);

        // Cleanup event map
        // Events are directly attached through event manager
        // after initial creation. This differs from the
        // handling of styles and attributes where queuing happens
        // through the complete runtime of the application.
        delete this.__eventValues;
      }
    },


    /**
     * Synchronizes data between the internal representation and the DOM. This
     * is the counterpart of {@link #_copyData} and is used for further updates
     * after the element has been created.
     *
     */
    _syncData : function()
    {
      var elem = this._domNode;

      // Sync misc
      var jobs = this._propertyJobs;
      if (jobs)
      {
        var data = this._propertyValues;
        if (data)
        {
          var value;
          for (var key in jobs) {
            this._applyProperty(key, data[key]);
          }
        }

        this._propertyJobs = null;
      }

      // Note: Events are directly kept in sync
    },








    /*
    ---------------------------------------------------------------------------
      PRIVATE HELPERS/DATA
    ---------------------------------------------------------------------------
    */

    /**
     * Internal helper for all children addition needs
     *
     * @param child {var} the element to add
     * @throws {Error} if the given element is already a child
     *     of this element
     */
    __addChildHelper : function(child)
    {
      if (child._parent === this) {
        throw new Error("Child is already in: " + child);
      }

      if (child.__root) {
        throw new Error("Root elements could not be inserted into other ones.");
      }

      // Remove from previous parent
      if (child._parent) {
        child._parent.remove(child);
      }

      // Convert to child of this object
      child._parent = this;

      // Prepare array
      if (!this._children) {
        this._children = [];
      }

      // Schedule children update
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }
    },


    /**
     * Internal helper for all children removal needs
     *
     * @param child {qx.html.Element} the removed element
     * @throws {Error} if the given element is not a child
     *     of this element
     */
    __removeChildHelper : function(child)
    {
      if (child._parent !== this) {
        throw new Error("Has no child: " + child);
      }

      // Schedule children update
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }

      // Remove reference to old parent
      delete child._parent;
    },


    /**
     * Internal helper for all children move needs
     *
     * @param child {qx.html.Element} the moved element
     * @throws {Error} if the given element is not a child
     *     of this element
     */
    __moveChildHelper : function(child)
    {
      if (child._parent !== this) {
        throw new Error("Has no child: " + child);
      }

      // Schedule children update
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
    ---------------------------------------------------------------------------
    */

    /**
     * Returns a copy of the internal children structure.
     *
     * Please do not modify the array in place. If you need
     * to work with the data in such a way make yourself
     * a copy of the data first.
     *
     * @return {Array} the children list
     */
    getChildren : function() {
      return this._children || null;
    },


    /**
     * Get a child element at the given index
     *
     * @param index {Integer} child index
     * @return {qx.html.Element|null} The child element or <code>null</code> if
     *     no child is found at that index.
     */
    getChild : function(index)
    {
      var children = this._children;
      return children && children[index] || null;
    },


    /**
     * Returns whether the element has any child nodes
     *
     * @return {Boolean} Whether the element has any child nodes
     */
    hasChildren : function()
    {
      var children = this._children;
      return children && children[0] !== undefined;
    },


    /**
     * Find the position of the given child
     *
     * @param child {qx.html.Element} the child
     * @return {Integer} returns the position. If the element
     *     is not a child <code>-1</code> will be returned.
     */
    indexOf : function(child)
    {
      var children = this._children;
      return children ? children.indexOf(child) : -1;
    },


    /**
     * Whether the given element is a child of this element.
     *
     * @param child {qx.html.Element} the child
     * @return {Boolean} Returns <code>true</code> when the given
     *    element is a child of this element.
     */
    hasChild : function(child)
    {
      var children = this._children;
      return children && children.indexOf(child) !== -1;
    },


    /**
     * Append all given children at the end of this element.
     *
     * @param varargs {qx.html.Element} elements to insert
     * @return {qx.html.Element} this object (for chaining support)
     */
    add : function(varargs)
    {
      if (arguments[1])
      {
        for (var i=0, l=arguments.length; i<l; i++) {
          this.__addChildHelper(arguments[i]);
        }

        this._children.push.apply(this._children, arguments);
      }
      else
      {
        this.__addChildHelper(varargs);
        this._children.push(varargs);
      }

      // Chaining support
      return this;
    },


    /**
     * Inserts a new element into this element at the given position.
     *
     * @param child {qx.html.Element} the element to insert
     * @param index {Integer} the index (starts at 0 for the
     *     first child) to insert (the index of the following
     *     children will be increased by one)
     * @return {qx.html.Element} this object (for chaining support)
     */
    addAt : function(child, index)
    {
      this.__addChildHelper(child);
      qx.lang.Array.insertAt(this._children, child, index);

      // Chaining support
      return this;
    },


    /**
     * Removes all given children
     *
     * @param childs {qx.html.Element} children to remove
     * @return {qx.html.Element} this object (for chaining support)
     */
    remove : function(childs)
    {
      var children = this._children;
      if (!children) {
        return this;
      }

      if (arguments[1])
      {
        var child;
        for (var i=0, l=arguments.length; i<l; i++)
        {
          child = arguments[i];

          this.__removeChildHelper(child);
          qx.lang.Array.remove(children, child);
        }
      }
      else
      {
        this.__removeChildHelper(childs);
        qx.lang.Array.remove(children, childs);
      }

      // Chaining support
      return this;
    },


    /**
     * Removes the child at the given index
     *
     * @param index {Integer} the position of the
     *     child (starts at 0 for the first child)
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeAt : function(index)
    {
      var children = this._children;
      if (!children) {
        throw new Error("Has no children!");
      }

      var child = children[index];
      if (!child) {
        throw new Error("Has no child at this position!");
      }

      this.__removeChildHelper(child);
      qx.lang.Array.removeAt(this._children, index);

      // Chaining support
      return this;
    },


    /**
     * Remove all children from this element.
     *
     * @return {qx.html.Element} A reference to this.
     */
    removeAll : function()
    {
      var children = this._children;
      if (children)
      {
        for (var i=0, l=children.length; i<l; i++) {
          this.__removeChildHelper(children[i]);
        }

        // Clear array
        children.length = 0;
      }

      // Chaining support
      return this;
    },






    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGEMENT (EXECUTED ON THE CHILD)
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the parent of this element.
     *
     * @return {qx.html.Element|null} The parent of this element
     */
    getParent : function() {
      return this._parent || null;
    },


    /**
     * Insert self into the given parent. Normally appends self to the end,
     * but optionally a position can be defined. With index <code>0</code> it
     * will be inserted at the begin.
     *
     * @param parent {qx.html.Element} The new parent of this element
     * @param index {Integer?null} Optional position
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertInto : function(parent, index)
    {
      parent.__addChildHelper(this);

      if (index == null) {
        parent._children.push(this);
      } else {
        qx.lang.Array.insertAt(this._children, this, index);
      }

      return this;
    },


    /**
     * Insert self before the given (related) element
     *
     * @param rel {qx.html.Element} the related element
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertBefore : function(rel)
    {
      var parent = rel._parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertBefore(parent._children, this, rel);

      return this;
    },


    /**
     * Insert self after the given (related) element
     *
     * @param rel {qx.html.Element} the related element
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertAfter : function(rel)
    {
      var parent = rel._parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertAfter(parent._children, this, rel);

      return this;
    },


    /**
     * Move self to the given index in the current parent.
     *
     * @param index {Integer} the index (starts at 0 for the first child)
     * @return {qx.html.Element} this object (for chaining support)
     * @throws {Error} when the given element is not child
     *      of this element.
     */
    moveTo : function(index)
    {
      var parent = this._parent;

      parent.__moveChildHelper(this);

      var oldIndex = parent._children.indexOf(this);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      } else if (oldIndex < index) {
        index--;
      }

      qx.lang.Array.removeAt(parent._children, oldIndex);
      qx.lang.Array.insertAt(parent._children, this, index);

      return this;
    },


    /**
     * Move self before the given (related) child.
     *
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveBefore : function(rel)
    {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel));
    },


    /**
     * Move self after the given (related) child.
     *
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveAfter : function(rel)
    {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel) + 1);
    },


    /**
     * Remove self from the current parent.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    free : function()
    {
      var parent = this._parent;
      if (!parent) {
        throw new Error("Has no parent to remove from.");
      }

      if (!parent._children) {
        return this;
      }

      parent.__removeChildHelper(this);
      qx.lang.Array.remove(parent._children, this);

      return this;
    },






    /*
    ---------------------------------------------------------------------------
      DOM ELEMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the DOM element (if created). Please use this with caution.
     * It is better to make all changes to the object itself using the public
     * API rather than to the underlying DOM element.
     * 
     * @param create {Boolean?} if true, the DOM node will be created if it does
     * not exist
     * @return {Element|null} The DOM element node, if available.
     */
    getDomElement : function(create) {
      if (create && !this._domNode) {
        this.flush();
      }
      return this._domNode || null;
    },


    /**
     * Returns the nodeName of the DOM element.
     *
     * @return {String} The node name
     */
    getNodeName : function() {
      return this._nodeName;
    },

    /**
     * Sets the nodeName of the DOM element.
     *
     * @param name {String} The node name
     */
    setNodeName : function(name) {
      this._nodeName = name;
    },





    /*
    ---------------------------------------------------------------------------
      EXCLUDE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Marks the element as included which means it will be moved into
     * the DOM again and synced with the internal data representation.
     *
     * @return {Node} this object (for chaining support)
     */
    include : function()
    {
      if (this._included) {
        return this;
      }

      delete this._included;

      if (this._parent) {
        this._parent._scheduleChildrenUpdate();
      }

      return this;
    },


    /**
     * Marks the element as excluded which means it will be removed
     * from the DOM and ignored for updates until it gets included again.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    exclude : function()
    {
      if (!this._included) {
        return this;
      }

      this._included = false;

      if (this._parent) {
        this._parent._scheduleChildrenUpdate();
      }

      return this;
    },


    /**
     * Whether the element is part of the DOM
     *
     * @return {Boolean} Whether the element is part of the DOM.
     */
    isIncluded : function() {
      return this._included === true;
    },
    
    /**
     * Apply method for visible property
     */
    _applyVisible: function(value) {
      // Nothing - to be overridden
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Applies a special property with the given value.
     *
     * This property apply routine can be easily overwritten and
     * extended by sub classes to add new low level features which
     * are not easily possible using styles and attributes.
     *
     * @param name {String} Unique property identifier
     * @param value {var} Any valid value (depends on the property)
     * @return {qx.html.Element} this object (for chaining support)
     * @abstract
     */
    _applyProperty : function(name, value) {
      // empty implementation
    },


    /**
     * Set up the given property.
     *
     * @param key {String} the name of the property
     * @param value {var} the value
     * @param direct {Boolean?false} Whether the value should be applied
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    _setProperty : function(key, value, direct)
    {
      if (!this._propertyValues) {
        this._propertyValues = {};
      }

      if (this._propertyValues[key] == value) {
        return this;
      }

      if (value == null) {
        delete this._propertyValues[key];
      } else {
        this._propertyValues[key] = value;
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._domNode)
      {
        // Omit queuing in direct mode
        if (direct)
        {
          this._applyProperty(key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this._propertyJobs) {
          this._propertyJobs = {};
        }

        // Store job info
        this._propertyJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      }

      return this;
    },


    /**
     * Removes the given misc
     *
     * @param key {String} the name of the misc
     * @param direct {Boolean?false} Whether the value should be removed
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    _removeProperty : function(key, direct) {
      return this._setProperty(key, null, direct);
    },


    /**
     * Get the value of the given misc.
     *
     * @param key {String} name of the misc
     * @return {var} the value of the misc
     */
    _getProperty : function(key)
    {
      var db = this._propertyValues;
      if (!db) {
        return null;
      }

      var value = db[key];
      return value == null ? null : value;
    },





    /*
    ---------------------------------------------------------------------------
      EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Adds an event listener to the element.
     *
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {var} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(type, listener, self, capture)
    {
      if (this.$$disposed) {
        return null;
      }

      if (qx.core.Environment.get("qx.debug")) {
        var msg = "Failed to add event listener for type '" + type + "'" +
          " to the target '" + this + "': ";

        this.assertString(type, msg + "Invalid event type.");
        this.assertFunction(listener, msg + "Invalid callback function");

        if (self !== undefined) {
          this.assertObject(self, "Invalid context for callback.");
        }

        if (capture !== undefined) {
          this.assertBoolean(capture, "Invalid capture flag.");
        }
      }
      
      if (qx.Class.supportsEvent(this, type)) {
        return this.base(arguments, type, listener, self, capture);
      }

      if (this._domNode) {
        return qx.event.Registration.addListener(this._domNode, type, listener, self, capture);
      }

      if (!this.__eventValues) {
        this.__eventValues = {};
      }

      if (capture == null) {
        capture = false;
      }

      var unique = qx.event.Manager.getNextUniqueId();
      var id = type + (capture ? "|capture|" : "|bubble|") + unique;

      this.__eventValues[id] =
      {
        type : type,
        listener : listener,
        self : self,
        capture : capture,
        unique : unique
      };

      return id;
    },


    /**
     * Removes an event listener from the element.
     *
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (this.$$disposed) {
        return null;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Failed to remove event listener for type '" + type + "'" +
          " from the target '" + this + "': ";

        this.assertString(type, msg + "Invalid event type.");
        this.assertFunction(listener, msg + "Invalid callback function");

        if (self !== undefined) {
          this.assertObject(self, "Invalid context for callback.");
        }

        if (capture !== undefined) {
          this.assertBoolean(capture, "Invalid capture flag.");
        }
      }

      if (qx.Class.supportsEvent(this, type)) {
        return this.base(arguments, type, listener, self, capture);
      }

      if (this._domNode)
      {
        if (listener.$$wrapped_callback && listener.$$wrapped_callback[type + this.toHashCode()]) {
          var callback = listener.$$wrapped_callback[type + this.toHashCode()];
          delete listener.$$wrapped_callback[type + this.toHashCode()];
          listener = callback;
        }
        qx.event.Registration.removeListener(this._domNode, type, listener, self, capture);
      }
      else
      {
        var values = this.__eventValues;
        var entry;

        if (capture == null) {
          capture = false;
        }

        for (var key in values)
        {
          entry = values[key];

          // Optimized for performance: Testing references first
          if (entry.listener === listener && entry.self === self && entry.capture === capture && entry.type === type)
          {
            delete values[key];
            break;
          }
        }
      }

      return this;
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param id {var} The id returned by {@link #addListener}
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeListenerById : function(id)
    {
      if (this.$$disposed) {
        return null;
      }

      if (qx.Class.supportsEvent(this, type)) {
        return this.base(arguments, id);
      }

      if (this._domNode) {
        qx.event.Registration.removeListenerById(this._domNode, id);
      } else {
        delete this.__eventValues[id];
      }

      return this;
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @param type {String} name of the event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the object has a listener of the given type.
     */
    hasListener : function(type, capture)
    {
      if (this.$$disposed) {
        return false;
      }

      if (qx.Class.supportsEvent(this, type)) {
        return this.base(arguments, type, capture);
      }

      if (this._domNode) {
        if (qx.event.Registration.hasListener(this._domNode, type, capture))
          return true;
        
      } else {
        var values = this.__eventValues;
        var entry;
  
        if (capture == null) {
          capture = false;
        }
  
        for (var key in values) {
          entry = values[key];
  
          // Optimized for performance: Testing fast types first
          if (entry.capture === capture && entry.type === type) {
            return true;
          }
        }
      }

      return false;
    },


    /**
     * Serializes and returns all event listeners attached to this element
     * @return {Map[]} an Array containing a map for each listener. The maps
     * have the following keys:
     * <ul>
     *   <li><code>type</code> (String): Event name</li>
     *   <li><code>handler</code> (Function): Callback function</li>
     *   <li><code>self</code> (Object): The callback's context</li>
     *   <li><code>capture</code> (Boolean): If <code>true</code>, the listener is
     * attached to the capturing phase</li>
     * </ul>
     */
    getListeners : function() {
      if (this.$$disposed) {
        return null;
      }

      if (this._domNode) {
        return qx.event.Registration.getManager(this._domNode).serializeListeners(this._domNode);
      }

      var listeners = [];
      for (var id in this.__eventValues) {
        var listenerData = this.__eventValues[id];
        listeners.push({
          type: listenerData.type,
          handler: listenerData.listener,
          self: listenerData.self,
          capture: listenerData.capture
        });
      }

      return listeners;
    }
  },





  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    var el = this._domNode;
    if (el)
    {
      qx.event.Registration.getManager(el).removeAllListeners(el);
      el.$$element = "";
      delete el.$$elementObject;
      el.$$qxObjectHash = "";
      delete el.$$qxObject;
    }

    if (!qx.core.ObjectRegistry.inShutDown)
    {
      var parent = this._parent;
      if (parent && !parent.$$disposed) {
        parent.remove(this);
      }
    }

    this._disposeArray("_children");

    this._propertyValues = this._propertyJobs = this._domNode = this._parent = this.__eventValues = null;
  }
});
