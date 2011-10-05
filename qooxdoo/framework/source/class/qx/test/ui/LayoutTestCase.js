/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#use(qx.theme.Classic)
*/

qx.Class.define("qx.test.ui.LayoutTestCase",
{
  extend : qx.dev.unit.TestCase,
  type : "abstract",

  statics :
  {
    $$clazz : null,
    $$args : null
  },

  members :
  {
    setUp : function() {
      this.getRoot();
    },


    tearDown : function() {
      this.getRoot().removeAll();

      if (qx.core.Environment.get("qx.debug.dispose")) {
        var cls = qx.test.ui.LayoutTestCase;

        if (cls._root) {
          cls._root.destroy();
          cls._root = null;
          qx.core.Init.getApplication = cls.__oldGetApp;
        }
      }
    },


    getRoot : function()
    {
      var cls = qx.test.ui.LayoutTestCase;

      if (cls._root) {
        return cls._root;
      }

      qx.theme.manager.Meta.getInstance().initialize();
      cls._root = new qx.ui.root.Application(document);

      cls.__oldApplication = qx.core.Init.getApplication();
      cls.__oldGetApp = qx.core.Init.getApplication;

      qx.core.Init.getApplication = function() {
        return {
          getRoot : function() {
            return cls._root;
          },
          close : function() {},
          terminate : function() {}
        }
      }

      return cls._root;
    },


    getRunnerApplication : function() {
      return qx.test.ui.LayoutTestCase.__oldApplication || qx.core.Init.getApplication();
    },


    flush : function() {
      qx.ui.core.queue.Manager.flush();
    },


    assertDestroy : function(fcn, context, msg)
    {
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
      for (var hash in listeners)
      {
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
      for (key in reg)
      {
        var obj = reg[key];

        // skip pooled objects
        if (obj.$$pooled) {
          continue
        }
        this.assertNotUndefined(
          regCopy[key],
          msg + ": The object '" + obj.classname + "' has not been disposed!"
        );
      }

      listeners = eventMgr.getAllListeners();

      for (var hash in listeners)
      {
        if (!listenersCopy[hash]) {
          listenersCopy[hash] = {};
        }

        for (key in listeners[hash])
        {
          if (!listenersCopy[hash][key]) {
            listenersCopy[hash][key] = [];
          }

          for (var i=0; i<listeners[hash][key].length; i++)
          {
            if (listenersCopy[hash][key].indexOf(listeners[hash][key][i]) == -1) {
              this.fail(
                  msg + ": The event listener '"+ key + ":" +
                  listeners[hash][key][i] + "'for the object '" +
                  hash + ":" + qx.core.ObjectRegistry.fromHashCode(hash) +
                  "' has not been removed."
                );
            }
          }
        }
      }

      // check root children length
      this.assertIdentical(
        0, this.getRoot().getChildren().length,
        msg + ": The root Children array must be empty but found: " + this.getRoot().getChildren().join(", ")
      );
    },


    assertWidgetDispose : function(clazz, args, msg)
    {
      this.assertDestroy(function()
      {
        var argStr = [];
        for (var i=0; i<args.length; i++) {
          argStr.push("qx.test.ui.LayoutTestCase.$$args" + "[" + i + "]");
        }

        qx.test.ui.LayoutTestCase.$$clazz = clazz;
        qx.test.ui.LayoutTestCase.$$args = args;
        var str = "new qx.test.ui.LayoutTestCase.$$clazz" + "(" + argStr.join(", ") + ");";
        var widget = eval(str);

        this.getRoot().add(widget);
        this.flush();

        widget.destroy();
      }, this, msg);
    },


    _getFixedWidget : function()
    {
      var widget = new qx.ui.core.Widget();
      widget.set({
        width: 200,
        height: 100,
        maxWidth : "pref",
        minWidth : "pref",
        maxHeight : "pref",
        minHeight : "pref"
      });
      return widget;
    },


    assertSize : function(widget, width, height, msg)
    {
      this.flush();
      var el = widget.getContainerElement().getDomElement();
      var elHeight = parseInt(el.style.height, 10);
      var elWidth = parseInt(el.style.width, 10);
      this.assertEquals(width, elWidth, msg);
      this.assertEquals(height, elHeight, msg);
    },


    assertPadding : function(widget, top, right, bottom, left, msg)
    {
      this.flush();

      this.assertNotNull(widget.getContainerElement());
      this.assertNotNull(widget.getContainerElement().getDomElement());

      var container = widget.getContainerElement().getDomElement();
      var width = parseInt(container.style.width, 10) || 0;
      var height = parseInt(container.style.height, 10) || 0;

      var content = widget.getContentElement().getDomElement();
      var innerWidth = parseInt(content.style.width, 10) || 0;
      var innerHeight = parseInt(content.style.height, 10) || 0;
      var innerTop = parseInt(content.style.top, 10) || 0;
      var innerLeft = parseInt(content.style.left, 10) || 0;

      this.assertEquals(top, innerTop, msg);
      this.assertEquals(right, width-innerWidth-left, msg);

      this.assertEquals(bottom, height-innerHeight-top, msg);
      this.assertEquals(left, innerLeft, msg);
    },


    assertStyle : function(widget, style, value, msg)
    {
      this.flush();
      var widgetStyle = widget.getContainerElement().getDomElement().style[style];

      if (value && style.match(/color/i)) {
        this.assertCssColor(value, widgetStyle, msg);
      } else {
        this.assertEquals(value, widgetStyle, msg);
      }
    },


    assertContentStyle : function(widget, style, value, msg)
    {
      this.flush();
      var widgetStyle = widget.getContentElement().getDomElement().style[style];
      if (value && style.match(/color/i)) {
        this.assertCssColor(value, widgetStyle, msg);
      } else {
        this.assertEquals(value, widgetStyle, msg);
      }
    },


    assertDecoratorStyle : function(widget, style, value, msg)
    {
      this.flush();

      if (!value && !widget.getDecoratorElement()) {
        return;
      }

      this.assertNotNull(widget.getDecoratorElement(), msg);
      var widgetStyle = widget.getDecoratorElement().getDomElement().style[style];
      if (value && style.match(/color/i)) {
        this.assertCssColor(value, widgetStyle, msg);
      } else {
        this.assertEquals(value, widgetStyle, msg);
      }
    },


    clickOn: function(widget) {
      widget.fireEvent("click", qx.event.type.Mouse, [{}, widget, widget, false, true]);
    }

  }
});
