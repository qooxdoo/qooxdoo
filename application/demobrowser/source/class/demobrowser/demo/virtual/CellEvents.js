/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @tag test
 */
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

    main : function()
    {
      // Call super class
      this.base(arguments);

      var scroller = new qx.ui.virtual.core.Scroller(
        20, 20,
        40, 40
      ).set({
        width : 400,
        height : 300
      });
      this.layer = new qx.test.ui.virtual.layer.LayerSimple(this);

      var pane = scroller.getPane();

      pane.addListener("cellTap", this._onCellTap, this);
      pane.addListener("cellContextmenu", this._onContextMenu, this);
      pane.addListener("cellDbltap", this._onDbltapPane, this);

      pane.addLayer(this.layer);


      this.logger = new qx.ui.embed.Html().set({
        width : 400,
        height : 300,
        html : "",
        decorator : "main"
      });

      this.getRoot().add(scroller, {left : 20, top : 10});
      this.getRoot().add(this.logger, {left : 450, top : 10});
    },

    _onCellTap : function(e)
    {
      var msg = '<p style="color:green;">You tappeded on cell ' + e.getRow() + ' / ' + e.getColumn() + '</p>';
      this.__fillLog(msg);
    },

    _onContextMenu : function(e)
    {
      var msg = '<p style="color:yellow;">You rightclicked cell ' + e.getRow() + ' / ' + e.getColumn() + '</p>';
      this.__fillLog(msg);
    },


    _onDbltapPane : function(e)
    {
      var msg = '<p style="color:red;">You double tapped cell ' + e.getRow() + ' / ' + e.getColumn() + '</p>';
      this.__fillLog(msg);
    },

    __fillLog : function(msg) {
      this.logger.setHtml(this.logger.getHtml() + msg)
    }

  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("layer", "logger");
  }
});