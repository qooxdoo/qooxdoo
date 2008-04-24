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

qx.Class.define("demobrowser.demo.layout.LayoutEditor_HBox_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._addBoxLayout();
      this._addControls();

      this._selectedWidget = this._container.getChildren()[0];
    },


    _getWidget : function(color)
    {
      var widget = new qx.ui.basic.Label(color).set({
        backgroundColor: color,
        allowGrowX: true,
        allowGrowY: true,
        width: 100,
        height: 50
      });

      widget.addListener("click", this._onSelectWidget, this);
      return widget;
    },


    _onSelectWidget : function(e)
    {
      var widget = e.getTarget();
      this._layoutControls.setSelected(widget);

      this._widgetIndicator.setBackgroundColor(widget.getBackgroundColor());
      this._widgetIndicator.setDecorator(widget.getDecorator());
    },


    _addBoxLayout : function()
    {
      this._container = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
        decorator: "black",
        padding: 5,
        backgroundColor: "navy"
      });
      this._container.addListener("click", this._onSelectWidget, this);

      var colors = ["red", "yellow", "green"];

      for (var i=0; i<colors.length; i++) {
        this._container.add(this._getWidget(colors[i]));
      }

      this.getRoot().add(this._container, {left: 10, top: 30});
    },


    _addControls : function()
    {
      var container = new qx.ui.groupbox.GroupBox();

      container.getPane().setPadding(0);
      container.getPane().setLayout(new qx.ui.layout.Canvas())
      var scroller = new qx.ui.core.ScrollArea();
      container.getPane().add(scroller, {top: 0, left: 0, right: 0, bottom: 0});

      var pane = new qx.ui.container.Composite().set({
        padding: 5
      });
      scroller.setContent(pane);

      var layout = new qx.ui.layout.Grid();
      layout.setVerticalSpacing(5);
      layout.setHorizontalSpacing(10);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnFlex(1, 1);
      pane.setLayout(layout);

      var row = 0;

      pane.add(new qx.ui.basic.Label("Widget Properties").set({
        font: "bold",
        allowGrowX: true,
        padding: [1, 0, 5, 0]
      }), {row: row++, column: 0, colSpan: 2});

      this._widgetIndicator = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        height: 30
      });

      pane.add(new qx.ui.basic.Label("Selected Widget").set({
        paddingTop: 4
      }), {row: row, column: 0});
      pane._add(this._widgetIndicator, {row: row++, column: 1});


      var props = qx.lang.Object.copy(demobrowser.demo.layout.PropertyEditor.WIDGET_PROPERTIES);
      props.content = {type:"string", nullable: true};

      this._layoutControls = new demobrowser.demo.layout.PropertyEditor(props);
      this._layoutControls.setSelected(this._container.getChildren()[0]);
      pane.add(this._layoutControls, {row: row++, column: 0, colSpan: 2});

      pane.add(new qx.ui.basic.Label("Layout Properties").set({
        font: "bold",
        allowGrowX: true,
        padding: [5, 0, 5, 0]
      }), {row: row++, column: 0, colSpan: 2});

      var containerEditor = new demobrowser.demo.layout.PropertyEditor(demobrowser.demo.layout.PropertyEditor.HBOX_PROPERTIES);
      containerEditor.setSelected(this._container.getLayout());
      pane.add(containerEditor, {row: row++, column: 0, colSpan: 2});

      this.getRoot().add(container, {right: 10, top: 40, bottom: 10});

    }

  }
});
