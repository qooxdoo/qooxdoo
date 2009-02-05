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
      "cellClick" : "qx.ui.table.pane.CellEvent"
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

      pane.addListener("mousewheel", this._onMousewheel, this);
      pane.addListener("mousemove", this._onMousemovePane, this);
      pane.addListener("mousedown", this._onMousedownPane, this);
      pane.addListener("mouseup", this._onMouseupPane, this);
      pane.addListener("click", this._onClickPane, this);
      pane.addListener("contextmenu", this._onContextMenu, this);
      pane.addListener("dblclick", this._onDblclickPane, this);

      pane.addLayer(this.layer);

      this.__scroller = scroller;
      this.__pane = pane;

//      this.addListener("cellClick", this._onCellClick, this);

      this.getRoot().add(scroller, {left : 20, top : 10});
    },

    _onCellClick : function(e)
    {
      console.warn(e)
    },

    _onMousewheel : function(e)
    {
      console.info(e);
    },


    _onMousemovePane : function(e)
    {
      // console.info(e);
    },


    _onMousedownPane : function(e)
    {
      // console.info(e);
    },


    _onMouseupPane : function(e)
    {
      // console.info(e);
    },


    _onClickPane : function(e)
    {
      var coords = this.__pane.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop())
      console.info(coords)
      this.fireEvent("cellClick", qx.ui.table.pane.CellEvent, [this, e, coords.row, coords.column], true);
    },


    _onContextMenu : function(e)
    {
      console.info(e);
    },


    _onDblclickPane : function(e)
    {
      console.info(e);
    }

  }
});