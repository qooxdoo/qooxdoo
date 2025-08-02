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

************************************************************************ */

/**
 * High-performance, high-level DOM element creation and management.
 *
 * Includes support for HTML and style attributes. Elements also have
 * got a powerful children and visibility management.
 *
 * Processes DOM insertion and modification with advanced logic
 * to reduce the real transactions.
 *
 * From the view of the parent you can use the following children management
 * methods:
 * {@link #getChildren}, {@link #indexOf}, {@link #hasChild}, {@link #add},
 * {@link #addAt}, {@link #remove}, {@link #removeAt}, {@link #removeAll}
 *
 * Each child itself also has got some powerful methods to control its
 * position:
 * {@link #getParent}, {@link #free},
 * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
 * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 * NOTE:: This class used to require `qx.module.Animation` but that brings in a huge
 * list of dependencies, so the require has been moved to the `qx.application.AbstractGui`
 * class
 */
qx.Class.define("qx.html.Element", {
  extend: qx.html.Node,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Element
   *
   * @param tagName {String?"div"} Tag name of the element to create
   * @param styles {Map?null} optional map of CSS styles, where the key is the name
   *    of the style and the value is the value to use.
   * @param attributes {Map?null} optional map of element attributes, where the
   *    key is the name of the attribute and the value is the value to use.
   */
  construct(tagName, styles, attributes) {
    super(tagName || "div");

    this.__styleValues = styles || null;
    this.__attribValues = attributes || null;
    this.__slots = new Map();

    if (attributes) {
      for (var key in attributes) {
        if (!key) {
          throw new Error("Invalid unnamed attribute in " + this.classname);
        }
      }
    }
    this.initCssClass();

    this.registerProperty(
      "innerHtml",
      null,
      function (value) {
        if (this._domNode) {
          this._domNode.innerHTML = value;
        }
      },
      (serializer, property, name) => {
        serializer.rawTextInBody(property.value);
      }
    );
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /*
    ---------------------------------------------------------------------------
      STATIC DATA
    ---------------------------------------------------------------------------
    */

    /** @type {Boolean} If debugging should be enabled */
    DEBUG: false,

    /** @type {Integer} number of roots */
    _hasRoots: 0,

    /** @type {Element} the default root to use */
    _defaultRoot: null,

    /** @type {Map} Contains the modified {@link qx.html.Element}s. The key is the hash code. */
    _modified: {},

    /** @type {Map} Contains the {@link qx.html.Element}s which should get hidden or visible at the next flush. The key is the hash code. */
    _visibility: {},

    /** @type {Map} Contains the {@link qx.html.Element}s which should scrolled at the next flush */
    _scroll: {},

    /** @type {Array} List of post actions for elements. The key is the action name. The value the {@link qx.html.Element}. */
    _actions: [],

    /**  @type {Map} List of all selections. */
    __selection: {},

    __focusHandler: null,

    __mouseCapture: null,

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
    _scheduleFlush(job) {
      qx.html.Element.__deferredCall.schedule();
    },

    /**
     * Flush the global modified list
     */
    flush() {
      var obj;

      if (qx.core.Environment.get("qx.debug")) {
        if (this.DEBUG) {
          qx.log.Logger.debug(this, "Flushing elements...");
        }
      }

      if (!qx.core.Environment.get("qx.headless")) {
        // blur elements, which will be removed
        var focusHandler = this.__getFocusHandler();
        var focusedDomElement = focusHandler.getFocus();
        if (
          focusedDomElement &&
          this.__willBecomeInvisible(focusedDomElement)
        ) {
          focusHandler.blur(focusedDomElement);
        }

        // deactivate elements, which will be removed
        var activeDomElement = focusHandler.getActive();
        if (activeDomElement && this.__willBecomeInvisible(activeDomElement)) {
          qx.bom.Element.deactivate(activeDomElement);
        }

        // release capture for elements, which will be removed
        var captureDomElement = this.__getCaptureElement();
        if (
          captureDomElement &&
          this.__willBecomeInvisible(captureDomElement)
        ) {
          qx.bom.Element.releaseCapture(captureDomElement);
        }
      }

      var later = [];
      var modified = qx.html.Element._modified;

      for (var hc in modified) {
        obj = modified[hc];
        // Ignore all hidden elements except iframes
        // but keep them until they get visible (again)
        if (obj._willBeSeeable() || obj.classname == "qx.html.Iframe") {
          // Separately queue rendered elements
          if (obj._domNode && qx.dom.Hierarchy.isRendered(obj._domNode)) {
            later.push(obj);
          }

          // Flush invisible elements first
          else {
            if (qx.core.Environment.get("qx.debug")) {
              if (this.DEBUG) {
                obj.debug("Flush invisible element");
              }
            }

            obj.flush();
          }

          // Cleanup modification list
          delete modified[hc];
        }
      }

      for (var i = 0, l = later.length; i < l; i++) {
        obj = later[i];

        if (qx.core.Environment.get("qx.debug")) {
          if (this.DEBUG) {
            obj.debug("Flush rendered element");
          }
        }

        obj.flush();
      }

      // Process visibility list
      var visibility = this._visibility;

      for (var hc in visibility) {
        obj = visibility[hc];

        var element = obj._domNode;
        if (!element) {
          delete visibility[hc];
          continue;
        }

        if (qx.core.Environment.get("qx.debug")) {
          if (this.DEBUG) {
            qx.log.Logger.debug(
              this,
              "Switching visibility to: " + obj.isVisible()
            );
          }
        }

        // hiding or showing an object and deleting it right after that may
        // cause an disposed object in the visibility queue [BUG #3607]
        if (!obj.$$disposed) {
          element.style.display = obj.isVisible() ? "" : "none";
          // also hide the element (fixed some rendering problem in IE<8 & IE8 quirks)
          if (qx.core.Environment.get("engine.name") == "mshtml") {
            if (!(document.documentMode >= 8)) {
              element.style.visibility = obj.isVisible() ? "visible" : "hidden";
            }
          }
        }

        delete visibility[hc];
      }

      if (!qx.core.Environment.get("qx.headless")) {
        // Process scroll list
        var scroll = this._scroll;
        for (var hc in scroll) {
          obj = scroll[hc];
          var elem = obj._domNode;

          if (elem && elem.offsetWidth) {
            var done = true;

            // ScrollToX
            if (obj.__lazyScrollX != null) {
              obj._domNode.scrollLeft = obj.__lazyScrollX;
              delete obj.__lazyScrollX;
            }

            // ScrollToY
            if (obj.__lazyScrollY != null) {
              obj._domNode.scrollTop = obj.__lazyScrollY;
              delete obj.__lazyScrollY;
            }

            // ScrollIntoViewX
            var intoViewX = obj.__lazyScrollIntoViewX;
            if (intoViewX != null) {
              var child = intoViewX.element.getDomElement();

              if (child && child.offsetWidth) {
                qx.bom.element.Scroll.intoViewX(child, elem, intoViewX.align);
                delete obj.__lazyScrollIntoViewX;
              } else {
                done = false;
              }
            }

            // ScrollIntoViewY
            var intoViewY = obj.__lazyScrollIntoViewY;
            if (intoViewY != null) {
              var child = intoViewY.element.getDomElement();

              if (child && child.offsetWidth) {
                qx.bom.element.Scroll.intoViewY(child, elem, intoViewY.align);
                delete obj.__lazyScrollIntoViewY;
              } else {
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

        var activityEndActions = {
          releaseCapture: 1,
          blur: 1,
          deactivate: 1
        };

        // Process action list
        for (var i = 0; i < this._actions.length; i++) {
          var action = this._actions[i];
          var element = action.element._domNode;
          if (
            !element ||
            (!activityEndActions[action.type] &&
              !action.element._willBeSeeable())
          ) {
            continue;
          }
          var args = action.args;
          args.unshift(element);
          qx.bom.Element[action.type].apply(qx.bom.Element, args);
        }
        this._actions = [];
      }

      // Process selection
      for (var hc in this.__selection) {
        var selection = this.__selection[hc];
        var elem = selection.element._domNode;
        if (elem) {
          qx.bom.Selection.set(elem, selection.start, selection.end);
          delete this.__selection[hc];
        }
      }

      // Fire appear/disappear events
      qx.event.handler.Appear.refresh();
    },

    /**
     * Get the focus handler
     *
     * @return {qx.event.handler.Focus} The focus handler
     */
    __getFocusHandler() {
      if (!qx.core.Environment.get("qx.headless")) {
        if (!this.__focusHandler) {
          var eventManager = qx.event.Registration.getManager(window);
          this.__focusHandler = eventManager.getHandler(qx.event.handler.Focus);
        }
        return this.__focusHandler;
      } else {
        throw new Error(
          "Unexpected use of qx.html.Element.__getFocusHandler in headless environment"
        );
      }
    },

    /**
     * Get the mouse capture element
     *
     * @return {Element} The mouse capture DOM element
     */
    __getCaptureElement() {
      if (!qx.core.Environment.get("qx.headless")) {
        if (!this.__mouseCapture) {
          var eventManager = qx.event.Registration.getManager(window);
          this.__mouseCapture = eventManager.getDispatcher(
            qx.event.dispatch.MouseCapture
          );
        }
        return this.__mouseCapture.getCaptureElement();
      } else {
        throw new Error(
          "Unexpected use of qx.html.Element.__getCaptureElement in headless environment"
        );
      }
    },

    /**
     * Whether the given DOM element will become invisible after the flush
     *
     * @param domElement {Element} The DOM element to check
     * @return {Boolean} Whether the element will become invisible
     */
    __willBecomeInvisible(domElement) {
      var element = this.fromDomElement(domElement);
      return element && !element._willBeSeeable();
    },

    /**
     * Finds the Widget for a given DOM element
     *
     * @param domElement {Node} the DOM element
     * @return {qx.ui.core.Widget} the Widget that created the DOM element
     * @deprecated {6.1} see qx.html.Node.fromDomNode
     */
    fromDomElement(domElement) {
      return qx.html.Node.fromDomNode(domElement);
    },

    /**
     * Sets the default Root element
     *
     * @param root {Element} the new default root
     */
    setDefaultRoot(root) {
      if (qx.core.Environment.get("qx.debug")) {
        if (this._defaultRoot && root) {
          qx.log.Logger.warn(
            qx.html.Element,
            "Changing default root, from " + this._defaultRoot + " to " + root
          );
        }
      }
      this._defaultRoot = root;
    },

    /**
     * Returns the default root
     *
     * @return {Element} the default root
     */
    getDefaultRoot() {
      return this._defaultRoot;
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * @type{String} The primary CSS class for this element
     *
     * The implementation will add and remove this class from the list of classes,
     * this property is provided as a means to easily set the primary class.  Because
     * SCSS supports inheritance, it's more useful to be able to allow the SCSS
     * definition to control the inheritance hierarchy of classes.
     *
     * For example, a dialog could be implemented in code as a Dialog class derived from
     * a Window class, but the presentation may be so different that the theme author
     * would choose to not use inheritance at all.
     */
    cssClass: {
      init: null,
      nullable: true,
      check: "String",
      apply: "_applyCssClass"
    },

    /**
     * Used by the {@link qx.html.Slot}-related mechanisms to determine if an
     * element is the top-level of a custom tag function.
     */
    isCustomElement: {
      init: false,
      check: "Boolean",
      apply: "_applyIsCustomElement"
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

    /** @type {Boolean} Marker for always visible root nodes (often the body node) */
    __root: false,

    __lazyScrollIntoViewX: null,
    __lazyScrollIntoViewY: null,

    __lazyScrollX: null,
    __lazyScrollY: null,

    __styleJobs: null,
    __attribJobs: null,

    __styleValues: null,
    __attribValues: null,

    /**
     * This is a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | Map},
     * not a POJO
     * @type {Map<string, qx.html.Slot>}
     */
    __slots: null,

    /*
     * @Override
     */
    _createDomElement() {
      return qx.dom.Element.create(this._nodeName);
    },

    /*
     * @Override
     */
    _serializeImpl(serializer) {
      serializer.openTag(this._nodeName);
      serializer.pushQxObject(this);

      // Copy attributes
      if (this.__attribValues) {
        for (var key in this.__attribValues) {
          let result = qx.bom.element.Attribute.serialize(
            key,
            this.__attribValues[key]
          );

          for (let key in result) {
            if (key != "data-qx-object-id") {
              serializer.setAttribute(key, result[key]);
            }
          }
        }
      }

      let id = serializer.getQxObjectIdFor(this);
      if (id) {
        serializer.setAttribute("data-qx-object-id", `"${id}"`);
      }

      // Copy styles
      var data = this.__styleValues || {};
      if (!this.isVisible()) {
        data = qx.lang.Object.clone(data);
        data.display = "none";
      }
      if (Object.keys(data).length) {
        var Style = qx.bom.element.Style;
        var css = Style.compile(data);
        if (css) {
          serializer.setAttribute("style", `"${css}"`);
        }
      }

      // Copy properties
      var data = this._properties;
      if (data) {
        for (var key in this._properties) {
          let property = this._properties[key];
          if (property.serialize) {
            property.serialize.call(this, serializer, key, property);
          } else if (property.value !== undefined && property.value !== null) {
            let value = JSON.stringify(property.value);
            serializer.setAttribute(key, value);
          }
        }
      }

      // Children
      if (this._children) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._serializeImpl(serializer);
        }
      }
      serializer.closeTag();
      serializer.popQxObject(this);
    },

    /**
     * Connects a widget to this element, and to the DOM element in this Element.  They
     * remain associated until disposed or disconnectWidget is called
     *
     * @param widget {qx.ui.core.Widget} the widget to associate
     * @deprecated {6.1} see connectObject
     */
    connectWidget(widget) {
      return this.connectObject(widget);
    },

    /**
     * Disconnects a widget from this element and the DOM element.  The DOM element remains
     * untouched, except that it can no longer be used to find the Widget.
     *
     * @param qxObject {qx.core.Object} the Widget
     * @deprecated {6.1} see disconnectObject
     */
    disconnectWidget(widget) {
      return this.disconnectObject(widget);
    },

    /*
     * @Override
     */
    _addChildImpl(child) {
      if (this.getIsCustomElement()) {
        throw new Error(
          `Cannot add children to Custom Elements! (use ${this.classname}.inject and <slot> tags instead)`
        );
      }

      super._addChildImpl(child);
      this.__childrenHaveChanged = true;
    },

    /*
     * @Override
     */
    _removeChildImpl(child) {
      if (this.getIsCustomElement()) {
        throw new Error(`Cannot remove children from Custom Elements!`);
      }

      super._removeChildImpl(child);
      this.__childrenHaveChanged = true;
    },

    /**
     * Works out the object ID to use on an actual DOM node
     *
     * @returns {String}
     */
    _getApplicableQxObjectId() {
      if (qx.core.Environment.get("module.objectid")) {
        let target = this.getQxObjectId() ? this : this._qxObject;
        let id = target ? qx.core.Id.getAbsoluteIdOf(target, true) : null;
        return id;
      } else {
        throw new Error(
          "Cannot get qxObjectId because module.objectid is false"
        );
      }
    },

    /*
    ---------------------------------------------------------------------------
      SLOTS API
    ---------------------------------------------------------------------------
    */

    /**
     * Retrieve the slots this element contains.
     * The Map returned is a copy of the internal Map, as such modifications to
     * it will not effect the element.
     * @returns {Map<string, qx.html.Slot>} A `Map` of slots, keyed by slot name. The default slot, if it exists, is keyed as `qx.html.Slot.DEFAULT`
     */
    getSlots() {
      if (!this.getIsCustomElement()) {
        return null;
      }
      return new Map(this.__slots);
    },

    /**
     * Returns whether the element has slot(s) matching the given projection.
     *
     * @param projection {true | String?} `true` to check for the default slot, a string to check for a slot with the given name, or `null|undefined` to check for any slot(s)
     * @return {Boolean} Indicates whether the projected slot exists, or if any slots exist if no projection was specified
     * @example
     * ```js
     * myNode.hasSlots();             // `true` if there are any slots                 `false` if there are none
     * myNode.hasSlots(true);         // `true` if there is a default (unnamed) slot   `false` if there is not
     * myNode.hasSlots("mySlotName"); // `true` if there is a slot named `mySlotName`  `false` if there is not
     * ```
     */
    hasSlots(projection) {
      if (projection === null || projection === undefined) {
        return this.__slots.size > 0;
      }

      if (projection === true || projection === qx.html.Slot.DEFAULT) {
        return this.__slots.has(qx.html.Slot.DEFAULT);
      }

      if (typeof projection === "string") {
        return this.__slots.has(projection);
      }

      throw new Error(
        `Cannot lookup slot for projection: ${JSON.stringify(
          projection
        )} ! (expected: string, true, or null/undefined)`
      );
    },

    /**
     * Provides devtime debugging assistance for invalid slot usage.
     * @return {Boolean} `false` if no such slot, `true` otherwise
     */
    __injectionSlotCheck(slotName) {
      if (!this.hasSlots(slotName)) {
        if (qx.core.Environment.get("qx.debug")) {
          const what =
            slotName === qx.html.Slot.DEFAULT
              ? "default slot"
              : `slot named "${slotName}"`;
          const slotsList = Array.from(this.__slots.keys())
            .join(", ")
            .replace(qx.html.Slot.DEFAULT, "(default)");
          console.warn(`No ${what} found! Available slots are: ${slotsList}`);
        }
        return false;
      }
      return true;
    },

    /**
     * Inject a child into a slot descendant of this element.
     *
     * @param childNode {qx.html.Element} element to insert. Use a fragment to inject many elements.
     * @param slotNameOverride {String?} name of the slot to inject into. If not provided, the slot name will be read from the `slot` attribute of `childNode`. This may be useful when injecting fragments.
     * @return {this} this object (for chaining support)
     *
     * @example
     * ```js
     * myElem.inject(<p>Hello World</p>);                   // inject one child to the default slot
     * myElem.inject(<p slot="mySlotName">Hello World</p>); // inject one child to the slot named "mySlotName" (declarative syntax)
     * myElem.inject(<p>Hello World</p>, "mySlotName");     // inject one child to the slot named "mySlotName" (functional syntax)
     * myElem.inject((
     *   <>
     *     <p>Hello World</p>
     *     <p>Hello Qooxdoo</p>
     *   </>
     * ), "mySlotName");                                    // inject a fragment of children to the slot named "mySlotName"
     *
     * ```
     */
    inject(childNode, slotNameOverride) {
      const slotName =
        childNode.getAttribute?.("slot") ??
        slotNameOverride ??
        qx.html.Slot.DEFAULT;

      if (!this.__injectionSlotCheck(slotName)) {
        return;
      }

      this.__slots.get(slotName).add(childNode);

      // Chaining support
      return this;
    },

    __slotScan(element) {
      // recursively iterate children. if any are instanceof qx.html.Slot, append to local slots, if any are `.getIscustomElement() === true`, do not look at their children
      const slots = [];

      if (element.getIsCustomElement?.()) {
        return slots;
      }

      if (element instanceof qx.html.Slot) {
        slots.push(element);
      }

      element
        .getChildren()
        ?.forEach(child => slots.push(...this.__slotScan(child)));

      return slots;
    },

    _slotScanAdd(element) {
      for (const slot of this.__slotScan(element)) {
        this.__slots.set(slot.getName(), slot);
      }
    },

    _slotScanRemove(child) {
      for (const slot of this.__slotScan(child)) {
        this.__slots.delete(slot.getName());
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
     */
    _copyData(fromMarkup, propertiesFromDom) {
      super._copyData(fromMarkup, propertiesFromDom);
      var elem = this._domNode;

      // Copy attributes
      var data = this.__attribValues;
      var Attribute = qx.bom.element.Attribute;
      if (data) {
        if (fromMarkup) {
          var str;
          let classes = {};
          str = this.getAttribute("class");
          (str ? str.split(" ") : []).forEach(name => {
            if (name.startsWith("qx-")) {
              classes[name] = true;
            }
          });

          str = Attribute.get(elem, "class");
          if (!qx.core.Environment.get("qx.headless")) {
            if (str instanceof window.SVGAnimatedString) {
              str = str.baseVal;
            }
          }
          (str ? str.split(" ") : []).forEach(name => (classes[name] = true));
          classes = Object.keys(classes);

          var segs = classes;
          if (segs.length) {
            this.setCssClass(segs[0]);
            this.setAttribute("class", classes.join(" "));
          } else {
            this.setCssClass(null);
            this.setAttribute("class", null);
          }
        }
        for (var key in data) {
          Attribute.set(elem, key, data[key]);
        }
      }

      Attribute.set(elem, "data-qx-object-id", this._getApplicableQxObjectId());

      // Copy styles
      var data = this.__styleValues;
      if (data) {
        var Style = qx.bom.element.Style;

        if (fromMarkup) {
          Style.setStyles(elem, data);
        } else {
          // Set styles at once which is a lot faster in most browsers
          // compared to separate modifications of many single style properties.
          Style.setCss(elem, Style.compile(data));
        }
      }

      // Copy visibility
      if (!fromMarkup) {
        var display = elem.style.display || "";
        if (display == "" && !this.isVisible()) {
          elem.style.display = "none";
        } else if (display == "none" && this.isVisible()) {
          elem.style.display = "";
        }
      } else {
        var display = elem.style.display || "";
        this.setVisible(display != "none");
      }
    },

    /**
     * Synchronizes data between the internal representation and the DOM. This
     * is the counterpart of {@link #_copyData} and is used for further updates
     * after the element has been created.
     *
     */
    _syncData() {
      super._syncData();
      var elem = this._domNode;

      var Attribute = qx.bom.element.Attribute;
      var Style = qx.bom.element.Style;

      // Sync attributes
      var jobs = this.__attribJobs;
      if (jobs) {
        var data = this.__attribValues;
        if (data) {
          var value;
          for (var key in jobs) {
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
      if (jobs) {
        var data = this.__styleValues;
        if (data) {
          var styles = {};
          for (var key in jobs) {
            styles[key] = data[key];
          }

          Style.setStyles(elem, styles);
        }

        this.__styleJobs = null;
      }
    },

    /*
    ---------------------------------------------------------------------------
      DOM ELEMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the element's root flag, which indicates
     * whether the element should be a root element or not.
     * @param root {Boolean} The root flag.
     */
    setRoot(root) {
      if (root && !this.__root) {
        qx.html.Element._hasRoots++;
      } else if (!root && this.__root) {
        qx.html.Element._hasRoots--;
      }
      this.__root = root;
    },

    /*
     * @Override
     */
    isRoot() {
      return this.__root;
    },

    /**
     * Uses existing markup for this element. This is mainly used
     * to insert pre-built markup blocks into the element hierarchy.
     *
     * @param html {String} HTML markup with one root element
     *   which is used as the main element for this instance.
     * @return {Element} The created DOM element
     */
    useMarkup(html) {
      if (this._domNode) {
        throw new Error("Could not overwrite existing element!");
      }

      // Prepare extraction
      // We have a IE specific issue with "Unknown error" messages
      // when we try to use the same DOM node again. I am not sure
      // why this happens. Would be a good performance improvement,
      // but does not seem to work.
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        var helper = document.createElement("div");
      } else {
        var helper = qx.dom.Element.getHelperElement();
      }

      // Extract first element
      helper.innerHTML = html;
      this.useNode(helper.firstChild);

      return this._domNode;
    },

    /**
     * Whether the element is focusable (or will be when created)
     *
     * @return {Boolean} <code>true</code> when the element is focusable.
     */
    isFocusable() {
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
     * Set whether the element is selectable. It uses the qooxdoo attribute
     * qxSelectable with the values 'on' or 'off'.
     * In webkit, a special css property will be used (-webkit-user-select).
     *
     * @param value {Boolean} True, if the element should be selectable.
     */
    setSelectable(value) {
      this.setAttribute("qxSelectable", value ? "on" : "off");
      var userSelect = qx.core.Environment.get("css.userselect");
      if (userSelect) {
        this.setStyle(
          userSelect,
          value ? "text" : qx.core.Environment.get("css.userselect.none")
        );
      }
    },

    /**
     * Whether the element is natively focusable (or will be when created)
     *
     * This ignores the configured tabIndex.
     *
     * @return {Boolean} <code>true</code> when the element is focusable.
     */
    isNativelyFocusable() {
      return !!qx.event.handler.Focus.FOCUSABLE_ELEMENTS[this._nodeName];
    },

    /*
    ---------------------------------------------------------------------------
      ANIMATION SUPPORT
    ---------------------------------------------------------------------------
    */
    /**
     * Fades in the element.
     * @param duration {Number} Time in ms.
     * @return {qx.bom.element.AnimationHandle} The animation handle to react for
     *   the fade animation.
     */
    fadeIn(duration) {
      var col = qxWeb(this._domNode);
      if (col.isPlaying()) {
        col.stop();
      }
      // create the element right away
      if (!this._domNode) {
        this.flush();
        col.push(this._domNode);
      }
      if (this._domNode) {
        col.fadeIn(duration).once(
          "animationEnd",
          function () {
            this.show();
            qx.html.Element.flush();
          },
          this
        );

        return col.getAnimationHandles()[0];
      }
    },

    /**
     * Fades out the element.
     * @param duration {Number} Time in ms.
     * @return {qx.bom.element.AnimationHandle} The animation handle to react for
     *   the fade animation.
     */
    fadeOut(duration) {
      var col = qxWeb(this._domNode);
      if (col.isPlaying()) {
        col.stop();
      }

      if (this._domNode) {
        col.fadeOut(duration).once(
          "animationEnd",
          function () {
            this.hide();
            qx.html.Element.flush();
          },
          this
        );

        return col.getAnimationHandles()[0];
      }
    },

    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT
    ---------------------------------------------------------------------------
    */

    /*
     * @Override
     */
    _applyVisible(value, oldValue) {
      super._applyVisible(value, oldValue);
      if (value) {
        if (this._domNode) {
          qx.html.Element._visibility[this.toHashCode()] = this;
          qx.html.Element._scheduleFlush("element");
        }

        // Must be sure that the element gets included into the DOM.
        if (this._parent) {
          this._parent._scheduleChildrenUpdate();
        }
      } else {
        if (this._domNode) {
          qx.html.Element._visibility[this.toHashCode()] = this;
          qx.html.Element._scheduleFlush("element");
        }
      }
    },

    /**
     * Marks the element as visible which means that a previously applied
     * CSS style of display=none gets removed and the element will inserted
     * into the DOM, when this had not already happened before.
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    show() {
      this.setVisible(true);
      return this;
    },

    /**
     * Marks the element as hidden which means it will kept in DOM (if it
     * is already there, but configured hidden using a CSS style of display=none).
     *
     * @return {qx.html.Element} this object (for chaining support)
     */
    hide() {
      this.setVisible(false);
      return this;
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
    scrollChildIntoViewX(elem, align, direct) {
      var thisEl = this._domNode;
      var childEl = elem.getDomElement();

      if (
        direct !== false &&
        thisEl &&
        thisEl.offsetWidth &&
        childEl &&
        childEl.offsetWidth
      ) {
        qx.bom.element.Scroll.intoViewX(childEl, thisEl, align);
      } else {
        this.__lazyScrollIntoViewX = {
          element: elem,
          align: align
        };

        qx.html.Element._scroll[this.toHashCode()] = this;
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
    scrollChildIntoViewY(elem, align, direct) {
      var thisEl = this._domNode;
      var childEl = elem.getDomElement();

      if (
        direct !== false &&
        thisEl &&
        thisEl.offsetWidth &&
        childEl &&
        childEl.offsetWidth
      ) {
        qx.bom.element.Scroll.intoViewY(childEl, thisEl, align);
      } else {
        this.__lazyScrollIntoViewY = {
          element: elem,
          align: align
        };

        qx.html.Element._scroll[this.toHashCode()] = this;
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
     */
    scrollToX(x, lazy) {
      var thisEl = this._domNode;
      if (lazy !== true && thisEl && thisEl.offsetWidth) {
        thisEl.scrollLeft = x;
        delete this.__lazyScrollX;
      } else {
        this.__lazyScrollX = x;
        qx.html.Element._scroll[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollIntoViewX;
    },

    /**
     * Get the horizontal scroll position.
     *
     * @return {Integer} Horizontal scroll position
     */
    getScrollX() {
      var thisEl = this._domNode;
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
     */
    scrollToY(y, lazy) {
      var thisEl = this._domNode;
      if (lazy !== true && thisEl && thisEl.offsetWidth) {
        thisEl.scrollTop = y;
        delete this.__lazyScrollY;
      } else {
        this.__lazyScrollY = y;
        qx.html.Element._scroll[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      }

      delete this.__lazyScrollIntoViewY;
    },

    /**
     * Get the vertical scroll position.
     *
     * @return {Integer} Vertical scroll position
     */
    getScrollY() {
      var thisEl = this._domNode;
      if (thisEl) {
        return thisEl.scrollTop;
      }

      return this.__lazyScrollY || 0;
    },

    /**
     * Disables browser-native scrolling
     */
    disableScrolling() {
      this.enableScrolling();
      this.scrollToX(0);
      this.scrollToY(0);
      this.addListener("scroll", this.__onScroll, this);
    },

    /**
     * Re-enables browser-native scrolling
     */
    enableScrolling() {
      this.removeListener("scroll", this.__onScroll, this);
    },

    __inScroll: null,

    /**
     * Handler for the scroll-event
     *
     * @param e {qx.event.type.Native} scroll-event
     */
    __onScroll(e) {
      if (!this.__inScroll) {
        this.__inScroll = true;
        this._domNode.scrollTop = 0;
        this._domNode.scrollLeft = 0;
        delete this.__inScroll;
      }
    },

    /*
    ---------------------------------------------------------------------------
      TEXT SUPPORT
    ---------------------------------------------------------------------------
    */

    /*
     * Sets the text value of this element; it will delete children first, except
     * for the first node which (if it is a Text node) will have it's value updated
     *
     * @param value {String} the text to set
     */
    setText(value) {
      var self = this;
      var children = this._children ? qx.lang.Array.clone(this._children) : [];
      if (children[0] instanceof qx.html.Text) {
        children[0].setText(value);
        children.shift();
        children.forEach(function (child) {
          self.remove(child);
        });
      } else {
        children.forEach(function (child) {
          self.remove(child);
        });
        this.add(new qx.html.Text(value));
      }
    },

    /**
     * Returns the text value, accumulated from all child nodes
     *
     * @return {String} the text value
     */
    getText() {
      var result = [];
      if (this._children) {
        this._children.forEach(function (child) {
          result.push(child.getText());
        });
      }
      return result.join("");
    },

    /**
     * Get the selection of the element.
     *
     * If the underlaying DOM element is not yet created, this methods returns
     * a null value.
     *
     * @return {String|null}
     */
    getTextSelection() {
      var el = this._domNode;
      if (el) {
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
    getTextSelectionLength() {
      var el = this._domNode;
      if (el) {
        return qx.bom.Selection.getLength(el);
      }

      return null;
    },

    /**
     * Get the start of the selection of the element.
     *
     * If the underlaying DOM element is not yet created, this methods returns
     * a null value.
     *
     * @return {Integer|null}
     */
    getTextSelectionStart() {
      var el = this._domNode;
      if (el) {
        return qx.bom.Selection.getStart(el);
      }

      return null;
    },

    /**
     * Get the end of the selection of the element.
     *
     * If the underlaying DOM element is not yet created, this methods returns
     * a null value.
     *
     * @return {Integer|null}
     */
    getTextSelectionEnd() {
      var el = this._domNode;
      if (el) {
        return qx.bom.Selection.getEnd(el);
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
     */
    setTextSelection(start, end) {
      var el = this._domNode;
      if (el) {
        qx.bom.Selection.set(el, start, end);
        return;
      }

      // if element not created, save the selection for flushing
      qx.html.Element.__selection[this.toHashCode()] = {
        element: this,
        start: start,
        end: end
      };

      qx.html.Element._scheduleFlush("element");
    },

    /**
     * Clears the selection of the element.
     *
     * This method only works if the underlying DOM element is already created.
     *
     */
    clearTextSelection() {
      var el = this._domNode;
      if (el) {
        qx.bom.Selection.clear(el);
      }
      delete qx.html.Element.__selection[this.toHashCode()];
    },

    /*
    ---------------------------------------------------------------------------
      FOCUS/ACTIVATE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Takes the action to process as argument and queues this action if the
     * underlying DOM element is not yet created.
     *
     * Note that "actions" are functions in `qx.bom.Element` and only apply to
     * environments with a user interface.  This will throw an error if the user
     * interface is headless
     *
     * @param action {String} action to queue
     * @param args {Array} optional list of arguments for the action
     */
    __performAction(action, args) {
      if (!qx.core.Environment.get("qx.headless")) {
        var actions = qx.html.Element._actions;

        actions.push({
          type: action,
          element: this,
          args: args || []
        });

        qx.html.Element._scheduleFlush("element");
      } else {
        throw new Error(
          "Unexpected use of qx.html.Element.__performAction in headles environment"
        );
      }
    },

    /**
     * Focus this element.
     *
     * If the underlaying DOM element is not yet created, the
     * focus is queued for processing after the element creation.
     *
     * Silently does nothing when in a headless environment
     */
    focus() {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("focus");
      }
    },

    /**
     * Mark this element to get blurred on the next flush of the queue
     *
     * Silently does nothing when in a headless environment
     *
     */
    blur() {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("blur");
      }
    },

    /**
     * Mark this element to get activated on the next flush of the queue
     *
     * Silently does nothing when in a headless environment
     *
     */
    activate() {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("activate");
      }
    },

    /**
     * Mark this element to get deactivated on the next flush of the queue
     *
     * Silently does nothing when in a headless environment
     *
     */
    deactivate() {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("deactivate");
      }
    },

    /**
     * Captures all mouse events to this element
     *
     * Silently does nothing when in a headless environment
     *
     * @param containerCapture {Boolean?true} If true all events originating in
     *   the container are captured. If false events originating in the container
     *   are not captured.
     */
    capture(containerCapture) {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("capture", [containerCapture !== false]);
      }
    },

    /**
     * Releases this element from a previous {@link #capture} call
     *
     * Silently does nothing when in a headless environment
     */
    releaseCapture() {
      if (!qx.core.Environment.get("qx.headless")) {
        this.__performAction("releaseCapture");
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
    setStyle(key, value, direct) {
      if (!this.__styleValues) {
        this.__styleValues = {};
      }

      if (this.__styleValues[key] == value) {
        return this;
      }

      this._applyStyle(key, value, this.__styleValues[key]);
      if (value == null) {
        delete this.__styleValues[key];
      } else {
        this.__styleValues[key] = value;
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._domNode) {
        // Omit queuing in direct mode
        if (direct) {
          qx.bom.element.Style.set(this._domNode, key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }

        // Store job info
        this.__styleJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      }

      return this;
    },

    /**
     * Called by setStyle when a value of a style changes; this is intended to be
     * overridden to allow the element to update properties etc according to the
     * style
     *
     * @param key {String} the style value
     * @param value {String?} the value to set
     * @param oldValue {String?} The previous value (not from DOM)
     */
    _applyStyle(key, value, oldValue) {
      // Nothing
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
    setStyles(map, direct) {
      // inline calls to "set" because this method is very
      // performance critical!
      var Style = qx.bom.element.Style;
      if (!this.__styleValues) {
        this.__styleValues = {};
      }
      if (this._domNode) {
        // Dynamically create if needed
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }

        for (var key in map) {
          var value = map[key];
          if (this.__styleValues[key] == value) {
            continue;
          }

          this._applyStyle(key, value, this.__styleValues[key]);
          if (value == null) {
            delete this.__styleValues[key];
          } else {
            this.__styleValues[key] = value;
          }

          // Omit queuing in direct mode
          if (direct) {
            Style.set(this._domNode, key, value);
            continue;
          }

          // Store job info
          this.__styleJobs[key] = true;
        }

        // Register modification
        qx.html.Element._modified[this.toHashCode()] = this;
        qx.html.Element._scheduleFlush("element");
      } else {
        for (var key in map) {
          var value = map[key];
          if (this.__styleValues[key] == value) {
            continue;
          }

          this._applyStyle(key, value, this.__styleValues[key]);
          if (value == null) {
            delete this.__styleValues[key];
          } else {
            this.__styleValues[key] = value;
          }
        }
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
    removeStyle(key, direct) {
      this.setStyle(key, null, direct);
      return this;
    },

    /**
     * Get the value of the given style attribute.
     *
     * @param key {String} name of the style attribute
     * @return {var} the value of the style attribute
     */
    getStyle(key) {
      return this.__styleValues ? this.__styleValues[key] : null;
    },

    /**
     * Returns a map of all styles. Do not modify the result map!
     *
     * @return {Map} All styles or <code>null</code> when none are configured.
     */
    getAllStyles() {
      return this.__styleValues || null;
    },

    /*
    ---------------------------------------------------------------------------
      CSS CLASS SUPPORT
    ---------------------------------------------------------------------------
    */
    __breakClasses() {
      var map = {};
      (this.getAttribute("class") || "").split(" ").forEach(function (name) {
        if (name) {
          map[name.toLowerCase()] = name;
        }
      });
      return map;
    },

    __combineClasses(map) {
      var primaryClass = this.getCssClass();
      var arr = [];
      if (primaryClass) {
        arr.push(primaryClass);
        delete map[primaryClass.toLowerCase()];
      }
      qx.lang.Array.append(arr, Object.values(map));
      return arr.length ? arr.join(" ") : null;
    },

    /**
     * Adds a css class to the element.
     *
     * @param name {String} Name of the CSS class.
     * @return {Element} this, for chaining
     */
    addClass(name) {
      var classes = this.__breakClasses();
      var primaryClass = (this.getCssClass() || "").toLowerCase();
      name.split(" ").forEach(name => {
        var nameLower = name.toLowerCase();
        if (nameLower == primaryClass) {
          this.setCssClass(null);
        }

        classes[nameLower] = name;
      });
      this.setAttribute("class", this.__combineClasses(classes));
      return this;
    },

    /**
     * Removes a CSS class from the current element.
     *
     * @param name {String} Name of the CSS class.
     * @return {Element} this, for chaining
     */
    removeClass(name) {
      var classes = this.__breakClasses();
      var primaryClass = (this.getCssClass() || "").toLowerCase();
      name.split(" ").forEach(name => {
        var nameLower = name.toLowerCase();
        if (nameLower == primaryClass) {
          this.setCssClass(null);
        }

        delete classes[nameLower];
      });

      this.setAttribute("class", this.__combineClasses(classes));
      return this;
    },

    /**
     * Removes all CSS classed from the current element.
     */
    removeAllClasses() {
      this.setCssClass(null);
      this.setAttribute("class", "");
    },

    /**
     * Apply method for cssClass
     */
    _applyCssClass(value, oldValue) {
      var classes = this.__breakClasses();
      if (oldValue) {
        oldValue.split(" ").forEach(name => delete classes[name.toLowerCase()]);
      }
      if (value) {
        value.split(" ").forEach(name => (classes[name.toLowerCase()] = name));
      }
      this.setAttribute("class", this.__combineClasses(classes));
    },

    _applyIsCustomElement(value, oldValue) {
      // if currently `true` and trying to set `false`, throw an error
      if (!value && oldValue) {
        throw new Error(
          `Cannot change isCustomElement property of ${this.classname} after it has been set`
        );
      }
      // if no change, return
      if (value === oldValue) {
        return;
      }

      // therefore currently `false` and trying to set `true`; re-grab all slots
      this.getChildren()?.forEach(child => this._slotScanAdd(child));
    },

    /*
    ---------------------------------------------------------------------------
      SIZE AND POSITION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the size and position of this element; this is just a helper method that wraps
     * the calls to qx.bom.*
     *
     * Supported modes:
     *
     * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
     * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
     * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
     * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
     * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
     *
     * @param mode {String} the type of size required, see above
     * @return {Object} a map, containing:
     *  left, right, top, bottom - document co-ords
     *  content - Object, containing:
     *    width, height: maximum permissible content size
     */
    getDimensions(mode) {
      if (!this._domNode) {
        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          content: {
            width: 0,
            height: 0
          }
        };
      }
      var loc = qx.bom.element.Location.get(this._domNode, mode);
      loc.content = qx.bom.element.Dimension.getContentSize(this._domNode);
      loc.width = loc.right - loc.left;
      loc.height = loc.bottom - loc.top;
      return loc;
    },

    /**
     * Detects whether the DOM Node is visible
     */
    canBeSeen() {
      if (this._domNode && this.isVisible()) {
        var rect = this._domNode.getBoundingClientRect();
        if (
          rect.top > 0 ||
          rect.left > 0 ||
          rect.width > 0 ||
          rect.height > 0
        ) {
          return true;
        }
      }
      return false;
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
    setAttribute(key, value, direct) {
      if (!this.__attribValues) {
        this.__attribValues = {};
      }

      if (this.__attribValues[key] == value) {
        return this;
      }

      if (value == null) {
        delete this.__attribValues[key];
      } else {
        this.__attribValues[key] = value;
      }

      if (key == "data-qx-object-id") {
        throw new Error("Cannot set the data-qx-object-id attribute directly");
      }

      // Uncreated elements simply copy all data
      // on creation. We don't need to remember any
      // jobs. It is a simple full list copy.
      if (this._domNode) {
        // Omit queuing in direct mode
        if (direct) {
          qx.bom.element.Attribute.set(this._domNode, key, value);
          return this;
        }

        // Dynamically create if needed
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }

        // Store job info
        this.__attribJobs[key] = true;

        // Register modification
        qx.html.Element._modified[this.toHashCode()] = this;
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
    setAttributes(map, direct) {
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
    removeAttribute(key, direct) {
      return this.setAttribute(key, null, direct);
    },

    /**
     * Get the value of the given attribute.
     *
     * @param key {String} name of the attribute
     * @return {var} the value of the attribute
     */
    getAttribute(key) {
      return this.__attribValues ? this.__attribValues[key] : null;
    }
  },

  /*
   *****************************************************************************
      DEFER
   *****************************************************************************
   */

  defer(statics) {
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush, statics);
  },

  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct() {
    var hash = this.toHashCode();
    if (hash) {
      delete qx.html.Element._modified[hash];
      delete qx.html.Element._scroll[hash];
    }
    this.setRoot(false);

    this.__attribValues =
      this.__styleValues =
      this.__attribJobs =
      this.__styleJobs =
      this.__lazyScrollIntoViewX =
      this.__lazyScrollIntoViewY =
        null;
  }
});
