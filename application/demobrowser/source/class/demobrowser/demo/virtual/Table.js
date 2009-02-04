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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(custom/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Table",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      var scroller = new qx.ui.virtual.core.Scroller(10000, 10000, 20, 100);
      // change all cell sizes!!
      for (var i=0; i<10000; i++)
      {
        scroller.getPane().getRowConfig().setItemSize(i, 20 + Math.round(Math.random() * 40));
        scroller.getPane().columnConfig.setItemSize(i, 50 + Math.round(Math.random() * 80));
      }
      this.getRoot().add(scroller, {edge: 20});
      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("vertical"));      
      scroller.getPane().addLayer(new qx.ui.virtual.layer.HtmlCell(this));
    },
    
    
    getCellHtml : function(row, col, left, top, width, height)
    {    
      var html = [
        "<div style='",
        "float: left;",
        "text-align: center;",
        this._fontCss,
        "width:", width, "px;",
        "height:", height, "px;",
        "'>",        
        col + "x" + row,
        "</div>"                  
      ];
      return html.join("");
    }    
  }
});
