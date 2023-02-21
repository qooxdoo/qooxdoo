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
     * @param tagname {String} the name of the tag
     * @param attributes {Map?} map of attribute values
     * @param children {qx.html.Node[]} array of children
     * @return {qx.html.Element|qx.data.Array}
     */
    createElement(tagname, attributes) {
      var children = qx.lang.Array.fromArguments(arguments, 2);
      var self = this;
      if (typeof tagname === "function") {
        throw new Error("Custom tags are not supported");
      }
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
      var newAttrs = {};
      var eventHandlers = {};
      var innerHtml = null;
      var refs = [];

      if (attributes) {
        var RENAME = {
          className: "class",
          htmlFor: "for",
          xlinkHref: "xlink:href"
        };

        Object.keys(attributes).forEach(function (prop) {
          var renameTo = RENAME[prop];
          if (renameTo) {
            newAttrs[renameTo] = attributes[prop];
            return;
          }

          if (prop === "ref") {
            if (
              attributes.ref instanceof qx.html.JsxRef ||
              typeof attributes.ref === "function"
            ) {
              refs.push(attributes.ref);
            } else {
              self.warn(
                "Unsupported type of `ref` argument: " + typeof attributes.ref
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

      if (children) {
        function addChildren(children) {
          children.forEach(function (child) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addChildren(child);
            } else if (typeof child == "string") {
              element.add(new qx.html.Text(child));
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
      for (var eventName in eventHandlers) {
        element.addListener(eventName, eventHandlers[eventName]);
      }
      refs.forEach(function (ref) {
        if (ref instanceof qx.html.JsxRef) {
          ref.setValue(element);
        } else {
          ref(element, attributes);
        }
      });

      return element;
    },

    /** @type {Map} map of event names, all values are `true` */
    SYNTETIC_EVENTS: null,

    /** @type {String} tagname for fragments */
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
