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

qx.Class.define("demobrowser.demo.virtual.ThemedCell",
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
      
      qx.theme.manager.Appearance.getInstance().setTheme(demo.CellAppearance);

      var layout = new qx.ui.layout.VBox(5);
      var container = new qx.ui.container.Composite(layout);

      var cell = new qx.ui.virtual.cell.Cell();
      
      CELL = cell;
      
      container.add(this.__renderCell(cell, 10, {}));
      container.add(this.__renderCell(cell, 10, {selected: 1}));

      cell.setTextColor("yellow");
      container.add(this.__renderCell(cell, 10, {selected: 1}));
      cell.resetTextColor();

      cell.setPaddingRight(20);
      cell.setTextAlign("right");
      container.add(this.__renderCell(cell, 10, {selected: 1}));
      cell.resetPaddingRight();
      cell.resetTextAlign();
      
      this.getRoot().add(container, {edge : 0});
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
      var embed = new qx.ui.embed.Html().set({
        width: 60,
        height: 20
      });
      var cellProperties = cell.getCellProperties(value, states);
      var insets = cellProperties.insets;
      
      var html = [
        "<div ",
        "style='", 
        this._getCellSizeStyle(60, 20, insets[0], insets[1]),
        cellProperties.style, "' ",
        "class='", cellProperties.classes, "' ",
        cellProperties.attributes, ">",
        cellProperties.content,
        "</div>"
      ].join("");
      
      console.log(html);
      
      embed.setHtml(html);
      return embed;
    }
  }
});


qx.Theme.define("demo.CellAppearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {    
    "cell" :
    {
      style : function(states)
      {
        return {
          backgroundColor: states.selected ?
            "table-row-background-selected" :
            "table-row-background-even",
          textColor: states.selected ? "text-selected" : "text-label",
          padding: [3, 6]
        }
      }
    }    
  }
});

