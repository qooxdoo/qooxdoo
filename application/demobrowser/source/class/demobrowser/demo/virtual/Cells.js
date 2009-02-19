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

qx.Class.define("demobrowser.demo.virtual.Cells",
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
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(5, 5);
      var container = new qx.ui.container.Composite(layout);    

      container.add(this.createStringCell(), {row : 0, column : 0 });
      container.add(this.createNumberCell(), {row : 0, column : 1 });
      container.add(this.createDateCell(), {row : 0, column : 2 });
      container.add(this.createHtmlCell(), {row : 1, column : 0 });

      this.getRoot().add(container, {edge : 0});
    },

    createStringCell : function(data)
    {
      var states = {};
      var stringCell = new qx.ui.virtual.cell.String;
      return this.__renderCell(stringCell, "test<br/>lala", states);
    },
    
    createNumberCell : function(data)
    {
      var states = {};

      var numberFormat = qx.util.format.NumberFormat.getInstance();
      numberFormat.setMaximumFractionDigits(2);
      var numberCell = new qx.ui.virtual.cell.Number(numberFormat);

      return this.__renderCell(numberCell, 1.2345678, states);
    },
    
    createDateCell : function(data)
    {
      var states = {};

      var dateFormat = qx.util.format.DateFormat.getDateInstance();
      var dateCell = new qx.ui.virtual.cell.Date(dateFormat);

      return this.__renderCell(dateCell, new Date(), states);
    },

    createHtmlCell : function(data)
    {
      var states = {};
      var htmlCell = new qx.ui.virtual.cell.Html;

      return this.__renderCell(htmlCell, "<b>html</b><i>cell</i>", states);
    },


    _getCellSizeStyle : function(width, height, insetX, insetY)
    {
      var style = "";
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        width -= insetX;
        height -= insetY;
      }

      style += "width:" +  width + "px;";
      style += "height:" + height + "px;";

      return style;
    },
    

    __renderCell : function(cell, value, states)
    {
      var width = 100;
      var height = 40;

      var embed = new qx.ui.embed.Html().set({
        width: width,
        height: height,
        decorator : "main"
      });
      var cellProperties = cell.getCellProperties(value, states);
      var insets = cellProperties.insets;
      
      var html = [
        "<div ",
        "style='", 
        this._getCellSizeStyle(width, height, insets[0], insets[1]),
        cellProperties.style, "' ",
        "class='", cellProperties.classes, "' ",
        cellProperties.attributes, ">",
        cellProperties.content,
        "</div>"
      ].join("");
      
      embed.setHtml(html);
      return embed;
    }
  }
});