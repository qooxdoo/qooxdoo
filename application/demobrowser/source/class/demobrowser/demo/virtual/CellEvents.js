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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.CellEvents",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {



    events :
    {
      /**See {@link qx.ui.table.Table#cellClick}.*/
      "cellClick" : "qx.ui.table.pane.CellEvent",
      /**
       * Dispatched when the context menu is needed in a data cell
       */
      "cellContextmenu" : "qx.ui.table.pane.CellEvent"
    },

    main : function()
    {
      // Call super class
      this.base(arguments);


      var scroller = new qx.ui.virtual.core.Scroller(
        20, 20,
        40, 40
      );
      this.layer = new qx.test.ui.virtual.layer.LayerSimple(this);

      var pane = scroller.getPane();

      scroller.addListener("cellClick", this._onCellClick, this);
      scroller.addListener("cellContextmenu", this._onContextMenu, this);
      scroller.addListener("cellDblclick", this._onDblclickPane, this);

      pane.addLayer(this.layer);

      this.__scroller = scroller;
      this.__pane = pane;

      this.getRoot().add(scroller, {left : 20, top : 10});
    },

    _onCellClick : function(e)
    {
      console.warn("_onCellClick: ", e);
    },

    _onContextMenu : function(e)
    {
      console.warn("_onContextMenu: ", e);
    },


    _onDblclickPane : function(e)
    {
      console.warn("_onDblclickPane: ", e);
    }


  }
});