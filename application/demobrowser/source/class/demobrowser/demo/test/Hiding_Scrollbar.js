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

/**
 * @tag noPlayground
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.Hiding_Scrollbar",
{
  extend : qx.application.Standalone,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);

      var table = new qx.ui.table.Table();
      table.setStatusBarVisible(false);
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID" ]);
      table.setTableModel(tableModel);
      var data = [["a"], ["b"], ["c"], ["d"], ["e"]];
      tableModel.setData(data);

      // choose a hight where the horizontal scrollbar does not fit in
      table.setHeight(50);
      table.setWidth(150);

      this.getRoot().add(table, {left: 30, top: 30});


      var hSlider = new qx.ui.form.Slider("vertical");
      hSlider.set({
        height: 100,
        minimum: 40,
        maximum: 130,
        value: 50
      });
      hSlider.bind("value", table, "height");
      this.getRoot().add(hSlider, {top: 20});

      var vSlider = new qx.ui.form.Slider("horizontal");
      vSlider.set({
        width: 100,
        minimum: 30,
        maximum: 150,
        value: 150
      });
      vSlider.bind("value", table, "width");
      this.getRoot().add(vSlider, {left: 20});

    }
  }
});
