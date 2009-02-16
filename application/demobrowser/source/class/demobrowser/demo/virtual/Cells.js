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
      var defaultCell = this.testDefaultCell();
      
      
      container.add(defaultCell, {row : 0, column : 0 });

      this.getRoot().add(container, {edge : 0});
    },

    testDefaultCell : function(data)
    {
      var states = {};
      var defaultCell = new qx.ui.virtual.cell.Default;
      var cellProperties = defaultCell.getCellProperties(
        "test", states
      );

      var htmlEmbed = new qx.ui.embed.Html();

      // Set content and apply css classes:
      htmlEmbed.set({
        html : cellProperties.content,
        cssClass : cellProperties.classes
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
        qx.bom.element.Style.setCss(domElement, cellProperties.style);

        // Apply insets:
        for(var inset in cellProperties.insets)
        {
          // TODO:
        }

      }, this);
      
      return htmlEmbed;
    }
  }
});