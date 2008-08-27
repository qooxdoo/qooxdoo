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

  members :
  {
    setUp : function() {
      this.getRoot();
    },


    tearDown : function() {
      this.getRoot().removeAll();
    },


    getRoot : function()
    {
      var cls = qx.test.ui.LayoutTestCase;
      qx.theme.manager.Meta.getInstance().initialize();

      if (!cls._root)
      {
        cls._root = new qx.ui.root.Application(document);

        qx.core.Init.getApplication = function() {
          return {
            getRoot : function() {
              return cls._root;
            }
          }
        }
      }

      return cls._root;
    },


    assertDestroy : function(fcn, context, msg)
    {
      // call function
      fcn.call(context);
      qx.ui.core.queue.Manager.flush();
      qx.ui.core.queue.Manager.flush();


      // copy object registry
      var regCopy = qx.lang.Object.copy(qx.core.ObjectRegistry.getRegistry());

      // copy event listener structure
      var eventMgr = qx.event.Registration.getManager(window);
      var listeners= eventMgr.__listeners;
      var listenersCopy = {};
      for (var hash in listeners)
      {
        listenersCopy[hash] = {};
        for (var key in listeners[hash]) {
          listenersCopy[hash][key] = qx.lang.Array.copy(listeners[hash][key]);
        }
      }

      // call function
      fcn.call(context);
      qx.ui.core.queue.Manager.flush();
      qx.ui.core.queue.Manager.flush();

      // measure increase in object counts

      // check object registry
      var reg = qx.core.ObjectRegistry.getRegistry();
      for (key in reg)
      {
        var obj = reg[key];
        this.assertNotUndefined(
          regCopy[key],
          msg + ": The object '" + obj + "' has not been disposed!"
        );
      }

      listeners = eventMgr.__listeners;

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
          argStr.push("args[" + i + "]");
        }
        var widget;
        var str = "var widget = new clazz(" + argStr.join(", ") + ");"
        eval(str);

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

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
      qx.ui.core.queue.Manager.flush();
      var el = widget.getContainerElement().getDomElement();
      var elHeight = parseInt(el.style.height);
      var elWidth = parseInt(el.style.width);
      this.assertEquals(width, elWidth, msg);
      this.assertEquals(height, elHeight, msg);
    },


    assertPadding : function(widget, top, right, bottom, left, msg)
    {
      qx.ui.core.queue.Manager.flush();

      this.assertNotNull(widget.getContainerElement());
      this.assertNotNull(widget.getContainerElement().getDomElement());

      var container = widget.getContainerElement().getDomElement();
      var width = parseInt(container.style.width) || 0;
      var height = parseInt(container.style.height) || 0;

      var content = widget.getContentElement().getDomElement();
      var innerWidth = parseInt(content.style.width) || 0;
      var innerHeight = parseInt(content.style.height) || 0;
      var innerTop = parseInt(content.style.top) || 0;
      var innerLeft = parseInt(content.style.left) || 0;

      this.assertEquals(top, innerTop, msg);
      this.assertEquals(right, width-innerWidth-left, msg);

      this.assertEquals(bottom, height-innerHeight-top, msg);
      this.assertEquals(left, innerLeft, msg);
    },


    assertStyle : function(widget, style, value, msg)
    {
      qx.ui.core.queue.Manager.flush();
      var widgetStyle = widget.getContainerElement().getDomElement().style[style];

      if (value && style.match(/color/i)) {
        this.assertCssColor(value, widgetStyle, msg);
      } else {
        this.assertEquals(value, widgetStyle, msg);
      }
    },


    assertContentStyle : function(widget, style, value, msg)
    {
      qx.ui.core.queue.Manager.flush();
      var widgetStyle = widget.getContainerElement().getDomElement().style[style];
      if (value && style.match(/color/i)) {
        this.assertCssColor(value, widgetStyle, msg);
      } else {
        this.assertEquals(value, widgetStyle, msg);
      }
    },


    assertDecoratorStyle : function(widget, style, value, msg)
    {
      qx.ui.core.queue.Manager.flush();

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
    }

  }
});
