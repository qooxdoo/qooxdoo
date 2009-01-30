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

#asset(qx/icon/${qx.icontheme}/16/places/*)
#asset(qx/icon/${qx.icontheme}/22/places/*)
#asset(qx/icon/${qx.icontheme}/32/places/*)
#asset(qx/icon/${qx.icontheme}/48/places/*)
#asset(qx/icon/${qx.icontheme}/64/places/*)
#asset(qx/icon/${qx.icontheme}/128/places/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Gallery",
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
      
      this._pool = {};
      var fontStyles = qx.theme.manager.Font.getInstance().resolve("default").getStyles();
      this._fontCss = qx.bom.element.Style.compile(fontStyles);
      
      this.itemHeight = 70;
      this.itemWidth = 60;
      this.itemCount = 431;
      this.itemPerLine = 1;

      this.items = this._generateItems(this.itemCount);
    
      var widgetWin = this.createGalleryWindow("Gallery (widgets)", true);
      var htmlWin = this.createGalleryWindow("Gallery (HTML)", false);
      htmlWin.moveTo(400, 50);
      
      var prefetch = new qx.ui.virtual.behavior.Prefetch(
        widgetWin.getChildren()[0],
        0, 0, 0, 0,
        200, 300, 600, 800
      ).set({
        interval: 500
      });
    },
    
    
    createGalleryWindow : function(title, useWidgets)
    {
      var win = new qx.ui.window.Window(title).set({
        contentPadding: 0,
        showClose: false,
        showMinimize: false,
        width: 300,
        height: 400
      });
      win.setLayout(new qx.ui.layout.Grow());
      win.moveTo(30, 50);
      win.open();
           
      var scroller = new qx.ui.virtual.core.Scroller(
        1, this.itemPerLine,
        this.itemHeight, this.itemWidth
      ).set({
        scrollbarX: "off",
        scrollbarY: "auto"
      });
      
      scroller.pane.addListener("resize", this._onPaneResize, this);
      
      if (useWidgets) {
        scroller.pane.addLayer(new qx.ui.virtual.layer.WidgetCell(this));
      } else {
        scroller.pane.addLayer(new qx.ui.virtual.layer.HtmlCell(this));
      }
        
      win.add(scroller);
      return win;
    },
    
    
    _onPaneResize : function(e)
    {
      var pane = e.getTarget();
      var width = e.getData().width;
      
      var colCount = Math.floor(width/this.itemWidth);
      if (colCount == this.itemsPerLine) {
        return;
      }
      this.itemPerLine = colCount;
      var rowCount = Math.ceil(this.itemCount/colCount);
      
      pane.columnConfig.setItemCount(colCount);
      pane.rowConfig.setItemCount(rowCount);
      
      pane.fullUpdate();
    },
    
    
    getCellHtml : function(row, col, left, top, width, height)
    {
      var itemData = this.items[row * this.itemPerLine + col];
      
      if (!itemData) {
        return "";
      }
      
      var html = [
        "<div style='",
        "float: left;",
        "text-align: center;",
        this._fontCss,
        "width:", width, "px;",
        "height:", height, "px;",
        "'>",

        "<img src='", itemData.icon, "'></img>",
        "<br>",
        
        itemData.label,
        "</div>"                  
      ];
      return html.join("");
    },
    
    
    getCellWidget : function(row, column)
    {     
      var itemData = this.items[row * this.itemPerLine + column];
      
      if (!itemData) {
        return new qx.ui.core.Spacer();
      }
      
      var pool = this._pool[itemData.icon];
      if (!pool)
      {
        pool = [];
        this._pool[itemData.icon] = pool;        
      }
      
      var widget = pool.pop() || new qx.ui.basic.Atom().set({
        iconPosition: "top"
      });
      
      widget.set(itemData);

      return widget;
    },
    
    
    poolCellWidget : function(widget)
    {
      if (widget instanceof qx.ui.basic.Atom) 
      {
        this._pool[widget.getIcon()].push(widget);
      }
    },    
    
    
    _generateItems : function(count)
    {
      var items = [];
      var iconImages = [
        "folder.png",
        "user-trash.png",
        "network-server.png",
        "network-workgroup.png",
        "user-desktop.png"
      ];
      
      var aliasManager = qx.util.AliasManager.getInstance();
      var resourceManager = qx.util.ResourceManager;
      
      for (var i=0; i<count; i++)
      {
        var icon = "icon/32/places/" + iconImages[Math.floor(Math.random() * iconImages.length)];
        resolved = aliasManager.resolve(icon);
        url = resourceManager.toUri(resolved);
        
        items[i] = {
          label: "Icon #" + (i+1),
          icon: url
        };
      }
      
      return items;
    }
  }
});
