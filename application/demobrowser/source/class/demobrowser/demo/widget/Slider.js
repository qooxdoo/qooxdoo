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

qx.Class.define("demobrowser.demo.widget.Slider",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.getRoot().add(this._createVerticalLayout(), {left:20, top:20});
      this.getRoot().add(this._createHorizontalLayout(), {left:20, top:340});
    },

    _createVerticalLayout : function()
    {
      var sliders = []

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        maximum: 1000,
        value: 100
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: -100,
        maximum: 100,
        singleStep: 5,
        pageStep: 20,
        value: 0
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: -600,
        maximum: -200,
        singleStep: 10,
        pageStep: 50,
        value: -300
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: 25,
        maximum: 75,
        singleStep: 5,
        pageStep: 10,
        value: 25
      })));

      var grid = new qx.ui.layout.Grid();
      var container = new qx.ui.container.Composite(grid);

      container.setPadding(20);
      container.setWidth(530);
      container.setHeight(300);

      grid.setSpacing(5);
      grid.setRowFlex(0, 1);
      grid.setRowFlex(1, 1);
      grid.setRowFlex(2, 1);

      grid.setRowAlign(0, "left", "top");
      grid.setRowAlign(1, "left", "middle");
      grid.setRowAlign(2, "left", "bottom");

      var col = 0;

      for (var i=0; i<sliders.length; i++)
      {
        var group = sliders[i];
        group.slider.setOrientation("vertical");

        container.add(group.slider, {row: 0, column: col, rowSpan: 3, colSpan: 1});

        container.add(group.min, {row: 0, column: col+1});
        container.add(group.value, {row: 1, column: col+1});
        container.add(group.max, {row: 2, column: col+1});

        grid.setColumnMinWidth(col+1, 80);
        grid.setColumnWidth(col+2, 20);

        col += 3;
      }

      return container;
    },


    _createHorizontalLayout : function()
    {
      var sliders = []

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        maximum: 1000,
        value: 100
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: -100,
        maximum: 100,
        singleStep: 5,
        pageStep: 20,
        value: 0
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: -600,
        maximum: -200,
        singleStep: 10,
        pageStep: 50,
        value: -300
      })));

      sliders.push(this._createSliderGroup(new qx.ui.form.Slider().set({
        minimum: 25,
        maximum: 75,
        singleStep: 5,
        pageStep: 10,
        value: 25
      })));

      var grid = new qx.ui.layout.Grid();
      var container = new qx.ui.container.Composite(grid);

      container.setPadding(20);
      container.setWidth(400);
      container.setHeight(400);

      grid.setSpacing(5);
      grid.setColumnFlex(0, 1);
      grid.setColumnFlex(1, 1);
      grid.setColumnFlex(2, 1);

      grid.setColumnAlign(0, "left", "bottom");
      grid.setColumnAlign(1, "center", "bottom");
      grid.setColumnAlign(2, "right", "bottom");

      var row = 0;
      for (var i=0; i<sliders.length; i++)
      {
        var group = sliders[i];
        group.slider.setOrientation("horizontal");

        group.value.setWidth(100);
        group.value.setTextAlign("center");

        container.add(group.min, {row: row, column: 0});
        container.add(group.value, {row: row, column: 1});
        container.add(group.max, {row: row, column: 2});

        container.add(group.slider, {row: row+1, column: 0, colSpan: 3, rowSpan: 1});

        grid.setRowHeight(row+2, 20);

        row += 3;
      }

      return container;
    },


    _createSliderGroup : function(slider)
    {
      var group =
      {
        slider: slider,
        min: new qx.ui.basic.Label("Min: " + slider.getMinimum().toString()),
        max: new qx.ui.basic.Label("Max: " + slider.getMaximum().toString()),
        value: new qx.ui.basic.Label(slider.getValue().toString())
      };

      slider.addListener("changeValue", function(e) {
        group.value.setContent(slider.getValue().toString());
      });

      return group;
    }

  }
});
