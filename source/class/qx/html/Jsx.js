/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 Zenesis Ltd http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://github.com/johnspackman)
     * Alexander Lopez (https://github.com/alecsgone)

   This class includes work from on https://github.com/alecsgone/jsx-render; at the time of writing,
   the https://github.com/alecsgone/jsx-render repo is available under an MIT license.

************************************************************************ */

/**
 * This class includes work from on https://github.com/alecsgone/jsx-render; at the time of writing,
 * the https://github.com/alecsgone/jsx-render repo is available under an MIT license.
 */
qx.Class.define("qx.html.Jsx", {
  extend: qx.core.Object,

  statics: {
    /**
     * Creates an element.
     *
     * Fragments are supported if the tagname is `qx.html.Jsx.FRAGMENT`; but in this case,
     * an `qx.data.Array` is returned.
     *
     * Custom tags are supported, the attributes will be passed to the function as a single object. Example;
     * ```jsx
     * const CustomTag = (attrs, children) => <div id={attrs.id}>{children}</div>;
     *
     * const myElem = (
     *   <CustomTag id="myId">
     *     <span>My content</span>
     *   </CustomTag>
     * );
     * ```
     *
     * @param tagname {String|Function} the name of the tag
     * @param attributes {Record<string, any>} map of attribute values
     * @param children {qx.html.Node[]} array of children
     * @return {qx.html.Element|qx.data.Array}
     */
    createElement(tagname, attributes) {
      const children = qx.lang.Array.fromArguments(arguments, 2);
      const self = this;
      attributes ??= {};

      // CSS CUSTOM PROPERTIES
      const cssCustomProperties = {};
      for (const key in attributes) {
        if (key.startsWith("__")) {
          cssCustomProperties[key.replace(/^__/, "--")] = attributes[key];
          delete attributes[key];
        }
      }
      const customStyle = Object.entries(cssCustomProperties).reduce(
        (acc, [prop, val]) => acc + `${prop}:${val};`,
        ""
      );

      // ANONYMOUS FRAGMENT
      if (tagname == qx.html.Jsx.FRAGMENT) {
        var arr = new qx.data.Array();
        function addChildrenFragment(children) {
          children.forEach(function (child) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addChildrenFragment(child);
            } else {
              arr.push(child);
            }
          });
        }
        addChildrenFragment(children);
        return arr;
      }

      // CUSTOM ELEMENT
      if (typeof tagname === "function") {
        // handle constructors and plain functions
        let element = qx.Class.isClass(tagname)
          ? new tagname(attributes)
          : tagname(attributes);

        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue(element instanceof qx.html.Node);
        }

        let realElement = element;
        if (customStyle.length) {
          realElement = new qx.html.Element("div", null, {
            style: customStyle
          });

          realElement.add(element);
        }

        element.setIsCustomElement(true);
        if (children) {
          function injectChildren(children) {
            children.forEach(function (child) {
              if (
                child instanceof qx.data.Array ||
                qx.lang.Type.isArray(child)
              ) {
                injectChildren(child);
              } else if (typeof child == "string") {
                element.inject(new qx.html.Text(child));
              } else if (typeof child == "number") {
                element.inject(new qx.html.Text("" + child));
              } else {
                element.inject(child);
              }
            });
          }
          injectChildren(children);
        }
        if (attributes?.slot) {
          element.setAttributes({ slot: attributes.slot });
        }
        return realElement;
      }

      var newAttrs = {};
      var eventHandlers = {};
      var innerHtml = null;
      var refs = [];

      if (attributes) {
        const reactWorkaroundProps = ["className", "htmlFor", "xlinkHref"];
        const alt = {
          className: "class",
          htmlFor: "for",
          xlinkHref: "xlink:href"
        };

        Object.keys(attributes).forEach(function (prop) {
          if (reactWorkaroundProps.includes(prop)) {
            if (qx.core.Environment.get("qx.debug")) {
              self.warn(
                `The attribute "${prop}" was recognised as a ReactJSX workaround, it is not needed in QxJSX. Consider using "${alt[prop]}" instead.`
              );
            }
            attributes[alt[prop]] = attributes[prop];
            prop = alt[prop];
          }
          if (prop === "ref") {
            if (
              attributes.ref instanceof qx.html.JsxRef ||
              typeof attributes.ref === "function"
            ) {
              refs.push(attributes.ref);
            } else {
              self.warn(
                `Unsupported type of "ref" argument: ${typeof attributes.ref}`
              );
            }
          } else if (prop === "dangerouslySetInnerHTML") {
            // eslint-disable-next-line no-underscore-dangle
            innerHtml = attributes[prop].__html;
          } else if (qx.html.Jsx.SYNTETIC_EVENTS[prop]) {
            var eventName = prop.replace(/^on/, "").toLowerCase();
            eventHandlers[eventName] = attributes[prop];
          } else {
            // any other prop will be set as attribute
            newAttrs[prop] = attributes[prop];
          }
        });
      }

      var element = qx.html.Factory.getInstance().createElement(
        tagname,
        newAttrs
      );

      // SLOT
      if (tagname === "slot") {
        if (children) {
          function addDefaultChildren(children) {
            children.forEach(child => {
              if (
                child instanceof qx.data.Array ||
                qx.lang.Type.isArray(child)
              ) {
                addDefaultChildren(child);
              } else if (typeof child == "string") {
                element.addDefaultChild(new qx.html.Text(child));
              } else if (typeof child == "number") {
                element.addDefaultChild(new qx.html.Text("" + child));
              } else {
                element.addDefaultChild(child);
              }
            });
          }
          addDefaultChildren(children);
          element.sealDefaultChildren();
        }
        return element;
      }

      if (children) {
        function addChildren(children) {
          children.forEach(function (child) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addChildren(child);
            } else if (typeof child == "string") {
              element.add(new qx.html.Text(child));
            } else if (typeof child == "number") {
              element.add(new qx.html.Text("" + child));
            } else {
              element.add(child);
            }
          });
        }
        addChildren(children);
      }

      if (innerHtml) {
        element.setProperty("innerHtml", innerHtml);
      }

      for (const eventName in eventHandlers) {
        element.addListener(eventName, eventHandlers[eventName]);
      }

      for (const ref of refs) {
        if (ref instanceof qx.html.JsxRef) {
          ref.setValue(element);
        } else {
          ref(element, attributes);
        }
      }

      return element;
    },

    /** @type {Map} map of event names, all values are `true` */
    SYNTETIC_EVENTS: null,

    /** @type {String} tagname for anonymous (native) fragments */
    FRAGMENT: "$$fragment"
  },

  defer(statics) {
    var MOUSE_EVENTS = [
      "onClick",
      "onContextMenu",
      "onDoubleClick",
      "onDrag",
      "onDragEnd",
      "onDragEnter",
      "onDragExit",
      "onDragLeave",
      "onDragOver",
      "onDragStart",
      "onDrop",
      "onMouseDown",
      "onMouseEnter",
      "onMouseLeave",
      "onMouseMove",
      "onMouseOut",
      "onMouseOver",
      "onMouseUp"
    ];

    var TOUCH_EVENTS = [
      "onTouchCancel",
      "onTouchEnd",
      "onTouchMove",
      "onTouchStart"
    ];

    var KEYBOARD_EVENTS = ["onKeyDown", "onKeyPress", "onKeyUp"];

    var FOCUS_EVENTS = ["onFocus", "onBlur"];

    var FORM_EVENTS = ["onChange", "onInput", "onInvalid", "onSubmit"];

    var UI_EVENTS = ["onScroll"];

    var IMAGE_EVENTS = ["onLoad", "onError"];

    var synteticEvents = [
      MOUSE_EVENTS,
      TOUCH_EVENTS,
      KEYBOARD_EVENTS,
      FOCUS_EVENTS,
      FORM_EVENTS,
      UI_EVENTS,
      IMAGE_EVENTS
    ];

    var SYNTETIC_EVENTS = (qx.html.Jsx.SYNTETIC_EVENTS = {});
    synteticEvents.forEach(function (arr) {
      arr.forEach(function (key) {
        SYNTETIC_EVENTS[key] = true;
      });
    });
  }
});
