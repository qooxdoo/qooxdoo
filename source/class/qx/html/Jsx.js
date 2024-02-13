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
     * Will Johnson (WillsterJohnson)
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
      attributes ??= {};

      // CSS CUSTOM PROPERTIES
      const cssCustomProperties = {};
      for (const key in attributes) {
        if (key.startsWith("__")) {
          cssCustomProperties[key.replace(/^__/, "--")] = attributes[key];
          delete attributes[key];
        }
      }

      // ANONYMOUS FRAGMENT
      if (tagname == qx.html.Jsx.FRAGMENT) {
        const arr = new qx.data.Array();
        const addChildrenFragment = children => {
          for (const child of children) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addChildrenFragment(child);
            } else {
              arr.push(child);
            }
          }
        };
        addChildrenFragment(children);
        return arr;
      }

      // CUSTOM ELEMENT
      if (typeof tagname === "function") {
        // handle constructors and plain functions
        const element = qx.Class.isClass(tagname)
          ? new tagname(attributes)
          : tagname(attributes);

        if (qx.core.Environment.get("qx.debug")) {
          qx.core.Assert.assertTrue(element instanceof qx.html.Node);
        }

        for (const key in cssCustomProperties) {
          element.setStyle(key, cssCustomProperties[key], true);
        }

        element.setIsCustomElement(true);
        if (children) {
          const injectChildren = children => {
            for (const child of children) {
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
            }
          };
          injectChildren(children);
        }
        if (attributes?.slot) {
          element.setAttributes({ slot: attributes.slot });
        }
        return element;
      }

      const newAttrs = {};
      const eventHandlers = {};
      let innerHtml = null;
      const refs = [];

      if (attributes) {
        const reactWorkaroundProps = ["className", "htmlFor", "xlinkHref"];
        const alt = {
          className: "class",
          htmlFor: "for",
          xlinkHref: "xlink:href"
        };

        for (const key in attributes) {
          let prop = key;
          if (reactWorkaroundProps.includes(prop)) {
            if (qx.core.Environment.get("qx.debug")) {
              qx.log.Logger.warn(
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
              qx.log.Logger.warn(
                `Unsupported type of "ref" argument: ${typeof attributes.ref}`
              );
            }
          } else if (prop === "dangerouslySetInnerHTML") {
            // eslint-disable-next-line no-underscore-dangle
            innerHtml = attributes[prop].__html;
          } else if (qx.html.Jsx.SYNTHETIC_EVENTS[prop]) {
            const eventName = prop.replace(/^on/, "").toLowerCase();
            eventHandlers[eventName] = attributes[prop];
          } else {
            // any other prop will be set as attribute
            newAttrs[prop] = attributes[prop];
          }
        }
      }

      let element;
      if (tagname.startsWith("qx:")) {
        switch (tagname) {
          // TODO: add this in future - an enhanced fragment enabling features like slot targeting
          // case "qx:fragment": {}

          // TODO: add this in future - children of this element are added to the document head,
          // eg to dynamically include assets without dirtying the DOM
          // case "qx:head": {}

          // anything we want!
          // case "qx:...": {}
          default: {
            throw new Error(
              `Unknown QX NameSpace tag: ${tagname}. The qx:* namespace is reserved for internally defined tags with special behaviors.`
            );
          }
        }
      }
      // MAYBE: add a custom registry like the above qx:*, but for user-defined behaviors
      else {
        element = qx.html.Factory.getInstance().createElement(
          tagname,
          newAttrs
        );
      }

      // SLOT
      if (tagname === "slot") {
        if (children) {
          const addDefaultChildren = children => {
            for (const child of children) {
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
            }
          };
          addDefaultChildren(children);
          element.sealDefaultChildren();
        }
        return element;
      }

      if (children) {
        const addChildren = children => {
          for (const child of children) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addChildren(child);
            } else if (typeof child == "string") {
              element.add(new qx.html.Text(child));
            } else if (typeof child == "number") {
              element.add(new qx.html.Text("" + child));
            } else {
              element.add(child);
            }
          }
        };
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

    /** @deprecated Use {@link qx.html.Jsx.SYNTHETIC_EVENTS} instead */
    SYNTETIC_EVENTS: null,

    /** @type {Map} map of event names, all values are `true` */
    SYNTHETIC_EVENTS: null,

    /** @type {string} tagname for anonymous (native) fragments */
    FRAGMENT: "qx.html.Jsx.FRAGMENT"
  },

  defer(statics) {
    const MOUSE_EVENTS = [
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

    const TOUCH_EVENTS = [
      "onTouchCancel",
      "onTouchEnd",
      "onTouchMove",
      "onTouchStart"
    ];

    const KEYBOARD_EVENTS = ["onKeyDown", "onKeyPress", "onKeyUp"];

    const FOCUS_EVENTS = ["onFocus", "onBlur"];

    const FORM_EVENTS = ["onChange", "onInput", "onInvalid", "onSubmit"];

    const UI_EVENTS = ["onScroll"];

    const IMAGE_EVENTS = ["onLoad", "onError"];

    const syntheticEvents = [
      MOUSE_EVENTS,
      TOUCH_EVENTS,
      KEYBOARD_EVENTS,
      FOCUS_EVENTS,
      FORM_EVENTS,
      UI_EVENTS,
      IMAGE_EVENTS
    ];

    const SYNTHETIC_EVENTS = {};
    for (const arr of syntheticEvents) {
      for (const key of arr) {
        SYNTHETIC_EVENTS[key] = true;
      }
    }
    qx.html.Jsx.SYNTHETIC_EVENTS = SYNTHETIC_EVENTS;
    /* deprecated: misspelled */ qx.html.Jsx.SYNTETIC_EVENTS = SYNTHETIC_EVENTS;
  }
});
