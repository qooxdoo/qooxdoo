/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @use(qx.theme.Classic)
 */

qx.Class.define("qx.test.ui.LayoutTestCase", {
  extend: qx.dev.unit.TestCase,
  type: "abstract",

  statics: {
    $$clazz: null,
    $$args: null
  },

  members: {
    setUp() {
      this.getRoot();
    },

    tearDown() {
      this.getRoot()
        .removeAll()
        .forEach(function (widget) {
          widget.dispose();
        });

      var cls = qx.test.ui.LayoutTestCase;

      if (cls._root) {
        cls._root.destroy();
        cls._root = null;
        qx.core.Init.getApplication = cls.__oldGetApp;
      }
    },

    getRoot() {
      var cls = qx.test.ui.LayoutTestCase;

      if (cls._root) {
        return cls._root;
      }

      qx.theme.manager.Meta.getInstance().initialize();
      cls._root = new qx.ui.root.Application(document);

      cls.__oldApplication = qx.core.Init.getApplication();
      cls.__oldGetApp = qx.core.Init.getApplication;

      qx.core.Init.getApplication = function () {
        return {
          getRoot() {
            return cls._root;
          },
          close() {},
          terminate() {}
        };
      };

      return cls._root;
    },

    getRunnerApplication() {
      return (
        qx.test.ui.LayoutTestCase.__oldApplication ||
        qx.core.Init.getApplication()
      );
    },

    flush() {
      qx.ui.core.queue.Manager.flush();
    },

    assertDestroy(fcn, context, msg) {
      // call function
      fcn.call(context);
      this.flush();
      this.flush();

      // copy object registry
      var regCopy = qx.lang.Object.clone(qx.core.ObjectRegistry.getRegistry());

      // copy event listener structure
      var eventMgr = qx.event.Registration.getManager(window);
      var listeners = eventMgr.getAllListeners();
      var listenersCopy = {};
      for (var hash in listeners) {
        listenersCopy[hash] = {};
        for (var key in listeners[hash]) {
          listenersCopy[hash][key] = qx.lang.Array.clone(listeners[hash][key]);
        }
      }

      // call function
      fcn.call(context);
      this.flush();
      this.flush();

      // measure increase in object counts

      // check object registry
      var reg = qx.core.ObjectRegistry.getRegistry();
      for (key in reg) {
        var obj = reg[key];

        // skip pooled objects + DeferredCall which cleans the event listener blacklist
        if (obj.$$pooled || obj.$$blackListCleaner) {
          continue;
        }
        this.assertNotUndefined(
          regCopy[key],
          msg + ": The object '" + obj.classname + "' has not been disposed!"
        );
      }

      listeners = eventMgr.getAllListeners();

      for (var hash in listeners) {
        if (!listenersCopy[hash]) {
          listenersCopy[hash] = {};
        }

        for (key in listeners[hash]) {
          if (!listenersCopy[hash][key]) {
            listenersCopy[hash][key] = [];
          }

          for (var i = 0; i < listeners[hash][key].length; i++) {
            if (
              listenersCopy[hash][key].indexOf(listeners[hash][key][i]) == -1
            ) {
              this.fail(
                msg +
                  ": The event listener '" +
                  key +
                  ":" +
                  listeners[hash][key][i] +
                  "'for the object '" +
                  hash +
                  ":" +
                  qx.core.ObjectRegistry.fromHashCode(hash) +
                  "' has not been removed."
              );
            }
          }
        }
      }

      // check root children length
      this.assertIdentical(
        0,
        this.getRoot().getChildren().length,
        msg +
          ": The root Children array must be empty but found: " +
          this.getRoot().getChildren().join(", ")
      );
    },

    /**
     * @lint ignoreDeprecated(eval)
     */
    assertWidgetDispose(clazz, args, msg) {
      this.assertDestroy(
        function () {
          var argStr = [];
          for (var i = 0; i < args.length; i++) {
            argStr.push("qx.test.ui.LayoutTestCase.$$args" + "[" + i + "]");
          }

          qx.test.ui.LayoutTestCase.$$clazz = clazz;
          qx.test.ui.LayoutTestCase.$$args = args;
          var str =
            "new qx.test.ui.LayoutTestCase.$$clazz" +
            "(" +
            argStr.join(", ") +
            ");";
          var widget = eval(str);

          this.getRoot().add(widget);
          this.flush();

          widget.destroy();
        },
        this,
        msg
      );
    },

    _getFixedWidget() {
      var widget = new qx.ui.core.Widget();
      widget.set({
        width: 200,
        height: 100,
        maxWidth: "pref",
        minWidth: "pref",
        maxHeight: "pref",
        minHeight: "pref"
      });

      return widget;
    },

    assertSize(widget, width, height, msg) {
      this.flush();
      var el = widget.getContentElement().getDomElement();
      var elHeight = parseInt(el.style.height, 10);
      var elWidth = parseInt(el.style.width, 10);
      this.assertEquals(width, elWidth, msg);
      this.assertEquals(height, elHeight, msg);
    },

    assertPadding(widget, top, right, bottom, left, msg) {
      this.flush();

      this.assertNotNull(widget.getContentElement());
      this.assertNotNull(widget.getContentElement().getDomElement());

      var content = widget.getContentElement().getDomElement();

      var paddingTop =
        parseInt(qx.bom.element.Style.get(content, "paddingTop"), 10) || 0;
      var paddingRight =
        parseInt(qx.bom.element.Style.get(content, "paddingRight"), 10) || 0;
      var paddingBottom =
        parseInt(qx.bom.element.Style.get(content, "paddingBottom"), 10) || 0;
      var paddingLeft =
        parseInt(qx.bom.element.Style.get(content, "paddingLeft"), 10) || 0;

      this.assertEquals(top, paddingTop, msg);
      this.assertEquals(right, paddingRight, msg);
      this.assertEquals(bottom, paddingBottom, msg);
      this.assertEquals(left, paddingLeft, msg);
    },

    assertStyle(widget, style, value, msg) {
      this.flush();
      var element = widget.getContentElement().getDomElement();
      var computedStyle = qx.bom.element.Style.get(element, style);

      if (value && style.match(/color/i)) {
        this.assertCssColor(value, computedStyle, msg);
      } else {
        this.assertEquals(value, computedStyle, msg);
      }
    },

    tapOn(widget) {
      widget.fireEvent("tap", qx.event.type.Tap, [
        {},
        widget,
        widget,
        false,
        true
      ]);
    }
  }
});
