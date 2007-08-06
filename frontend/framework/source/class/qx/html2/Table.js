qx.Class.define("qx.html2.Table",
{
  extend : qx.core.Object,
  
  construct : function(layout, data)
  {
    this._layout = layout;
    this._data = data;
    
    this._rowPosition = 0;
    this._rowNumber = 25;
    this._rowHeight = 16;
    this._rowCache = [];
    
    this._height = 400;
    this._width = 600;
    
    this._onscrollWrapper = qx.lang.Function.bind(this._onscroll, this);
    
    this._init();
    this._configure();
    this._render();
  },
  
  
  members : 
  {
    getElement : function()
    {
      return this._root;
    },
    
    _init : function()
    {
      this._root = document.createElement("div");
      this._root.style.position = "absolute";
      
      // Create table
      this._table = document.createElement("table");
      this._body = document.createElement("tbody");
      this._table.appendChild(this._body);
      
      // Create and configure scrollarea
      this._scrollarea = document.createElement("div");
      this._scrollhelper = document.createElement("div");
      this._scrollarea.onscroll = this._onscrollWrapper;
      this._scrollarea.appendChild(this._scrollhelper);
      
      // Fill root
      this._root.appendChild(this._table);
      this._root.appendChild(this._scrollarea);
    },
    
    _configure : function()
    {
      // Configure table
      this._table.cellSpacing = this._table.cellPadding = 0;
      this._table.style.left = "0px";
      this._table.style.top = "0px";
      this._table.style.width = this._width + "px";
      this._table.style.height = this._height + "px";
      this._table.style.border = "2px solid black";
      
      // Configure scrollarea
      this._scrollarea.style.overflowY = "scroll";
      this._scrollarea.style.position = "absolute";
      this._scrollarea.style.left = this._width + "px";
      this._scrollarea.style.top = "0px";
      this._scrollarea.style.height = this._height + "px";
      this._scrollarea.style.width = "20px";
      
      // Configure scrollhelper
      this._scrollhelper.style.height = (this._rowHeight * this._data.length) + "px";
      this._scrollhelper.style.width = "1px";
      this._scrollhelper.style.visibility = "hidden";
    },
    
    _render : function()
    {
      var html = [];
      
      var pos = this._rowPosition;
      var nr = this._rowNumber;
      
      var layout = this._layout;
      var data = this._data;
      
      for (var i=pos, l=pos+nr; i<l; i++)
      {
        html.push("<tr>");
        
        for (var key in layout)
        {
          html.push("<td>", data[i][key], "</td>");
        }
        
        html.push("</tr>");
      }
      
      this._body.innerHTML = html.join("");
    },
    
    _onscroll : function(e)
    {
      this._rowPosition = Math.round(this._scrollarea.scrollTop/this._rowHeight);
      this._render();
    }
    
    
    
  }
});
