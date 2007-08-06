qx.Class.define("qx.html2.Table",
{
  extend : qx.core.Object,
  
  construct : function(layout, data)
  {
    this._layout = layout;
    this._data = data;
    
    this._appliedRowPosition = 0;
    this._rowPosition = 0;
    this._rowNumber = 25;
    this._rowHeight = 16;
    this._rowCache = [];
    
    this._scrollbarWidth = 18;
    
    this._scrollTimeout = 50;
    this._borderWidthX = 2;
    this._borderWidthY = 2;
    
    this._height = 400;
    this._width = 600;
    
    this._onscrollWrapper = qx.lang.Function.bind(this._onscroll, this);
    this._onintervalWrapper = qx.lang.Function.bind(this._oninterval, this);
    this._helperInterval = window.setInterval(this._onintervalWrapper, this._scrollTimeout);
    
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
      
      // Create table frame
      this._frame = document.createElement("div");
      
      // Create and configure scrollarea
      this._scrollarea = document.createElement("div");
      this._scrollhelper = document.createElement("div");
      this._scrollarea.onscroll = this._onscrollWrapper;
      this._scrollarea.appendChild(this._scrollhelper);
      
      // Fill root
      this._root.appendChild(this._frame);
      this._root.appendChild(this._scrollarea);
    },
    
    _configure : function()
    {
      // Configure root
      this._root.style.border = "1px solid black";
      this._root.style.background = "white";
      this._root.style.width = this._width + "px";
      this._root.style.height = this._height + "px";
      
      // Configure table frame
      this._frame.style.left = "0px";
      this._frame.style.top = "0px";
      this._frame.style.width = (this._width - this._scrollbarWidth - this._borderWidthX) + "px";
      this._frame.style.height = (this._height - this._borderWidthY) + "px";
      this._frame.style.position = "absolute";
      this._frame.style.MozUserSelect = "none";
      
      // Configure scrollarea
      this._scrollarea.style.overflowY = "scroll";
      this._scrollarea.style.position = "absolute";
      this._scrollarea.style.left = (this._width - this._scrollbarWidth - this._borderWidthX) + "px";
      this._scrollarea.style.top = "0px";
      this._scrollarea.style.height = (this._height - this._borderWidthY) + "px";
      this._scrollarea.style.width = this._scrollbarWidth + "px";
      
      // Configure scrollhelper
      this._scrollhelper.style.height = (this._rowHeight * this._data.length) + "px";
      this._scrollhelper.style.width = "1px";
      this._scrollhelper.style.visibility = "hidden";
    },
    
    _renderRow : function(row)
    {
      var html = [];
      var layout = this._layout;
      var data = this._data;
      var rowdata = data[row];
      
      html.push("<tr style='");
      
      if (rowdata.selected) {
        html.push('background:lightblue;');
      }
      else if (row%2) {
        html.push('background:#f4f4f4;');
      }
      
      
      html.push("'>");
      
      for (var key in layout)
      {
        html.push("<td>", rowdata[key], "</td>");
      }
      
      html.push("</tr>");

      var str = html.join("");
      this._rowCache[row] = str; 

      return str;
    },
    
    _render : function()
    {
      var start = new Date;
      var html = [];
      
      var pos = this._rowPosition;
      var nr = this._rowNumber;
      
      html.push("<table style='cursor:default;font:11px Tahoma,sans-serif;width:100%;height:100%' cellSpacing='0' cellPadding='0'><tbody");
      
      for (var i=pos, l=pos+nr; i<l; i++) {
        html.push(this._rowCache[i] || this._renderRow(i));
      }
      
      html.push("</tbody></table>");
      this._frame.innerHTML = html.join("");
      
      console.log("Runtime: " + (new Date - start) + "ms");
    },
    
    _sync : function()
    {
      var now = new Date;
      
      if (now - this._scrollTimeout < this._lastScroll) {
        return;
      }
      
      this._lastScroll = now;
      this._appliedRowPosition = this._rowPosition;
      this._render();      
    },
    
    _onscroll : function(e)
    {
      var rowPos = Math.round(this._scrollarea.scrollTop/this._rowHeight);
      
      if (this._appliedRowPosition == rowPos) {
        return; 
      }
      
      this._rowPosition = rowPos;
    },
    
    _oninterval : function()
    {
      if (this._appliedRowPosition != this._rowPosition) {
        this._sync();
      }
    }
  }
});
