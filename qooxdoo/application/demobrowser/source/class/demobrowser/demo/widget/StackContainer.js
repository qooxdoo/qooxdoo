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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/22/actions/go-next.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.StackContainer",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.addSimpleStack();
      this.addDynamicStack();
    },


    addSimpleStack : function()
    {
      var container = new qx.ui.container.Stack();
      container.setDecorator("main");
      container.setWidth(200);
      container.setHeight(120);
      this.getRoot().add(container, {left:20, top:20});

      var box = new qx.ui.container.Composite((new qx.ui.layout.HBox).set({spacing:4}));
      var prev = new qx.ui.form.Button("Previous", "icon/22/actions/go-previous.png");
      var next = new qx.ui.form.Button("Next", "icon/22/actions/go-next.png");
      box.add(prev);
      box.add(next);
      this.getRoot().add(box, {left:20, top: 150});

      prev.addListener("execute", container.previous, container);
      next.addListener("execute", container.next, container);



      var colors = [ "red", "gray", "blue", "orange", "teal", "yellow", "green" ];
      var widget;

      for (var i=0; i<colors.length; i++)
      {
        widget = new qx.ui.core.Widget;
        widget.setBackgroundColor(colors[i]);

        container.add(widget);
      }

      container.addListener("change", function(e) {
        this.debug("Selected: " + e.getData().getBackgroundColor());
      });
    },

    addDynamicStack : function()
    {
      var container = new qx.ui.container.Stack();
      container.setDecorator("main");
      container.setDynamic(true);
      this.getRoot().add(container, {left:250, top:20});

      var box = new qx.ui.container.Composite((new qx.ui.layout.HBox).set({spacing:4}));
      var prev = new qx.ui.form.Button("Previous", "icon/22/actions/go-previous.png");
      var next = new qx.ui.form.Button("Next", "icon/22/actions/go-next.png");
      box.add(prev);
      box.add(next);
      this.getRoot().add(box, {left:250, top: 150});

      prev.addListener("execute", container.previous, container);
      next.addListener("execute", container.next, container);



      var colors = [ "red", "gray", "blue", "orange", "teal", "yellow", "green" ];
      var widget;

      for (var i=0; i<colors.length; i++)
      {
        widget = new qx.ui.core.Widget;
        widget.setBackgroundColor(colors[i]);
        widget.setWidth((Math.round(i/2)+1)*50);
        widget.setHeight((Math.round(i/3)+1)*40);

        container.add(widget);
      }

      container.addListener("change", function(e)
      {
        var selected = e.getData();
        this.debug("Selected: " + selected.getBackgroundColor() + " (" + selected.getWidth() + "x" + selected.getHeight() + ")");
      });

      container.addListener("resize", function(e)
      {
        var bounds = this.getBounds();
        this.debug("Resize to: " + bounds.width + "x" + bounds.height);
      });
    }
  }
});
