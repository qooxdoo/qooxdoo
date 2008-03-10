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

qx.Class.define("demobrowser.demo.widget.Scrollbar_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("text");
      doc.setBackgroundColor("white");

      var sliders = []

      sliders.push(this._createSliderGroup(new qx.ui.core.ScrollBar().set({
        maximum: 1000,
        value: 100
      })));

      sliders.push(this._createSliderGroup(new qx.ui.slider.Slider().set({
        maximum: 1000,
        value: 100
      })));

      sliders.push(this._createSliderGroup(new qx.ui.slider.Slider().set({
        minimum: -100,
        maximum: 100,
        singleStep: 5,
        wheelStep: 10,
        pageStep: 20,
        value: 0
      })));

      var container = new qx.ui.core.Widget();
      container.setLayout(this._createVerticalLayout(sliders));
      doc.add(container, 20, 60);


      var isHorizontal = false;
      var btn = new qx.ui.form.Button("Toggle orientation");
      doc.add(btn, 20, 10)

      btn.addListener("execute", function()
      {
        var oldLayout = container.getLayout();

        if (isHorizontal) {
          container.setLayout(this._createVerticalLayout(sliders));
        } else {
          container.setLayout(this._createHorizontalLayout(sliders));
        }
        isHorizontal = !isHorizontal;

        if (oldLayout) {
          oldLayout.dispose();
        }
      }, this);

    },

    _createVerticalLayout : function(sliders)
    {
      var grid = new qx.ui.layout.Grid();

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

        grid.add(group.slider, 0, col, {rowSpan: 3});

        grid.add(group.min, 0, col+1);
        grid.add(group.value, 1, col+1);
        grid.add(group.max, 2, col+1);

        grid.setColumnMinWidth(col+1, 80);
        grid.setColumnWidth(col+2, 20);

        col += 3;
      }

      return grid;
    },


    _createHorizontalLayout : function(sliders)
    {
      var grid = new qx.ui.layout.Grid();

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

        grid.add(group.min, row, 0);
        grid.add(group.value, row, 1);
        grid.add(group.max, row, 2);

        grid.add(group.slider, row+1, 0, {colSpan: 3});

        grid.setRowHeight(row+2, 20);

        row += 3;
      }

      return grid;
    },


    _createSliderGroup : function(slider)
    {
      var group = {
        slider: slider,
        min: new qx.ui.basic.Label("" + (slider.getMinimum ? slider.getMinimum() : 0)).set({allowStretchX: false, allowStretchY: false}),
        max: new qx.ui.basic.Label("" + slider.getMaximum()).set({allowStretchX: false, allowStretchY: false}),
        value: new qx.ui.basic.Label("Value: " + slider.getValue()).set({allowStretchX: false, allowStretchY: false})
      }

      slider.addListener("changeValue", function() {
        group.value.setContent("Value: " +  + slider.getValue());
      });

      return group;
    }

  }
});
