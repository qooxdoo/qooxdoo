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

#asset(qx/icon/${qx.icontheme}/16/apps/internet-feed-reader.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Table_Header",
{
  extend : qx.application.Standalone,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);

      var header = new qx.ui.table.pane.Header(this.getScrollerMock());
      this.getRoot().add(header, {left: 10, top: 10});

      //

      header.onPaneModelChanged();
      header.setColumnWidth(0, 150);

      header.addListener("mouseover", function(e)
      {
        var target = e.getTarget();
        if (target instanceof qx.ui.table.headerrenderer.HeaderCell)
        {
          var col = header._indexOf(target);
          header.setMouseOverColumn(col);
        }
      });

      var btnShowMove = new qx.ui.form.ToggleButton("Show move feedback");
      this.getRoot().add(btnShowMove, {left: 20, top: 100});
      btnShowMove.addListener("changeChecked", function(e)
      {
        var checked = e.getData();
        if (checked)
        {
          btnShowMove.setLabel("Hide move feedback");
          header.showColumnMoveFeedback(1, 50);
        }
        else
        {
          btnShowMove.setLabel("Show move feedback");
          header.hideColumnMoveFeedback();
        }
      });

      var btnCompleteUpdate = new qx.ui.form.Button("Complete update");
      this.getRoot().add(btnCompleteUpdate, {left: 20, top: 140});
      btnCompleteUpdate.addListener("execute", function() {
        header.onPaneModelChanged();
      });

    }
  }
});
