/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * DOM manipulation module
 *
 * @ignore(qx.bom.element, qx.bom.element.AnimationJs)
 * @group (Core)
 */
qx.Bootstrap.define("qx.module.Manipulating", {
  statics: {
    /** Default animation descriptions for animated scrolling **/
    _animationDescription: {
      scrollLeft: {
        duration: 700,
        timing: "ease-in",
        keep: 100,
        keyFrames: {
          0: {},
          100: { scrollLeft: 1 }
        }
      },

      scrollTop: {
        duration: 700,
        timing: "ease-in",
        keep: 100,
        keyFrames: {
          0: {},
          100: { scrollTop: 1 }
        }
      }
    },

    /**
     * Performs animated scrolling
     *
     * @param property {String} Element property to animate: <code>scrollLeft</code>
     * or <code>scrollTop</code>
     * @param value {Number} Final scroll position
     * @param duration {Number} The animation's duration in ms
     * @return {q} The collection for chaining.
     */
    __animateScroll(property, value, duration) {
      var desc = qx.lang.Object.clone(
        qx.module.Manipulating._animationDescription[property],
        true
      );

      desc.keyFrames[100][property] = value;
      return this.animate(desc, duration);
    },

    /**
     * Creates a new collection from the given argument
     * @param arg {var} Selector expression, HTML string, DOM element or list of
     * DOM elements
     * @return {qxWeb} Collection
     * @internal
     */
    __getCollectionFromArgument(arg) {
      var coll;
      // Collection/array of DOM elements
      if (qx.lang.Type.isArray(arg)) {
        coll = qxWeb(arg);
      }
      // HTML string
      else {
        var arr = qx.bom.Html.clean([arg]);
        if (arr.length > 0 && qx.dom.Node.isElement(arr[0])) {
          coll = qxWeb(arr);
        }
        // Selector or single element
        else {
          coll = qxWeb(arg);
        }
      }

      return coll;
    },

    /**
     * Returns the innermost element of a DOM tree as determined by a simple
     * depth-first search.
     *
     * @param element {Element} Root element
     * @return {Element} innermost element
     * @internal
     */
    __getInnermostElement(element) {
      if (element.childNodes.length == 0) {
        return element;
      }
      for (var i = 0, l = element.childNodes.length; i < l; i++) {
        if (element.childNodes[i].nodeType === 1) {
          return this.__getInnermostElement(element.childNodes[i]);
        }
      }
      return element;
    },

    /**
     * Returns an array from a selector expression or a single element
     *
     * @attach{qxWeb}
     * @param arg {String|Element} Selector expression or DOM element
     * @return {Element[]} Array of elements
     * @internal
     */
    __getElementArray(arg) {
      if (!qx.lang.Type.isArray(arg)) {
        var fromSelector = qxWeb(arg);
        arg = fromSelector.length > 0 ? fromSelector : [arg];
      }

      return arg.filter(function (item) {
        return item && (item.nodeType === 1 || item.nodeType === 11);
      });
    },

    /**
     * Creates a new collection from the given argument. This can either be an
     * HTML string, a single DOM element or an array of elements
     *
     * When no <code>context</code> is given the global document is used to
     * create new DOM elements.
     *
     * <strong>Note:</strong> When a complex HTML string is provided the <code>innerHTML</code>
     * mechanism of the browser is used. Some browsers do filter out elements like <code>&lt;html&gt;</code>,
     * <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code>. The better approach is to create
     * a single element and the appending the child nodes.
     *
     * @attachStatic{qxWeb}
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @param context {Document?document} Context in which the elements should be created
     * @return {qxWeb} Collection of elements
     */
    create(html, context) {
      return qxWeb.$init(qx.bom.Html.clean([html], context), qxWeb);
    }
  },

  members: {
    /**
     * Clones the items in the current collection and returns them in a new set.
     * Event listeners can also be cloned.
     *
     * @attach{qxWeb}
     * @param events {Boolean} clone event listeners. Default: <code>false</code>
     * @return {qxWeb} New collection with clones
     */
    clone(events) {
      var clones = [];
      for (var i = 0; i < this.length; i++) {
        if (this[i] && this[i].nodeType === 1) {
          clones[i] = this[i].cloneNode(true);
        }
      }

      if (events === true && this.copyEventsTo) {
        this.copyEventsTo(clones);
      }

      return qxWeb(clones);
    },

    /**
     * Appends content to each element in the current set. Accepts an HTML string,
     * a single DOM element or an array of elements
     *
     * @attach{qxWeb}
     * @param html {String|Element[]|qxWeb} HTML string or DOM element(s) to append
     * @return {qxWeb} The collection for chaining
     */
    append(html) {
      var arr = qx.bom.Html.clean([html]);
      var children = qxWeb.$init(arr, qxWeb);

      this._forEachElement(function (item, index) {
        for (var j = 0, m = children.length; j < m; j++) {
          if (index == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(children[j], item);
          } else {
            qx.dom.Element.insertEnd(children.eq(j).clone(true)[0], item);
          }
        }
      });

      return this;
    },

    /**
     * Appends all items in the collection to the specified parents. If multiple
     * parents are given, the items will be moved to the first parent, while
     * clones of the items will be appended to subsequent parents.
     *
     * @attach{qxWeb}
     * @param parent {String|Element[]|qxWeb} Parent selector expression or list of
     * parent elements
     * @return {qxWeb} The collection for chaining
     */
    appendTo(parent) {
      parent = qx.module.Manipulating.__getElementArray(parent);
      for (var i = 0, l = parent.length; i < l; i++) {
        this._forEachElement(function (item, j) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(this[j], parent[i]);
          } else {
            // further parents: clone the target node(s)
            qx.dom.Element.insertEnd(this.eq(j).clone(true)[0], parent[i]);
          }
        });
      }

      return this;
    },

    /**
     * Inserts the current collection before each target item. The collection
     * items are moved before the first target. For subsequent targets,
     * clones of the collection items are created and inserted.
     *
     * @attach{qxWeb}
     * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
     * Array of DOM elements or collection
     * @return {qxWeb} The collection for chaining
     */
    insertBefore(target) {
      target = qx.module.Manipulating.__getElementArray(target);
      for (var i = 0, l = target.length; i < l; i++) {
        this._forEachElement(function (item, index) {
          if (i == 0) {
            // first target: move the target node(s)
            qx.dom.Element.insertBefore(item, target[i]);
          } else {
            // further targets: clone the target node(s)
            qx.dom.Element.insertBefore(
              this.eq(index).clone(true)[0],
              target[i]
            );
          }
        });
      }

      return this;
    },

    /**
     * Inserts the current collection after each target item. The collection
     * items are moved after the first target. For subsequent targets,
     * clones of the collection items are created and inserted.
     *
     * @attach{qxWeb}
     * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
     * Array of DOM elements or collection
     * @return {qxWeb} The collection for chaining
     */
    insertAfter(target) {
      target = qx.module.Manipulating.__getElementArray(target);
      for (var i = 0, l = target.length; i < l; i++) {
        for (var j = this.length - 1; j >= 0; j--) {
          if (!this[j] || this[j].nodeType !== 1) {
            continue;
          }
          if (i == 0) {
            // first target: move the target node(s)
            qx.dom.Element.insertAfter(this[j], target[i]);
          } else {
            // further targets: clone the target node(s)
            qx.dom.Element.insertAfter(this.eq(j).clone(true)[0], target[i]);
          }
        }
      }

      return this;
    },

    /**
     * Wraps each element in the collection in a copy of an HTML structure.
     * Elements will be appended to the deepest nested element in the structure
     * as determined by a depth-first search.
     *
     * @attach{qxWeb}
     * @param wrapper {String|Element|Element[]|qxWeb} Selector expression, HTML string, DOM element or
     * list of DOM elements
     * @return {qxWeb} The collection for chaining
     */
    wrap(wrapper) {
      wrapper = qx.module.Manipulating.__getCollectionFromArgument(wrapper);

      if (wrapper.length == 0) {
        return this;
      }

      this._forEachElement(function (item) {
        var clonedwrapper = wrapper.eq(0).clone(true);
        qx.dom.Element.insertAfter(clonedwrapper[0], item);
        var innermost = qx.module.Manipulating.__getInnermostElement(
          clonedwrapper[0]
        );

        qx.dom.Element.insertEnd(item, innermost);
      });

      return this;
    },

    /**
     * Removes each element in the current collection from the DOM
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    remove() {
      this._forEachElement(function (item) {
        qx.dom.Element.remove(item);
      });
      return this;
    },

    /**
     * Removes all content from the elements in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    empty() {
      this._forEachElement(function (item) {
        // don't use innerHTML="" because of [BUG #7323]
        // and don't use textContent="" because of missing IE8 support
        while (item.firstChild) {
          item.removeChild(item.firstChild);
        }
      });
      return this;
    },

    /**
     * Inserts content before each element in the collection. This can either
     * be an HTML string, an array of HTML strings, a single DOM element or an
     * array of elements.
     *
     * @attach{qxWeb}
     * @param content {String|String[]|Element|Element[]|qxWeb} HTML string(s),
     * DOM element(s) or collection to insert
     * @return {qxWeb} The collection for chaining
     */
    before(content) {
      if (!qx.lang.Type.isArray(content)) {
        content = [content];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(content, document, fragment);
      this._forEachElement(function (item, index) {
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for (var i = 0, l = kids.length; i < l; i++) {
          var child;
          if (index < this.length - 1) {
            child = kids[i].cloneNode(true);
          } else {
            child = kids[i];
          }
          item.parentNode.insertBefore(child, item);
        }
      }, this);

      return this;
    },

    /**
     * Inserts content after each element in the collection. This can either
     * be an HTML string, an array of HTML strings, a single DOM element or an
     * array of elements.
     *
     * @attach{qxWeb}
     * @param content {String|String[]|Element|Element[]|qxWeb} HTML string(s),
     * DOM element(s) or collection to insert
     * @return {qxWeb} The collection for chaining
     */
    after(content) {
      if (!qx.lang.Type.isArray(content)) {
        content = [content];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(content, document, fragment);
      this._forEachElement(function (item, index) {
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for (var i = kids.length - 1; i >= 0; i--) {
          var child;
          if (index < this.length - 1) {
            child = kids[i].cloneNode(true);
          } else {
            child = kids[i];
          }
          item.parentNode.insertBefore(child, item.nextSibling);
        }
      }, this);

      return this;
    },

    /**
     * Returns the left scroll position of the first element in the collection.
     *
     * @attach{qxWeb}
     * @return {Number} Current left scroll position
     */
    getScrollLeft() {
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
     * @attach{qxWeb}
     * @return {Number} Current top scroll position
     */
    getScrollTop() {
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

    /**
     * Scrolls the elements of the collection to the given coordinate.
     *
     * @attach{qxWeb}
     * @param value {Number} Left scroll position
     * @param duration {Number?} Optional: Duration in ms for animated scrolling
     * @return {qxWeb} The collection for chaining
     */
    setScrollLeft(value, duration) {
      var Node = qx.dom.Node;

      if (duration && qx.bom.element && qx.bom.element.AnimationJs) {
        qx.module.Manipulating.__animateScroll.bind(
          this,
          "scrollLeft",
          value,
          duration
        )();
      }

      for (var i = 0, l = this.length, obj; i < l; i++) {
        obj = this[i];

        if (Node.isElement(obj)) {
          if (!(duration && qx.bom.element && qx.bom.element.AnimationJs)) {
            obj.scrollLeft = value;
          }
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
     * @attach{qxWeb}
     * @param value {Number} Top scroll position
     * @param duration {Number?} Optional: Duration in ms for animated scrolling
     * @return {qxWeb} The collection for chaining
     */
    setScrollTop(value, duration) {
      var Node = qx.dom.Node;

      if (duration && qx.bom.element && qx.bom.element.AnimationJs) {
        qx.module.Manipulating.__animateScroll.bind(
          this,
          "scrollTop",
          value,
          duration
        )();
      }

      for (var i = 0, l = this.length, obj; i < l; i++) {
        obj = this[i];

        if (Node.isElement(obj)) {
          if (!(duration && qx.bom.element && qx.bom.element.AnimationJs)) {
            obj.scrollTop = value;
          }
        } else if (Node.isWindow(obj)) {
          obj.scrollTo(this.getScrollLeft(obj), value);
        } else if (Node.isDocument(obj)) {
          Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
        }
      }

      return this;
    },

    /**
     * Focuses the first element in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    focus() {
      try {
        this[0].focus();
      } catch (ex) {}

      return this;
    },

    /**
     * Blurs each element in the collection
     *
     * @attach{qxWeb}
     * @return {qxWeb} The collection for chaining
     */
    blur() {
      this.forEach(function (item, index) {
        try {
          item.blur();
        } catch (ex) {}
      });

      return this;
    }
  },

  defer(statics) {
    qxWeb.$attachAll(this);
  }
});
