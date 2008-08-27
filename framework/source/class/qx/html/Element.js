/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

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
 * From the view of the parent you can use the following children managment
 * methods:
 * {@link #getChildren}, {@link #indexOf}, {@link #hasChild}, {@link #add},
 * {@link #addAt}, {@link #remove}, {@link #removeAt}, {@link #removeAll}
 *
 * Each child itself also has got some powerful methods to control its
 * position:
 * {@link #getParent}, {@link #free},
 * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
 * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
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
   *
   * @param tagName {String?"div"} Tag name of the element to create
   */
  construct : function(tagName)
  {
    this.base(arguments);

    // {String} Set tag name
    this._nodeName = tagName || "div";
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
    DEBUG : false,


    /** {Map} Contains the modified {@link qx.html.Element}s. The key is the hash code. */
    _modified : {},


    /** {Map} Contains the {@link qx.html.Element}s which should get hidden or visible at the next flush. The key is the hash code. */
    _visibility : {},


    /** {Map} Contains the {@link qx.html.Element}s which should scrolled at the next flush */
    _scroll : {},


    /** {Map} Map of post actions for elements. The key is the action name. The value the {@link qx.html.Element}. */
    _actions : {},


    /** {Array} A list of all supported (post) actions */
    _supportedActions : [ "activate", "focus", "capture" ],







    /*
    ---------------------------------------------------------------------------
      PUBLIC ELEMENT FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Schedule a deferred element queue flush. If the widget subsystem is used
     * this method gets overwritten by {@link qx.ui.core.queue.Manager}.
     *
     * @param job {String} The job descriptor. Should always be <code>"element"</code>.
     */
    _scheduleFlush : function(job) {
      qx.html.Element.__deferredCall.schedule();
    },


    /**
     * Sorts elements by their cascading level
     *
     * @signature function(a, b)
     * @param a {Element} DOM element 1
     * @param b {Element} DOM element 2
     */
    _mshtmlVisibilitySort : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(a, b)
      {
        var al = a._element;
        var bl = b._element;

        if (al.contains(bl)) {
          return 1;
        }

        if (bl.contains(al)) {
          return -1;
        }

        return 0;
      },

      "default" : null
    }),


    /**
     * Flush the global modified list
     *
     */
    flush : function()
    {
      var obj;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.DEBUG) {
          qx.log.Logger.debug(this, "Flushing elements...");
        }
      }

      var later = [];
      var modified = this._modified;

      for (var hc in modified)
      {
        obj = modified[hc];

        // Ignore all hidden elements
        // but keep them until they get visible (again)
        if (obj.__willBeSeeable())
        {
          // Separately queue rendered elements
          if (obj._element && qx.dom.Hierarchy.isRendered(obj._element))
          {
            later.push(obj);
          }

          // Flush invisible elements first
          else
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (this.DEBUG) {
                obj.debug("Flush invisible element");
              }
            }

            obj.__flush();
          }

          // Cleanup modification list
          delete modified[hc];
        }
      }

      for (var i=0, l=later.length; i<l; i++)
      {
        obj = later[i];

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (this.DEBUG) {
            obj.debug("Flush rendered element");
          }
        }

        obj.__flush();
      }



      // Process visibility list
      var visibility = this._visibility;

      // IE, at least version 7.0, has issues when hiding cascaded
      // elements (settings them to display=none). In this case we must
      // be sure to hide them from inner to outer.
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Build list
        var list = [];
        for (var hc in visibility) {
          list.push(visibility[hc]);
        }

        // Only makes sense when at least one item should be modified
        if (list.length > 1)
        {
          // Sort list
          list.sort(this._mshtmlVisibilitySort);

          // Rebuild map structure from list
          visibility = this._visibility = {};
          for (var i=0; i<list.length; i++)
          {
            obj = list[i];
            visibility[obj.$$hash] = obj;
          }
        }
      }

      for (var hc in visibility)
      {
        obj = visibility[hc];

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (this.DEBUG) {
            qx.log.Logger.debug(this, "Switching visibility to: " + obj._visible);
          }
        }

        obj._element.style.display = obj._visible ? "" : "none";
        delete visibility[hc];
      }



      // Process scroll list
      var scroll = this._scroll;
      for (var hc in scroll)
      {
        obj = scroll[hc];
        var elem = obj._element;

        if (elem && elem.offsetWidth)
        {
          var done = true;

          // ScrollToX
          if (obj.__lazyScrollX != null)
          {
            obj._element.scrollLeft = obj.__lazyScrollX;
            delete obj.__lazyScrollX;
          }

          // ScrollToY
          if (obj.__lazyScrollY != null)
          {
            obj._element.scrollTop = obj.__lazyScrollY;
            delete obj.__lazyScrollY;
          }

          // ScrollIntoViewX
          var intoViewX = obj.__lazyScrollIntoViewX;
          if (intoViewX != null)
          {
            var child = intoViewX.element.getDomElement();

            if (child && child.offsetWidth)
            {
              qx.bom.element.Scroll.intoViewX(child, elem, intoViewX.align);
              delete obj.__lazyScrollIntoViewX;
            }
            else
            {
              done = false;
            }
          }

          // ScrollIntoViewY
          var intoViewY = obj.__lazyScrollIntoViewY;
          if (intoViewY != null)
          {
            var child = intoViewY.element.getDomElement();

            if (child && child.offsetWidth)
            {
              qx.bom.element.Scroll.intoViewY(child, elem, intoViewY.align);
              delete obj.__lazyScrollIntoViewY;
            }
            else
            {
              done = false;
            }
          }

          // Clear flag if all things are done
          // Otherwise wait for the next flush
          if (done) {
            delete scroll[hc];
          }
        }
      }



      // Process action list
      var post = this._actions;
      var actions = this._supportedActions;
      var action, element;

      for (var i=0, l=actions.length; i<l; i++)
      {
        action = actions[i];

        if (post[action])
        {
          element = post[action]._element;

          if (element) {
            qx.bom.Element[action](element);
          }

          delete post[action];
        }
      }



      // Fire appear/disappear events
      qx.event.handler.Appear.refresh();
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

    /** {Element} DOM element of this object */
    _element : null,


    /** {Boolean} Marker for always visible root nodes (often the body node) */
    _root : false,


    /** {Boolean} Whether the element should be included in the render result */
    _included : true,


    /** {Boolean} Whether the element should be visible in the render result */
    _visible : true,


    /**
     * Add the element to the global modification list.
     *
     * @return {void}
     */
    _scheduleChildrenUpdate : function()
    {
      if (this._modifiedChildren) {
        return;
      }

      this._modifiedChildren = true;
      qx.html.Element._modified[this.$$hash] = this;
      qx.html.Element._scheduleFlush("element");
    },


    /**
     * Internal helper to generate the DOM element
     *
     */
    _createDomElement : function() {
      return qx.bom.Element.create(this._nodeName);
    },






    /*
    ---------------------------------------------------------------------------
      FLUSH OBJECT
    ---------------------------------------------------------------------------
    */

    /**
     * Syncs data of an HtmlElement object to the DOM.
     *
     * @return {void}
     */
    __flush : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.DEBUG) {
          this.debug("Flush: " + this.getAttribute("id"));
        }
      }

      var children = this.__children;
      if (children)
      {
        var length = children.length;
        var child;
        for (var i=0; i<length; i++)
        {
          child = children[i];

          if (child._visible && child._included && !child._element) {
            child.__flush();
          }
        }
      }

      if (!this._element)
      {
        this._element = this._createDomElement();
        this._element.$$hash = this.$$hash;

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
     * @return {void}
     */
    _insertChildren : function()
    {
      var children = this.__children;
      var length = children.length;
      var child;

      if (length > 2)
      {
        var domElement = document.createDocumentFragment();
        for (var i=0; i<length; i++)
        {
          child = children[i];
          if (child._element && child._included) {
            domElement.appendChild(child._element);
          }
        }

        this._element.appendChild(domElement);
      }
      else
      {
        var domElement = this._element;
        for (var i=0; i<length; i++)
        {
          child = children[i];
          if (child._element && child._included) {
            domElement.appendChild(child._element);
          }
        }
      }
    },


    /**
     * Syncronize internal children hierarchy to the DOM. This is used
     * for further runtime updates after the element has been created
     * initially.
     *
     * @return {void}
     */
    _syncChildren : function()
    {
      var ObjectRegistry = qx.core.ObjectRegistry;

      var dataChildren = this.__children;
      var dataLength = dataChildren.length
      var dataChild;
      var dataEl;

      var domParent = this._element;
      var domChildren = domParent.childNodes;
      var domPos = 0;
      var domEl;

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        var domOperations = 0;
      }

      // Remove children from DOM which are excluded or remove first
      for (var i=domChildren.length-1; i>=0; i--)
      {
        domEl = domChildren[i];
        dataEl = ObjectRegistry.fromHashCode(domEl.$$hash);

        if (!dataEl || !dataEl._included || dataEl.__parent !== this)
        {
          domParent.removeChild(domEl);

          if (qx.core.Variant.isSet("qx.debug", "on")) {
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
          dataEl = dataChild._element;
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

            if (qx.core.Variant.isSet("qx.debug", "on")) {
              domOperations++
            }
          }

          // Increase counter
          domPos++;
        }
      }

      // User feedback
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.html.Element.DEBUG) {
          this.debug("Synced DOM with " + domOperations + " operations");
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
     * element creation. After this the data must be synced using {@link #_syncData}
     *
     * @param fromMarkup {Boolean} Whether the copy should respect styles
     *   given from markup
     * @return {void}
     */
    _copyData : function(fromMarkup)
    {
      var elem = this._element;

      // Copy attributes
      var data = this.__attribValues;
      if (data)
      {
        var Attribute = qx.bom.element.Attribute;

        for (var key in data) {
          Attribute.set(elem, key, data[key]);
        }
      }

      // Copy styles
      var data = this.__styleValues;
      if (data)
      {
        var Style = qx.bom.element.Style;
        if (fromMarkup)
        {
          for (var key in data) {
            Style.set(elem, key, data[key]);
          }
        }
        else
        {
          // Set styles at once which is a lot faster in most browsers
          // compared to separate modifications of many single style properties.
          Style.setCss(elem, Style.compile(data));
        }
      }

      // Copy properties
      var data = this.__propertyValues;
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
        // after intial creation. This differs from the
        // handling of styles and attributes where queuing happes
        // through the complete runtime of the application.
        delete this.__eventValues;
      }
    },


    /**
     * Syncronizes data between the internal representation and the DOM. This
     * is the counterpart of {@link #_copyData} and is used for further updates
     * after the element has been created.
     *
     * @return {void}
     */
    _syncData : function()
    {
      var elem = this._element;

      var Attribute = qx.bom.element.Attribute;
      var Style = qx.bom.element.Style;

      // Sync attributes
      var jobs = this.__attribJobs;
      if (jobs)
      {
        var data = this.__attribValues;
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

        this.__attribJobs = null;
      }

      // Sync styles
      var jobs = this.__styleJobs;
      if (jobs)
      {
        var data = this.__styleValues;
        if (data)
        {
          var value;
          for (var key in jobs)
          {
            value = data[key];

            if (value !== undefined) {
              Style.set(elem, key, value);
            } else {
              Style.reset(elem, key);
            }
          }
        }

        this.__styleJobs = null;
      }

      // Sync misc
      var jobs = this.__propertyJobs;
      if (jobs)
      {
        var data = this.__propertyValues;
        if (data)
        {
          var value;
          for (var key in jobs) {
            this._applyProperty(key, data[key]);
          }
        }

        this.__propertyJobs = null;
      }

      // Note: Events are directly kept in sync
    },








    /*
    ---------------------------------------------------------------------------
      PRIVATE HELPERS/DATA
    ---------------------------------------------------------------------------
    */

    /**
     * Walk up the internal children hierarchy and
     * look if one of the children is marked as root.
     *
     * This method is quite performance hungry as it
     * really walks up recursively.
     */
    __willBeSeeable : function()
    {
      var pa = this;

      // Any chance to cache this information in the parents?
      while(pa)
      {
        if (pa._root) {
          return true;
        }

        if (!pa._included || !pa._visible) {
          return false;
        }

        pa = pa.__parent;
      }

      return false;
    },


    /**
     * Generates a unique key for a listener configuration
     *
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {String} A unique ID for this configuration
     */
    __generateListenerId : function(type, listener, self, capture)
    {
      var reg = qx.core.ObjectRegistry;
      var id = "evt-" + type + "-" + reg.toHashCode(listener);

      if (self) {
        id += "-" + reg.toHashCode(self);
      }

      if (capture) {
        id += "-capture";
      }

      return id;
    },


    /**
     * Internal helper for all children addition needs
     *
     * @param child {var} the element to add
     * @throws an exception if the given element is already a child
     *     of this element
     */
    __addChildHelper : function(child)
    {
      if (child.__parent === this) {
        throw new Error("Child is already in: " + child);
      }

      if (child._root) {
        throw new Error("Root elements could not be inserted into other ones.");
      }

      // Remove from previous parent
      if (child.__parent) {
        child.__parent.remove(child);
      }

      // Convert to child of this object
      child.__parent = this;

      // Prepare array
      if (!this.__children) {
        this.__children = [];
      }

      // Schedule children update
      if (this._element) {
        this._scheduleChildrenUpdate();
      }
    },


    /**
     * Internal helper for all children removal needs
     *
     * @param child {qx.html.Element} the removed element
     * @throws an exception if the given element is not a child
     *     of this element
     */
    __removeChildHelper : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      // Schedule children update
      if (this._element) {
        this._scheduleChildrenUpdate();
      }

      // Remove reference to old parent
      delete child.__parent;
    },


    /**
     * Internal helper for all children move needs
     *
     * @param child {qx.html.Element} the moved element
     * @throws an exception if the given element is not a child
     *     of this element
     */
    __moveChildHelper : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      // Schedule children update
      if (this._element) {
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
    getChildren : function()
    {
      return this.__children || null;
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
      var children = this.__children;
      return children && children[index] || null;
    },


    /**
     * Returns whether the element has any child nodes
     *
     * @return {Boolean} Whether the element has any child nodes
     */
    hasChildren : function()
    {
      var children = this.__children;
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
      var children = this.__children;
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
      var children = this.__children;
      return children && children.indexOf(child) !== -1;
    },


    /**
     * Append all given children at the end of this element.
     *
     * @param varargs {qx.html.Element...} elements to insert
     * @return {qx.html.Element} this object (for chaining support)
     */
    add : function(varargs)
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
        this.__addChildHelper(varargs);
        this.__children.push(varargs);
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
      qx.lang.Array.insertAt(this.__children, child, index);

      // Chaining support
      return this;
    },


    /**
     * Removes all given children
     *
     * @param childs {qx.html.Element...} children to remove
     * @return {qx.html.Element} this object (for chaining support)
     */
    remove : function(childs)
    {
      var children = this.__children;
      if (!children) {
        return;
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
      var children = this.__children;
      if (!children) {
        throw new Error("Has no children!");
      }

      var child = children[index];
      if (!child) {
        throw new Error("Has no child at this position!");
      }

      this.__removeChildHelper(child);
      qx.lang.Array.removeAt(this.__children, index);

      // Chaining support
      return this;
    },


    /**
     * Remove all children from this element.
     *
     * @return
     */
    removeAll : function()
    {
      var children = this.__children;
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
      return this.__parent || null;
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
        parent.__children.push(this);
      } else {
        qx.lang.Array.insertAt(this.__children, this, index);
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
      var parent = rel.__parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertBefore(parent.__children, this, rel);

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
      var parent = rel.__parent;

      parent.__addChildHelper(this);
      qx.lang.Array.insertAfter(parent.__children, this, rel);

      return this;
    },


    /**
     * Move self to the given index in the current parent.
     *
     * @param index {Integer} the index (starts at 0 for the first child)
     * @return {qx.html.Element} this object (for chaining support)
     * @throws an exception when the given element is not child
     *      of this element.
     */
    moveTo : function(index)
    {
      var parent = this.__parent;

      parent.__moveChildHelper(this);

      var oldIndex = parent.__children.indexOf(this);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      } else if (oldIndex < index) {
        index--;
      }

      qx.lang.Array.removeAt(parent.__children, oldIndex);
      qx.lang.Array.insertAt(parent.__children, this, index);

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
      var parent = this.__parent;
      return this.moveTo(parent.__children.indexOf(rel));
    },


    /**
     * Move self after the given (related) child.
     *
     * @param rel {qx.html.Element} the related child
     * @return {qx.html.Element} this object (for chaining support)
     */
    moveAfter : function(rel)
    {
      var parent = this.__parent;
      return this.moveTo(parent.__children.indexOf(rel) + 1);
    },


    /**
     * Remove self from the current parent.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    free : function()
    {
      var parent = this.__parent;
      if (!parent) {
        throw new Error("Has no parent to remove from.");
      }

      if (!parent.__children) {
        return;
      }

      parent.__removeChildHelper(this);
      qx.lang.Array.remove(parent.__children, this);

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
     * @return {Element} The DOM element node
     */
    getDomElement : function() {
      return this._element || null;
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
     * Uses existing markup for this element. This is mainly used
     * to insert pre-built markup blocks into the element hierarchy.
     *
     * @param html {String} HTML markup with one root element
     *   which is used as the main element for this instance.
     * @return {Element} The created DOM element
     */
    useMarkup : function(html)
    {
      if (this._element) {
        throw new Error("Could not overwrite existing element!");
      }

      // Prepare extraction
      // We have a IE specific issue with "Unknown error" messages
      // when we try to use the same DOM node again. I am not sure
      // why this happens. Would be a good performance improvement,
      // but does not seem to work.
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        var helper = document.createElement("div");
      }
      else
      {
        var helper = qx.html.Element.__markupHelper;
        if (!helper) {
          helper = qx.html.Element.__markupHelper = document.createElement("div");
        }
      }

      // Extract first element
      helper.innerHTML = html;
      this._element = helper.firstChild;
      this._element.$$hash = this.$$hash;

      // Copy currently existing data over to element
      this._copyData(true);

      // Return element
      return this._element;
    },


    /**
     * Uses an existing element instead of creating one. This may be interesting
     * when the DOM element is directly needed to add content etc.
     *
     * @param elem {Element} Element to reuse
     */
    useElement : function(elem)
    {
      if (this._element) {
        throw new Error("Could not overwrite existing element!");
      }

      // Use incoming element
      this._element = elem;
      this._element.$$hash = this.$$hash;

      // Copy currently existing data over to element
      this._copyData(true);
    },


    /**
     * Whether the element is focusable (or will be when created)
     *
     * @return {Boolean} <code>true</code> when the element is focusable.
     */
    isFocusable : function()
    {
      var tabIndex = this.getAttribute("tabIndex");
      if (tabIndex >= 1) {
        return true;
      }

      var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;
      if (tabIndex >= 0 && focusable[this._nodeName]) {
        return true;
      }

      return false;
    },


    /**
     * Whether the element is natively focusable (or will be when created)
     *
     * This ignores the configured tabIndex.
     *
     * @return {Boolean} <code>true</code> when the element is focusable.
     */
    isNativelyFocusable : function() {
      return !!qx.event.handler.Focus.FOCUSABLE_ELEMENTS[this._nodeName];
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
     * @return {qx.html.Element} this object (for chaining support)
     */
    include : function()
    {
      if (this._included) {
        return;
      }

      delete this._included;

      if (this.__parent) {
        this.__parent._scheduleChildrenUpdate();
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
        return;
      }

      this._included = false;

      if (this.__parent) {
        this.__parent._scheduleChildrenUpdate();
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






    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Marks the element as visible which means that a previously applied
     * CSS style of display=none gets removed and the element will inserted
     * into the DOM, when this had not already happend before.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    show : function()
    {
      if (this._visible) {
        return;
      }

      if (this._element)
      {
        qx.html.Element._visibility[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      // Must be sure that the element gets included into the DOM.
      if (this.__parent) {
        this.__parent._scheduleChildrenUpdate();
      }

      delete this._visible;
    },


    /**
     * Marks the element as hidden which means it will kept in DOM (if it
     * is already there, but configured hidden using a CSS style of display=none).
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    hide : function()
    {
      if (!this._visible) {
        return;
      }

      if (this._element)
      {
        qx.html.Element._visibility[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      this._visible = false;
    },


    /**
     * Whether the element is visible.
     *
     * Please note: This does not control the visibility or parent inclusion recursively.
     *
     * @return {Boolean} Returns <code>true</code> when the element is configured
     *   to be visible.
     */
    isVisible : function() {
      return this._visible === true;
    },







    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the given child element into view. Only scrolls children.
     * Do not influence elements on top of this element.
     *
     * If the element is currently invisible it gets scrolled automatically
     * at the next time it is visible again (queued).
     *
     * @param elem {qx.html.Element} The element to scroll into the viewport.
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param direct {Boolean?true} Whether the execution should be made
     *   directly when possible
     */
    scrollChildIntoViewX : function(elem, align, direct)
    {
      var thisEl = this._element;
      var childEl = elem.getDomElement();

      if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth)
      {
        qx.bom.element.Scroll.intoViewX(childEl, thisEl, align);
      }
      else
      {
        this.__lazyScrollIntoViewX =
        {
          element : elem,
          align : align
        };

        qx.html.Element._scroll[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollX;
    },


    /**
     * Scrolls the given child element into view. Only scrolls children.
     * Do not influence elements on top of this element.
     *
     * If the element is currently invisible it gets scrolled automatically
     * at the next time it is visible again (queued).
     *
     * @param elem {qx.html.Element} The element to scroll into the viewport.
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param direct {Boolean?true} Whether the execution should be made
     *   directly when possible
     */
    scrollChildIntoViewY : function(elem, align, direct)
    {
      var thisEl = this._element;
      var childEl = elem.getDomElement();

      if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth)
      {
        qx.bom.element.Scroll.intoViewY(childEl, thisEl, align);
      }
      else
      {
        this.__lazyScrollIntoViewY =
        {
          element : elem,
          align : align
        };

        qx.html.Element._scroll[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollY;
    },


    /**
     * Scrolls the element to the given left position.
     *
     * @param x {Integer} Horizontal scroll position
     * @param lazy {Boolean?false} Whether the scrolling should be performed
     *    during element flush.
     * @return {void}
     */
    scrollToX : function(x, lazy)
    {
      var thisEl = this._element;
      if (lazy !== true && thisEl && thisEl.offsetWidth)
      {
        thisEl.scrollLeft = x;
      }
      else
      {
        this.__lazyScrollX = x;
        qx.html.Element._scroll[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollIntoViewX;
    },


    /**
     * Get the horizontal scroll position.
     *
     * @return {Integer} Horizontal scroll position
     */
    getScrollX : function()
    {
      var thisEl = this._element;
      if (thisEl) {
        return thisEl.scrollLeft;
      }

      return this.__lazyScrollX || 0;
    },


    /**
     * Scrolls the element to the given top position.
     *
     * @param y {Integer} Vertical scroll position
     * @param lazy {Boolean?false} Whether the scrolling should be performed
     *    during element flush.
     * @return {void}
     */
    scrollToY : function(y, lazy)
    {
      var thisEl = this._element;
      if (lazy !== true && thisEl && thisEl.offsetWidth)
      {
        thisEl.scrollTop = y;
      }
      else
      {
        this.__lazyScrollY = y;
        qx.html.Element._scroll[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollIntoViewY;
    },


    /**
     * Get the vertical scroll position.
     *
     * @return {Integer} Vertical scroll position
     */
    getScrollY : function()
    {
      var thisEl = this._element;
      if (thisEl) {
        return thisEl.scrollTop;
      }

      return this.__lazyScrollY || 0;
    },




    /*
    ---------------------------------------------------------------------------
      TEXT SELECTION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get the selection of the element.
     *
     * If the underlaying DOM element is not yet created, this methods returns
     * a null value.
     *
     * @return {String|null}
     */
    getSelection : function()
    {
      var el = this._element;
      if (el)
      {
        return qx.bom.Selection.get(el);
      }

      return null;
    },


    /**
     * Get the length of selection of the element.
     *
     * If the underlaying DOM element is not yet created, this methods returns
     * a null value.
     *
     * @return {Integer|null}
     */
    getSelectionLength : function()
    {
      var el = this._element;
      if (el)
      {
        return qx.bom.Selection.getLength(el);
      }

      return null;
    },


    /**
     * Set the selection of the element with the given start and end value.
     * If no end value is passed the selection will extend to the end.
     *
     * This method only works if the underlying DOM element is already created.
     *
     * @param start {Integer} start of the selection (zero based)
     * @param end {Integer} end of the selection
     * @return {void}
     */
    setSelection : function(start, end)
    {
      var el = this._element;
      if (el)
      {
        qx.bom.Selection.set(el, start, end);
      }
    },


    /**
     * Clears the selection of the element.
     *
     * This method only works if the underlying DOM element is already created.
     *
     * @return {void}
     */
    clearSelection : function()
    {
      var el = this._element;
      if (el)
      {
        qx.bom.Selection.clear(el);
      }
    },




    /*
    ---------------------------------------------------------------------------
      FOCUS/ACTIVATE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Focus this element.
     *
     * If the underlaying DOM element is not yet created, the
     * focus is queued for processing after the element creation.
     *
     * @return {void}
     */
    focus : function()
    {
      var el = this._element;
      if (el) {
        return qx.bom.Element.focus(el);
      }

      qx.html.Element._actions.focus = this;
      qx.html.Element._scheduleFlush("element");
    },


    /**
     * Mark this element to get blurred on the next flush of the queue
     *
     * @return {void}
     */
    blur : function()
    {
      var el = this._element;
      if (el) {
        qx.bom.Element.blur(el);
      }
    },


    /**
     * Mark this element to get activated on the next flush of the queue
     *
     * @return {void}
     */
    activate : function()
    {
      var el = this._element;
      if (el) {
        return qx.bom.Element.activate(el);
      }

      qx.html.Element._actions.activate = this;
      qx.html.Element._scheduleFlush("element");
    },


    /**
     * Mark this element to get deactivated on the next flush of the queue
     *
     * @return {void}
     */
    deactivate : function()
    {
      var el = this._element;
      if (el) {
        qx.bom.Element.deactivate(el);
      }
    },


    /**
     * Captures all mouse events to this element
     */
    capture : function()
    {
      var el = this._element;
      if (el) {
        return qx.bom.Element.capture(el);
      }

      qx.html.Element._actions.capture = this;
      qx.html.Element._scheduleFlush("element");
    },


    /**
     * Releases this element from a previous {@link #capture} call
     */
    releaseCapture : function()
    {
      var el = this._element;
      if (el) {
        qx.bom.Element.releaseCapture(el);
      }
    },





    /*
    ---------------------------------------------------------------------------
      STYLE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set up the given style attribute
     *
     * @param key {String} the name of the style attribute
     * @param value {var} the value
     * @param direct {Boolean?false} Whether the value should be applied
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setStyle : function(key, value, direct)
    {
      if (!this.__styleValues) {
        this.__styleValues = {};
      }

      if (this.__styleValues[key] == value) {
        return;
      }

      if (value == null) {
        delete this.__styleValues[key];
      } else {
        this.__styleValues[key] = value;
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._element)
      {
        // Omit queuing in direct mode
        if (direct)
        {
          qx.bom.element.Style.set(this._element, key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }

        // Store job info
        this.__styleJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      return this;
    },


    /**
     * Convenience method to modify a set of styles at once.
     *
     * @param map {Map} a map where the key is the name of the property
     *    and the value is the value to use.
     * @param direct {Boolean?false} Whether the values should be applied
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setStyles : function(map, direct)
    {
      for (var key in map) {
        this.setStyle(key, map[key], direct);
      }

      return this;
    },


    /**
     * Removes the given style attribute
     *
     * @param key {String} the name of the style attribute
     * @param direct {Boolean?false} Whether the value should be removed
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeStyle : function(key, direct) {
      this.setStyle(key, null, direct);
    },


    /**
     * Get the value of the given style attribute.
     *
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
     * @param key {String} the name of the attribute
     * @param value {var} the value
     * @param direct {Boolean?false} Whether the value should be applied
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setAttribute : function(key, value, direct)
    {
      if (!this.__attribValues) {
        this.__attribValues = {};
      }

      if (this.__attribValues[key] == value) {
        return;
      }

      if (value == null) {
        delete this.__attribValues[key];
      } else {
        this.__attribValues[key] = value;
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._element)
      {
        // Omit queuing in direct mode
        if (direct)
        {
          qx.bom.element.Attribute.set(this._element, key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }

        // Store job info
        this.__attribJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }

      return this;
    },


    /**
     * Convenience method to modify a set of attributes at once.
     *
     * @param map {Map} a map where the key is the name of the property
     *    and the value is the value to use.
     * @param direct {Boolean?false} Whether the values should be applied
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    setAttributes : function(map, direct)
    {
      for (var key in map) {
        this.setAttribute(key, map[key], direct);
      }

      return this;
    },


    /**
     * Removes the given attribute
     *
     * @param key {String} the name of the attribute
     * @param direct {Boolean?false} Whether the value should be removed
     *    directly (without queuing)
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeAttribute : function(key, direct) {
      this.setAttribute(key, null, direct);
    },


    /**
     * Get the value of the given attribute.
     *
     * @param key {String} name of the attribute
     * @return {var} the value of the attribute
     */
    getAttribute : function(key) {
      return this.__attribValues ? this.__attribValues[key] : null;
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
      if (!this.__propertyValues) {
        this.__propertyValues = {};
      }

      if (this.__propertyValues[key] == value) {
        return;
      }

      if (value == null) {
        delete this.__propertyValues[key];
      } else {
        this.__propertyValues[key] = value;
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._element)
      {
        // Omit queuing in direct mode
        if (direct)
        {
          this._applyProperty(key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this.__propertyJobs) {
          this.__propertyJobs = {};
        }

        // Store job info
        this.__propertyJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.$$hash] = this;
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
      this._setProperty(key, null, direct);
    },


    /**
     * Get the value of the given misc.
     *
     * @param key {String} name of the misc
     * @return {var} the value of the misc
     */
    _getProperty : function(key) {
      return this.__propertyValues ? this.__propertyValues[key] : null;
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
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    addListener : function(type, listener, self, capture)
    {
      if (this.isDisposed()) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg =
          "Failed to add event listener for type '"+ type +"'" +
          " to the target '" + this + "': ";

        this.assertString(type, msg + "Invalid event type.");
        this.assertFunction(listener, msg + "Invalid callback function");
        if (self !== undefined) {
          this.assertObject(self, "Invalid context for callback.")
        }
        if (capture !== undefined) {
          this.assertBoolean(capture, "Invalid capture falg.");
        }
      }

      if (this._element)
      {
        qx.event.Registration.addListener(this._element, type, listener, self, capture);
      }
      else
      {
        if (!this.__eventValues) {
          this.__eventValues = {};
        }

        var key = this.__generateListenerId(type, listener, self, capture);
        if (this.__eventValues[key])
        {
          this.warn("A listener of this configuration does already exist!");
          return false;
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
     * @param type {String} Name of the event
     * @param listener {Function} Function to execute on event
     * @param self {Object} Execution context of given function
     * @param capture {Boolean ? false} Whether capturing should be enabled
     * @return {qx.html.Element} this object (for chaining support)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (this.isDisposed()) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg =
          "Failed to dd event listener for type '"+ type +"'" +
          " to the target '" + this + "': ";

        this.assertString(type, msg + "Invalid event type.");
        this.assertFunction(listener, msg + "Invalid callback function");
        if (self !== undefined) {
          this.assertObject(self, "Invalid context for callback.")
        }
        if (capture !== undefined) {
          this.assertBoolean(capture, "Invalid capture falg.");
        }
      }

      if (this._element)
      {
        qx.event.Registration.removeListener(this._element, type, listener, self, capture);
      }
      else
      {
        var key = this.__generateListenerId(type, listener, self, capture);
        if (!this.__eventValues || !this.__eventValues[key])
        {
          this.warn("A listener of this configuration does not exist!");
          return false;
        }

        delete this.__eventValues[key];
      }

      return this;
    },


    hasListener : function(type, capture)
    {
      throw new Error("hasListener() needs implementation!");
    }
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush, statics);
  },





  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    var el = this._element;
    if (el)
    {
      qx.event.Registration.getManager(el).removeAllListeners(el);
      el.$$hash = "";
    }

    if (!qx.core.ObjectRegistry.inShutDown)
    {
      var parent = this.__parent;
      if (parent && !parent.$$disposed) {
        parent.remove(this);
      }
    }

    this._disposeArray("__children");
    this._disposeFields("__attribValues", "__styleValues", "__eventValues",
      "__propertyValues", "__attribJobs", "__styleJobs", "__propertyJobs",
      "_element", "__parent", "__lazyScrollIntoViewX", "__lazyScrollIntoViewY");
  }
});
