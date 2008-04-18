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

qx.Class.define("demobrowser.demo.widget.Slider_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var sliders = []

      sliders.push(this._createSliderGroup(new qx.ui.slider.Slider().set({
        maximum: 1000,
        value: 100,
        backgroundColor : "white",
        decorator : "black"
      })));

      sliders.push(this._createSliderGroup(new qx.ui.slider.Slider().set({
        minimum: -100,
        maximum: 100,
        singleStep: 5,
        wheelStep: 10,
        pageStep: 20,
        value: 0,
        backgroundColor: "white",
        decorator : "black"
      })));

      var container = this._createVerticalLayout(sliders);
      this.getRoot().add(container, {left:20, top:60});


      var isHorizontal = false;
      var btn = new qx.ui.form.Button("Toggle orientation");
      this.getRoot().add(btn, {left:20, top:10});

      btn.addListener("execute", function()
      {
        if (isHorizontal) {
          container.setLayout(this._createVerticalLayout(sliders));
        } else {
          container.setLayout(this._createHorizontalLayout(sliders));
        }
        isHorizontal = !isHorizontal;
      }, this);

    },

    _createVerticalLayout : function(sliders)
    {
      var grid = new qx.ui.layout.Grid();
      var container = new qx.ui.container.Composite(grid);

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

        container.add(group.slider, {row:0,col:col,rowSpan: 3});

        container.add(group.min, {row:0, col:col+1});
        container.add(group.value, {row:1, col:col+1});
        container.add(group.max, {row:2, col:col+1});

        grid.setColumnMinWidth(col+1, 80);
        grid.setColumnWidth(col+2, 20);

        col += 3;
      }

      return container;
    },


    _createHorizontalLayout : function(sliders)
    {
      var grid = new qx.ui.layout.Grid();
      var container = new qx.ui.container.Composite(grid);

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

        container.add(group.min, {row:row, col:0});
        container.add(group.value, {row:row, col:1});
        container.add(group.max, {row:row, col:2});

        container.add(group.slider, {row:row+1, col:0, colSpan: 3});

        grid.setRowHeight(row+2, 20);

        row += 3;
      }

      return container;
    },


    _createSliderGroup : function(slider)
    {
      var group = {
        slider: slider,
        min: new qx.ui.basic.Label("" + (slider.getMinimum ? slider.getMinimum() : 0)).set({allowStretchX: false, allowStretchY: false}),
        max: new qx.ui.basic.Label("" + slider.getMaximum()).set({allowStretchX: false, allowStretchY: false}),
        value: new qx.ui.basic.Label("Value: " + slider.getValue()).set({allowStretchX: false, allowStretchY: false})
      }

      slider.addListener("changeValue", function(e) {
        group.value.setContent("Value: " + slider.getValue());
      });

      return group;
    }

  }
});
