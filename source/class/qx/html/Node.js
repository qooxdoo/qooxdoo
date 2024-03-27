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
qx.Class.define("qx.html.Node", {
  extend: qx.core.Object,
  implement: [qx.core.IDisposable],

  /**
   * Creates a new Element
   *
   * @param nodeName {String} name of the node; will be a tag name for Elements, otherwise it's a reserved
   * name eg "#text"
   */
  construct(nodeName) {
    super();
    this._nodeName = nodeName;
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Finds the Widget for a given DOM element
     *
     * @param domElement {DOM} the DOM element
     * @return {qx.ui.core.Widget} the Widget that created the DOM element
     */
    fromDomNode(domNode) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertTrue(
          (!domNode.$$element && !domNode.$$elementObject) ||
            domNode.$$element === domNode.$$elementObject.toHashCode()
        );
      }
      return domNode.$$elementObject;
    },

    /**
     * Converts a DOM node into a qx.html.Node, providing the existing instance if
     * there is one
     *
     * @param {Node} domNode
     * @returns {qx.html.Node}
     */
    toVirtualNode(domNode) {
      if (domNode.$$elementObject) {
        return domNode.$$elementObject;
      }

      let html = qx.html.Factory.getInstance().createElement(
        domNode.nodeName,
        domNode.attributes
      );

      html.useNode(domNode);
      return html;
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
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
      apply: "_applyVisible",
      event: "changeVisible"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      PROTECTED HELPERS/DATA
    ---------------------------------------------------------------------------
    */

    /** @type {String} the name of the node */
    _nodeName: null,

    /** @type {Node} DOM node of this object */
    _domNode: null,

    /** @type {qx.html.Element} parent element */
    _parent: null,

    /** @type {qx.core.Object} the Qooxdoo object this node is attached to */
    _qxObject: null,

    /** @type {Boolean} Whether the element should be included in the render result */
    _included: true,

    _children: null,
    _modifiedChildren: null,

    _propertyJobs: null,
    _properties: null,

    /** @type {Map} map of event handlers */
    __eventValues: null,

    /**
     * Connects a widget to this element, and to the DOM element in this Element.  They
     * remain associated until disposed or disconnectObject is called
     *
     * @param qxObject {qx.core.Object} the object to associate
     */
    connectObject(qxObject) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertTrue(
          !this._qxObject || this._qxObject === qxObject
        );
      }

      this._qxObject = qxObject;
      if (this._domNode) {
        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue(
            (!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject) ||
              (this._domNode.$$qxObject === qxObject &&
                this._domNode.$$qxObjectHash === qxObject.toHashCode())
          );
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
    disconnectObject(qxObject) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertTrue(this._qxObject === qxObject);
      }

      delete this._qxObject;
      if (this._domNode) {
        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue(
            (!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject) ||
              (this._domNode.$$qxObject === qxObject &&
                this._domNode.$$qxObjectHash === qxObject.toHashCode())
          );
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
    _createDomElement() {
      throw new Error(
        "No implementation for " + this.classname + "._createDomElement"
      );
    },

    /**
     * Serializes the virtual DOM element to a string
     *
     * @param pretty {Boolean?} whether to pretty print the output. Defaults to `false`
     * @return {String} the serialised version
     */
    serialize(pretty = false) {
      let serializer = new qx.html.Serializer();
      serializer.setPrettyPrint(!!pretty);
      this._serializeImpl(serializer);
      return serializer.getOutput();
    },

    /**
     * Serializes the virtual DOM element to a writer; the `writer` function accepts
     *  an varargs, which can be joined with an empty string or streamed.
     *
     * @param serializer {qx.html.Serializer} the serializer
     */
    _serializeImpl(serializer) {
      throw new Error(
        "No implementation for " + this.classname + ".serializeImpl"
      );
    },

    /**
     * Uses an existing element instead of creating one. This may be interesting
     * when the DOM element is directly needed to add content etc.
     *
     * @param domNode {Node} DOM Node to reuse
     */
    useNode(domNode) {
      if (this._domNode) {
        throw new Error("Could not overwrite existing element!");
      }

      const removeAllChildren = parentElement => {
        if (parentElement._children) {
          qx.lang.Array.clone(parentElement._children).forEach(node => {
            parentElement._removeChildImpl(node);
            node._disconnectDomNode();
          });
          parentElement._children = null;
        }
      };

      const scanDomNode = (parentElement, domNode, idx) => {
        if (domNode.nodeType == window.Node.TEXT_NODE) {
          let newChild = qx.html.Factory.getInstance().createElement("#text");
          newChild._useNodeImpl(domNode);
          parentElement._addChildImpl(newChild);
          if (parentElement._children[idx]?.classname === "qx.html.Text") {
            parentElement._children[idx] = newChild;
          } else {
            parentElement._children.push(newChild);
          }
          return;
        }

        let id = domNode.getAttribute("data-qx-object-id");
        let element = null;
        if (id) {
          try {
            element = parentElement.getQxObject(id);
          } catch (ex) {
            element = null;
          }
        }
        if (!element) {
          element = qx.html.Factory.getInstance().createElement(
            domNode.nodeName,
            domNode.attributes
          );
        }

        if (element._parent !== parentElement) {
          parentElement._addChildImpl(element);
          parentElement._children.push(element);
        }
        element._connectDomNode(domNode);
        element._copyData(true, true);

        qx.lang.Array.fromCollection(domNode.childNodes).forEach(
          (childDomNode, idx) => scanDomNode(element, childDomNode, idx)
        );

        parentElement._scheduleChildrenUpdate();
      };

      removeAllChildren(this);
      this._connectDomNode(domNode);
      this._copyData(true, true);
      qx.lang.Array.fromCollection(domNode.childNodes).forEach(
        (childDomNode, idx) => scanDomNode(this, childDomNode, idx)
      );

      this.flush();
      this._insertChildren();

      this._scheduleChildrenUpdate();
    },

    /**
     * Connects a DOM element to this Node; if this Node is already connected to a Widget
     * then the Widget is also connected.
     *
     * @param domNode {DOM} the DOM Node to associate
     */
    _connectDomNode(domNode) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertTrue(!this._domNode || this._domNode === domNode);
        qx.core.Assert.assertTrue(
          (domNode.$$elementObject === this &&
            domNode.$$element === this.toHashCode()) ||
            (!domNode.$$elementObject && !domNode.$$element)
        );
      }

      this._domNode = domNode;
      domNode.$$elementObject = this;
      domNode.$$element = this.toHashCode();
      if (this._qxObject) {
        domNode.$$qxObjectHash = this._qxObject.toHashCode();
        domNode.$$qxObject = this._qxObject;
      }
    },

    /**
     * Disconnects the DOM node
     */
    _disconnectDomNode() {
      if (this._domNode && this._domNode.parentElement) {
        this._domNode.parentElement.removeChild(this._domNode);
      }
      this._domNode = null;
    },

    /**
     * Detects whether the DOM node has been created and is in the document
     *
     * @return {Boolean}
     */
    isInDocument() {
      if (!this._domNode) {
        return false;
      }
      if (document.body) {
        for (
          var domNode = this._domNode;
          domNode != null;
          domNode = domNode.parentElement
        ) {
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
    updateObjectId() {
      // Copy Object Id
      if (qx.core.Environment.get("module.objectid")) {
        if (this._domNode) {
          qx.bom.element.Attribute.set(
            "data-qx-object-id",
            this._getApplicableQxObjectId()
          );
        }
      }
    },

    /**
     * @Override
     */
    _cascadeQxObjectIdChanges() {
      if (qx.core.Environment.get("module.objectid")) {
        this.updateObjectId();
      }
      super._cascadeQxObjectIdChanges();
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
    _scheduleChildrenUpdate() {
      if (this._modifiedChildren) {
        return;
      }

      if (this._domNode) {
        this._modifiedChildren = true;

        qx.html.Element._modified[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      }
    },

    /**
     * Syncs data of an HtmlElement object to the DOM.
     *
     * This is just a public wrapper around `flush`, because the scope has changed
     *
     * @deprecated {6.0} Please use `.flush()` instead
     */
    _flush() {
      this.flush();
    },

    /**
     * Syncs data of an HtmlElement object to the DOM.
     *
     */
    flush() {
      if (qx.core.Environment.get("qx.debug")) {
        if (this.DEBUG) {
          this.debug("Flush: " + this.getAttribute("id"));
        }
      }

      var length;
      var children = this._children;
      if (children) {
        length = children.length;
        var child;
        for (var i = 0; i < length; i++) {
          child = children[i];

          if (child.isVisible() && child._included && !child._domNode) {
            child.flush();
          }
        }
      }

      if (!this._domNode) {
        this._connectDomNode(this._createDomElement());

        this._copyData(false, false);

        if (children && length > 0) {
          this._insertChildren();
        }
      } else {
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
    isRoot() {
      throw new Error("No implementation for " + this.classname + ".isRoot");
    },

    /**
     * Detects whether this element is inside a root element
     *
     * @return {Boolean}
     */
    isInRoot() {
      var tmp = this;
      while (tmp) {
        if (tmp.isRoot()) {
          return true;
        }
        tmp = tmp._parent;
      }
      return false;
    },

    /**
     * Walk up the internal children hierarchy and
     * look if one of the children is marked as root.
     *
     * This method is quite performance hungry as it
     * really walks up recursively.
     * @return {Boolean} <code>true</code> if the element will be seeable
     */
    _willBeSeeable() {
      if (!qx.html.Element._hasRoots) {
        return false;
      }
      var pa = this;

      // Any chance to cache this information in the parents?
      while (pa) {
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
    _insertChildren() {
      var children = this._children;
      if (!children) {
        return;
      }
      var length = children.length;
      var child;

      if (length > 2) {
        var domElement = document.createDocumentFragment();
        for (var i = 0; i < length; i++) {
          child = children[i];
          if (child._domNode && child._included) {
            domElement.appendChild(child._domNode);
          }
        }

        this._domNode.appendChild(domElement);
      } else {
        var domElement = this._domNode;
        for (var i = 0; i < length; i++) {
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
    _syncChildren() {
      var dataChildren = this._children || [];
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
      for (var i = domChildren.length - 1; i >= 0; i--) {
        domEl = domChildren[i];
        dataEl = qx.html.Node.fromDomNode(domEl);

        if (!dataEl || !dataEl._included || dataEl._parent !== this) {
          domParent.removeChild(domEl);

          if (qx.core.Environment.get("qx.debug")) {
            domOperations++;
          }
        }
      }

      // Start from beginning and bring DOM in sync
      // with the data structure
      for (var i = 0; i < dataLength; i++) {
        dataChild = dataChildren[i];

        // Only process visible childs
        if (dataChild._included) {
          dataEl = dataChild._domNode;
          domEl = domChildren[domPos];

          if (!dataEl) {
            continue;
          }

          // Only do something when out of sync
          // If the data element is not there it may mean that it is still
          // marked as visible=false
          if (dataEl != domEl) {
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
      if (qx.core.Environment.get("qx.debug")) {
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
     * @param propertiesFromDom {Boolean} whether the copy should respect the property
     *  values in the dom
     */
    _copyData(fromMarkup, propertiesFromDom) {
      var elem = this._domNode;

      // Attach events
      var data = this.__eventValues;
      if (data) {
        // Import listeners
        let domEvents = {};
        let manager = qx.event.Registration.getManager(elem);
        for (let id in data) {
          if (manager.findHandler(elem, data[id].type)) {
            domEvents[id] = data[id];
          }
        }
        qx.event.Registration.getManager(elem).importListeners(elem, domEvents);

        // Cleanup event map
        // Events are directly attached through event manager
        // after initial creation. This differs from the
        // handling of styles and attributes where queuing happens
        // through the complete runtime of the application.
        delete this.__eventValues;
      }

      // Copy properties
      if (this._properties) {
        for (var key in this._properties) {
          var prop = this._properties[key];
          if (propertiesFromDom) {
            if (prop.get) {
              prop.value = prop.get.call(this, key);
            }
          } else if (prop.value !== undefined) {
            prop.set.call(this, prop.value, key);
          }
        }
      }
    },

    /**
     * Synchronizes data between the internal representation and the DOM. This
     * is the counterpart of {@link #_copyData} and is used for further updates
     * after the element has been created.
     *
     */
    _syncData() {
      // Sync misc
      var jobs = this._propertyJobs;
      if (jobs && this._properties) {
        for (var key in jobs) {
          var prop = this._properties[key];
          if (prop.value !== undefined) {
            prop.set.call(this, prop.value, key);
          }
        }

        this._propertyJobs = null;
      }
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
    _addChildImpl(child) {
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
    _removeChildImpl(child) {
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
    _moveChildImpl(child) {
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
    getChildren() {
      return this._children || null;
    },

    /**
     * Get a child element at the given index
     *
     * @param index {Integer} child index
     * @return {qx.html.Element|null} The child element or <code>null</code> if
     *     no child is found at that index.
     */
    getChild(index) {
      var children = this._children;
      return (children && children[index]) || null;
    },

    /**
     * Returns whether the element has any child nodes
     *
     * @return {Boolean} Whether the element has any child nodes
     */
    hasChildren() {
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
    indexOf(child) {
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
    hasChild(child) {
      var children = this._children;
      return children && children.indexOf(child) !== -1;
    },

    /**
     * Append all given children at the end of this element.
     *
     * @param varargs {qx.html.Element} elements to insert
     * @return {qx.html.Element} this object (for chaining support)
     */
    add(varargs) {
      var self = this;
      function addImpl(arr) {
        arr.forEach(function (child) {
          if (["string", "number", "boolean"].includes(typeof child)) {
            child = new qx.html.Text(`${child}`);
          } else if (
            child instanceof qx.data.Array ||
            qx.lang.Type.isArray(child)
          ) {
            addImpl(child);
          }
          if (child == null) {
            if (qx.core.Environment.get("qx.debug")) {
              console.error(
                `Tried to add a child of ${child} to ${self.classname}`
              );
            }
            child = new qx.html.Text(`[${child}]`);
          }

          self._addChildImpl(child);
          self._children.push(child);
        });
      }
      addImpl(qx.lang.Array.fromArguments(arguments));

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
    addAt(child, index) {
      if (typeof child == "string") {
        child = new qx.html.Text(child);
      } else if (typeof child == "number") {
        child = new qx.html.Text("" + child);
      }
      this._addChildImpl(child);
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
    remove(childs) {
      var children = this._children;
      if (!children) {
        return this;
      }

      var self = this;
      function removeImpl(arr) {
        arr.forEach(function (child) {
          if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
            removeImpl(child);
          } else {
            self._removeChildImpl(child);
            qx.lang.Array.remove(children, child);
          }
        });
      }
      removeImpl(qx.lang.Array.fromArguments(arguments));

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
    removeAt(index) {
      var children = this._children;
      if (!children) {
        throw new Error("Has no children!");
      }

      var child = children[index];
      if (!child) {
        throw new Error("Has no child at this position!");
      }

      this._removeChildImpl(child);
      qx.lang.Array.removeAt(this._children, index);

      // Chaining support
      return this;
    },

    /**
     * Remove all children from this element.
     *
     * @return {qx.html.Element} A reference to this.
     */
    removeAll() {
      var children = this._children;
      if (children) {
        for (var i = 0, l = children.length; i < l; i++) {
          this._removeChildImpl(children[i]);
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
    getParent() {
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
    insertInto(parent, index) {
      parent._addChildImpl(this);

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
    insertBefore(rel) {
      var parent = rel._parent;

      parent._addChildImpl(this);
      qx.lang.Array.insertBefore(parent._children, this, rel);

      return this;
    },

    /**
     * Insert self after the given (related) element
     *
     * @param rel {qx.html.Element} the related element
     * @return {qx.html.Element} this object (for chaining support)
     */
    insertAfter(rel) {
      var parent = rel._parent;

      parent._addChildImpl(this);
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
    moveTo(index) {
      var parent = this._parent;

      parent._moveChildImpl(this);

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
    moveBefore(rel) {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel));
    },

    /**
     * Move self after the given (related) child.
     *
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveAfter(rel) {
      var parent = this._parent;
      return this.moveTo(parent._children.indexOf(rel) + 1);
    },

    /**
     * Remove self from the current parent.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    free() {
      var parent = this._parent;
      if (!parent) {
        throw new Error("Has no parent to remove from.");
      }

      if (!parent._children) {
        return this;
      }

      parent._removeChildImpl(this);
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
    getDomElement(create) {
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
    getNodeName() {
      return this._nodeName;
    },

    /**
     * Sets the nodeName of the DOM element.
     *
     * @param name {String} The node name
     */
    setNodeName(name) {
      if (
        this._domNode &&
        name.toLowerCase() !== this._nodeName.toLowerCase()
      ) {
        throw new Error(
          "Cannot change the name of the node after the DOM node has been created"
        );
      }
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
    include() {
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
    exclude() {
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
    isIncluded() {
      return this._included === true;
    },

    /**
     * Apply method for visible property
     */
    _applyVisible(value) {
      // Nothing - to be overridden
    },
    /*
    ---------------------------------------------------------------------------
    PROPERTY SUPPORT
    ---------------------------------------------------------------------------
    */ /**
     * Registers a property and the implementations used to read the property value
     * from the DOM and to set the property value onto the DOM.  This allows the element
     * to have a simple `setProperty` method that knows how to read and write the value.
     *
     * You do not have to specify a getter or a setter - by default the setter will use
     * `_applyProperty` for backwards compatibility, and there is no getter implementation.
     *
     * The functions are called with `this` set to this Element.  The getter takes
     * the property name as a parameter and is expected to return a value, the setter takes
     * the property name and value as parameters, and returns nothing.
     *
     * @param key {String} the property name
     * @param getter {Function?} function to read from the DOM
     * @param setter {Function?} function to copy to the DOM
     * @param serialize {Function?} function to serialize the value to HTML
     */ registerProperty(key, get, set, serialize) {
      if (!this._properties) {
        this._properties = {};
      }
      if (this._properties[key]) {
        this.debug(
          "Overridding property " +
            key +
            " in " +
            this +
            "[" +
            this.classname +
            "]"
        );
      }
      if (!set) {
        set = qx.lang.Function.bind(function (value, key) {
          this._applyProperty(key, value);
        }, this);
        qx.log.Logger.deprecatedMethodWarning(
          this._applyProperty,
          "The method '_applyProperty' is deprecated.  Please use `registerProperty` instead (property '" +
            key +
            "' in " +
            this.classname +
            ")"
        );
      }
      this._properties[key] = {
        get: get,
        set: set,
        serialize: serialize,
        value: undefined
      };
    },

    /**
     * Applies a special property with the given value.
     *
     * This property apply routine can be easily overwritten and
     * extended by sub classes to add new low level features which
     * are not easily possible using styles and attributes.
     *
     * Note that this implementation is for backwards compatibility and
     * implementations
     *
     * @param name {String} Unique property identifier
     * @param value {var} Any valid value (depends on the property)
     * @return {qx.html.Element} this object (for chaining support)
     * @abstract
     * @deprecated {6.0} please use `registerProperty` instead
     */
    _applyProperty(name, value) {
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
     */ _setProperty(key, value, direct) {
      if (!this._properties || !this._properties[key]) {
        this.registerProperty(key, null, null);
      }
      if (this._properties[key].value == value) {
        return this;
      }
      this._properties[key].value = value;
      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._domNode) {
        // Omit queuing in direct mode
        if (direct) {
          this._properties[key].set.call(this, value, key);
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
    _removeProperty(key, direct) {
      return this._setProperty(key, null, direct);
    },

    /**
     * Get the value of the given misc.
     *
     * @param key {String} name of the misc
     * @param direct {Boolean?false} Whether the value should be obtained directly (without queuing)
     * @return {var} the value of the misc
     */
    _getProperty(key, direct) {
      if (!this._properties || !this._properties[key]) {
        return null;
      }

      var value = this._properties[key].value;
      if (this._domNode) {
        if (direct || value === undefined) {
          var fn = this._properties[key].get;
          if (fn) {
            this._properties[key].value = value = fn.call(this, key);
          }
        }
      }

      return value === undefined ? null : value;
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
    addListener(type, listener, self, capture) {
      if (this.$$disposed) {
        return null;
      }

      if (qx.core.Environment.get("qx.debug")) {
        var msg =
          "Failed to add event listener for type '" +
          type +
          "'" +
          " to the target '" +
          this +
          "': ";

        this.assertString(type, msg + "Invalid event type.");
        this.assertFunction(listener, msg + "Invalid callback function");

        if (self !== undefined) {
          this.assertObject(self, "Invalid context for callback.");
        }

        if (capture !== undefined) {
          this.assertBoolean(capture, "Invalid capture flag.");
        }
      }

      const registerDomEvent = () => {
        if (this._domNode) {
          return qx.event.Registration.addListener(
            this._domNode,
            type,
            listener,
            self,
            capture
          );
        }

        if (!this.__eventValues) {
          this.__eventValues = {};
        }

        if (capture == null) {
          capture = false;
        }

        var unique = qx.event.Manager.getNextUniqueId();
        var id = type + (capture ? "|capture|" : "|bubble|") + unique;

        this.__eventValues[id] = {
          type: type,
          listener: listener,
          self: self,
          capture: capture,
          unique: unique
        };

        return id;
      };

      if (qx.Class.supportsEvent(this, type)) {
        let id = super.addListener(type, listener, self, capture);
        id.domEventId = registerDomEvent();
        return id;
      }

      return registerDomEvent();
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
    removeListener(type, listener, self, capture) {
      if (this.$$disposed) {
        return null;
      }

      if (qx.core.Environment.get("qx.debug")) {
        var msg =
          "Failed to remove event listener for type '" +
          type +
          "'" +
          " from the target '" +
          this +
          "': ";

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
        super.removeListener(type, listener, self, capture);
      }

      if (this._domNode) {
        if (
          listener.$$wrapped_callback &&
          listener.$$wrapped_callback[type + this.toHashCode()]
        ) {
          var callback = listener.$$wrapped_callback[type + this.toHashCode()];
          delete listener.$$wrapped_callback[type + this.toHashCode()];
          listener = callback;
        }
        qx.event.Registration.removeListener(
          this._domNode,
          type,
          listener,
          self,
          capture
        );
      } else {
        var values = this.__eventValues;
        var entry;

        if (capture == null) {
          capture = false;
        }

        for (var key in values) {
          entry = values[key];

          // Optimized for performance: Testing references first
          if (
            entry.listener === listener &&
            entry.self === self &&
            entry.capture === capture &&
            entry.type === type
          ) {
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
    removeListenerById(id) {
      if (this.$$disposed) {
        return null;
      }

      if (id.domEventId) {
        if (this._domNode) {
          qx.event.Registration.removeListenerById(
            this._domNode,
            id.domEventId
          );
        }
        delete id.domEventId;
        super.removeListenerById(id);
      } else {
        if (this._domNode) {
          qx.event.Registration.removeListenerById(this._domNode, id);
        } else {
          delete this.__eventValues[id];
        }
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
    hasListener(type, capture) {
      if (this.$$disposed) {
        return false;
      }

      if (qx.Class.supportsEvent(this, type)) {
        let has = super.hasListener(type, capture);
        if (has) {
          return true;
        }
      }

      if (this._domNode) {
        if (qx.event.Registration.hasListener(this._domNode, type, capture)) {
          return true;
        }
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
    getListeners() {
      if (this.$$disposed) {
        return null;
      }

      var listeners = [];
      qx.lang.Array.append(
        listeners,
        qx.event.Registration.serializeListeners(this) || []
      );

      if (this._domNode) {
        qx.lang.Array.append(
          listeners,
          qx.event.Registration.serializeListeners(this._domNode) || []
        );
      }

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

  destruct() {
    var el = this._domNode;
    if (el) {
      qx.event.Registration.getManager(el).removeAllListeners(el);
      el.$$element = "";
      delete el.$$elementObject;
      el.$$qxObjectHash = "";
      delete el.$$qxObject;
    }

    if (!qx.core.ObjectRegistry.inShutDown) {
      var parent = this._parent;
      if (parent && !parent.$$disposed) {
        parent.remove(this);
      }
    }

    this._disposeArray("_children");

    this._properties =
      this._propertyJobs =
      this._domNode =
      this._parent =
      this.__eventValues =
        null;
  }
});
