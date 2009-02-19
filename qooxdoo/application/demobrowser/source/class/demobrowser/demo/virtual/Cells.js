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

      var layout = new qx.ui.layout.Grid(5);
      var container = new qx.ui.container.Composite(layout);    

      container.add(this.testDefaultCellString(), {row : 0, column : 0 });
      container.add(this.testDefaultCellNumber(), {row : 0, column : 1 });
      container.add(this.testDefaultCellDate(), {row : 0, column : 2 });

      this.getRoot().add(container, {edge : 0});
    },

    testDefaultCellString : function(data)
    {
      var states = {};
      var defaultCell = new qx.ui.virtual.cell.String;
      var cellProperties = defaultCell.getCellProperties(
        "test<br/>lala", states
      );

      return this.__renderCell(cellProperties);
    },
    
    testDefaultCellNumber : function(data)
    {
      var states = {};

      var numberFormat = qx.util.format.NumberFormat.getInstance();
      numberFormat.setMaximumFractionDigits(2);

      var defaultCell = new qx.ui.virtual.cell.Number(numberFormat);
      var cellProperties = defaultCell.getCellProperties(
        1.2345678, states
      );

      return this.__renderCell(cellProperties);
    },
    
    testDefaultCellDate : function(data)
    {
      var states = {};

      var dateFormat = qx.util.format.DateFormat.getDateInstance();

      var defaultCell = new qx.ui.virtual.cell.Date(dateFormat);
      var cellProperties = defaultCell.getCellProperties(
        new Date(), states
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