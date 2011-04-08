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
#ignore(demobrowser.demo.test.DummyTable)
************************************************************************ */

/**
 * @tag noPlayground
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.Table_Scroller",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var table = new demobrowser.demo.test.DummyTable();
      this.getRoot().add(table, {left: 10, top: 10});
    }
  }
});


/*
 * PLEASE NOTE:
 * For demonstration purposes the following class is added to the same file as
 * the application class. For a regular qooxdoo application each class must live
 * in a file of its own. You may neglect any warnings when generating this demo.
 */

qx.Class.define("demobrowser.demo.test.DummyTable",
{
  extend : qx.ui.container.Composite,
  include : [demobrowser.demo.table.MUtil],

  construct : function()
  {
    this.base(arguments, new qx.ui.layout.Canvas());
    this.setAppearance("table");

    this.set({
      decorator : "main",
      backgroundColor : "#FFE",
      width: 600,
      height: 400
    });

    var scroller = new qx.ui.table.pane.Scroller(this.getTableMock());
    this.add(scroller, {edge: 0});

    var paneModel = new qx.ui.table.pane.Model(this.getColumnModelMock());
    scroller.setTablePaneModel(paneModel);

    scroller._onPaneModelChanged();

    scroller.getTablePane().setVisibleRowCount(20);
    scroller.getTablePane()._updateAllRows();
  }
});

