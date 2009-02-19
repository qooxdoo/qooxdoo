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
      var cellProperties = stringCell.getCellProperties(
        "test<br/>lala", states
      );

      return this.__renderCell(cellProperties);
    },
    
    createNumberCell : function(data)
    {
      var states = {};

      var numberFormat = qx.util.format.NumberFormat.getInstance();
      numberFormat.setMaximumFractionDigits(2);

      var numberCell = new qx.ui.virtual.cell.Number(numberFormat);
      var cellProperties = numberCell.getCellProperties(
        1.2345678, states
      );

      return this.__renderCell(cellProperties);
    },
    
    createDateCell : function(data)
    {
      var states = {};

      var dateFormat = qx.util.format.DateFormat.getDateInstance();

      var dateCell = new qx.ui.virtual.cell.Date(dateFormat);
      var cellProperties = dateCell.getCellProperties(
        new Date(), states
      );

      return this.__renderCell(cellProperties);
    },

    createHtmlCell : function(data)
    {
      var states = {};

      var htmlCell = new qx.ui.virtual.cell.Html;
      var cellProperties = htmlCell.getCellProperties(
        "<b>html</b><i>cell</i>", states
      );

      return this.__renderCell(cellProperties);
    },

    __renderCell : function(cellProperties)
    {

      var htmlEmbed = new qx.ui.embed.Html();
      var styles = cellProperties.style;

      // Set content and apply css classes:
      htmlEmbed.set({
        html : cellProperties.content + "",
        cssClass : cellProperties.classes,
        backgroundColor : "red"
      });

      htmlEmbed.addListener("appear", function(){

        var domElement = htmlEmbed.getContentElement().getDomElement();

        // Apply attributes:
        for(var attribute in cellProperties.attributes)
        {
          htmlEmbed.set(
            domElement,
            attribute,
            cellProperties.attributes[attribute]);
        }

        // Render styles:
        qx.bom.element.Style.setCss(domElement, styles);

      }, this);

      return htmlEmbed;
    }
  }
});