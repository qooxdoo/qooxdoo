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

qx.Class.define("demobrowser.demo.layout.ChildrenHandling_1",
{
  extend : qx.application.Standalone,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      var container = new qx.ui.core.Widget();
      var layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);
      container.setLayout(layout);

      this._hbox = new qx.ui.core.Widget().set({
        height : 100,
        layout : new qx.ui.layout.HBox()
      });

      this._widgets = [];
      var widgetColors = ["green", "blue", "yellow", "black", "orange", "red"];
      for (var i=0; i<widgetColors.length; i++)
      {
        var widget = new qx.ui.core.Widget();
        widget.setBackgroundColor(widgetColors[i]);
        this._hbox.getLayout().add(widget);
        this._widgets.push(widget);
      }
      container.getLayout().add(this._hbox);

      this._grid  = new qx.ui.core.Widget().set({
        height : 100,
        layout : new qx.ui.layout.Grid()
      });

      this._gridWidgets = [];
      for (var i=0; i<widgetColors.length; i++)
      {
        var widget = new qx.ui.core.Widget();
        widget.setBackgroundColor(widgetColors[i]);
        this._grid.getLayout().add(widget, 0, i);
        this._gridWidgets.push(widget);
      }
      container.getLayout().add(this._grid);

      var buttons = new qx.ui.core.Widget();
      buttons.setLayout(new qx.ui.layout.HBox());

      for (var i=0; i<this._widgets.length; i++) {
        buttons.getLayout().add(this.createRemoveButton(this._widgets[i], i));
      }

      container.getLayout().add(buttons);

      doc.add(container, 0, 0);
    },

    createRemoveButton : function(widget, widgetIndex)
    {
      var doRemove = true;
      var button = new qx.ui.form.Button("Remove " + widget.getBackgroundColor());

      button.addListener("execute", function()
      {
        if (doRemove)
        {
          this._hbox.getLayout().remove(widget);
          this._grid.getLayout().remove(this._gridWidgets[widgetIndex]);
          button.setLabel("Add " + widget.getBackgroundColor());
        }
        else
        {
          this._hbox.getLayout().add(widget);
          this._grid.getLayout().add(this._gridWidgets[widgetIndex], 0, widgetIndex);
          button.setLabel("Remove " + widget.getBackgroundColor());
        }

        doRemove = !doRemove;
      }, this);

      return button;
    }
  }
});
