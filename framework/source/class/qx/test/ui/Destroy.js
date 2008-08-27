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

qx.Class.define("qx.test.ui.Destroy",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {

    setUp : function() {
      this.getRoot();
    },


    tearDown : function() {
      this.getRoot().removeAll();
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
        msg + ": The root Children array must be empty"
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


    assertLayoutDispose : function(clazz, args, layoutArgsArr)
    {
      this.assertDestroy(function()
      {
        var argStr = [];
        for (var i=0; i<args.length; i++) {
          argStr.push("args[" + i + "]");
        }
        var layout;
        var str = "var layout = new clazz(" + argStr.join(", ") + ");"
        eval(str);

        var widget = new qx.ui.container.Composite();
        widget.setLayout(layout);

        for (var i=0; i<layoutArgsArr.length; i++) {
          widget.add(new qx.ui.core.Widget(), layoutArgsArr[i]);
        }

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this);
    },


    testLayouts : function()
    {
      var layouts = [
        [qx.ui.layout.Basic, [], [{left: 10}, {top: 10}, {left: 10, top: 10}]],
        [qx.ui.layout.Canvas, [], [{left: 10}, {top: 10}, {right: 10, top: "10%"}]],
        [qx.ui.layout.Dock, [], [{edge: "north"}, {edge: "south"}, {edge: "west"}, {edge: "east"}]],
        [qx.ui.layout.Grow, [], [{}]],
        [qx.ui.layout.HBox, [], [{flex: 1}, {}, {}]],
        [qx.ui.layout.VBox, [], [{flex: 1}, {}, {}]],
        [qx.ui.layout.Grid, [], [{row: 0, column: 0}, {row: 4, column: 3}, {row: 2, column: 0, colSpan: 3}]]
      ];

      for (var i=0; i<layouts.length; i++) {
        this.assertLayoutDispose(layouts[1][0], layouts[1][1], layouts[1][2])
      }
    },


    testForms : function()
    {
      var forms = [
        [qx.ui.form.Button, ["Juhu"]],
        [qx.ui.form.ComboBox, []],
        [qx.ui.form.CheckBox, ["Juhu"]],
        [qx.ui.form.MenuButton, []],
        [qx.ui.form.PasswordField, []],
        [qx.ui.form.RadioButton, []],
        [qx.ui.form.SelectBox, []],
        [qx.ui.form.Slider, []],
        [qx.ui.form.Spinner, []],
        [qx.ui.form.SplitButton, []],
        [qx.ui.form.TextArea, []],
        [qx.ui.form.TextField, []],
        [qx.ui.form.ToggleButton, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testBasic : function()
    {
      var forms = [
        [qx.ui.basic.Atom, ["Juhu"]],
        [qx.ui.basic.Label, ["Juhu"]],
        [qx.ui.basic.Image, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testContainer : function()
    {
      var forms = [
        [qx.ui.container.Composite, []],
        [qx.ui.container.Resizer, []],
        [qx.ui.container.Scroll, []],
        [qx.ui.container.SlideBar, []],
        [qx.ui.container.Stack, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testControls : function()
    {
      var forms = [
        [qx.ui.control.ColorPopup, []],
        [qx.ui.control.ColorSelector, []],
        [qx.ui.control.DateChooser, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.warn("Disposing " + forms[i][0].classname);
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testEmbeds : function()
    {
      var forms = [
        [qx.ui.embed.Html, ["Juhu <b>Kinners</b>"]],
        [qx.ui.embed.Canvas, []],
        [qx.ui.embed.Iframe, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    }

  }
});
