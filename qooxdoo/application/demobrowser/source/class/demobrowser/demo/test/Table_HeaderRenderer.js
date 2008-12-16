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

qx.Class.define("demobrowser.demo.test.Table_HeaderRenderer",
{
  extend : qx.application.Standalone,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.setUp();
      this.testDefaultRenderer();
      this.testIconRenderer();
    },


    setUp : function()
    {
      this._container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.getRoot().add(this._container, { left : 20, top: 20});
    },


    testDefaultRenderer : function()
    {
      var renderer = new qx.ui.table.headerrenderer.Default();

      var cellDataOptions =
      {
        name : ["Name"],
        col : [1],
        xPos : [2],
        editable : [true, false],
        sorted : [true, false],
        sortedAscending : [true, false]
      }

      var container = this._getNewHeaderContainer()
      this.permute(cellDataOptions, function(cellData)
      {
        var header = renderer.createHeaderCell(cellData);
        container.add(header);
        renderer.updateHeaderCell(cellData, header);
      });
    },


    testDefaultRenderer : function()
    {
      var renderer = new qx.ui.table.headerrenderer.Default();
      renderer.setToolTip("tool tip");

      var cellDataOptions =
      {
        name : ["Name"],
        col : [1],
        xPos : [2],
        editable : [true, false],
        sorted : [true, false],
        sortedAscending : [true, false]
      }

      var container = this._getNewHeaderContainer()
      this.permute(cellDataOptions, function(cellData)
      {
        var header = renderer.createHeaderCell(cellData);
        container.add(header);
        renderer.updateHeaderCell(cellData, header);
      });
    },


    testIconRenderer : function()
    {
      var renderer = new qx.ui.table.headerrenderer.Icon("icon/16/apps/internet-feed-reader.png");
      renderer.setToolTip("tool tip");
      //renderer.seIconUrl("icon/16/apps/internet-feed-reader.png");

      var cellDataOptions =
      {
        name : ["Name"],
        col : [1],
        xPos : [2],
        editable : [true, false],
        sorted : [true, false],
        sortedAscending : [true, false]
      }

      var container = this._getNewHeaderContainer()
      this.permute(cellDataOptions, function(cellData)
      {
        var header = renderer.createHeaderCell(cellData);
        container.add(header);
        renderer.updateHeaderCell(cellData, header);
      });
    },

    _getNewHeaderContainer : function()
    {
      var headerContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));

      headerContainer.addListener("mouseover" ,function(e) {
        e.getTarget().addState("hovered");
      });

      headerContainer.addListener("mouseout" ,function(e) {
        e.getTarget().removeState("hovered");
      });

      this._container.add(headerContainer);
      return headerContainer;
    }
  }
});
