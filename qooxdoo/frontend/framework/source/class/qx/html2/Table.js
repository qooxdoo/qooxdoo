qx.Class.define("qx.html2.Table",
{
  extend : qx.core.Object,

  construct : function(layout, data)
  {
    this.base(arguments);

    this._layout = layout;
    this._data = data;

    this._height = 612;
    this._width = 700;

    this._scrollbarWidth = 18;
    this._headerHeight = 24;

    this._borderWidthX = 2;
    this._borderWidthY = 2;

    this._rowHeight = 18;
    this._rowNumber = Math.ceil((this._height - this._headerHeight - this._borderWidthY) / this._rowHeight);
    this._appliedRowPosition = 0;
    this._rowPosition = 0;
    this._rowCache = [];
    
    this._dateFormat = new qx.util.format.DateFormat("dd.MM.yy HH:mm");
    this._checkImage = "<img src='" + qx.io.Alias.getInstance().resolve("widget/menu/checkbox.gif") + "'/>";

    this._onscrollWrapper = qx.lang.Function.bind(this._onscroll, this);
    this._onintervalWrapper = qx.lang.Function.bind(this._oninterval, this);
    
    this._updateInterval = window.setInterval(this._onintervalWrapper, 50);

    this._init();
    this._configure();
    this._render();
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getElement : function() {
      return this._root;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _init : function()
    {
      // Create root
      this._root = document.createElement("div");
      this._root.className = "qxtable";

      // Create header
      this._initHeader();

      // Create table frame
      this._frame = document.createElement("div");

      // Create and configure scrollarea
      this._scrollarea = document.createElement("div");
      this._scrollhelper = document.createElement("div");
      this._scrollarea.onscroll = this._onscrollWrapper;
      this._scrollarea.appendChild(this._scrollhelper);

      // Fill root
      this._root.appendChild(this._header);
      this._root.appendChild(this._frame);
      this._root.appendChild(this._scrollarea);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _initHeader : function()
    {
      var layout = this._layout;

      // Create main
      this._header = document.createElement("table");
      this._header.className = "header";
      this._header.cellPadding = 0;
      this._header.cellSpacing = 0;
      this._header.style.tableLayout = "fixed";
      this._header.style.font = "11px Tahoma, sans-serif";
      this._headerCols = [];

      // Create column config
      var layout = this._layout;
      var group = document.createElement("colgroup");
      var col;

      for (var key in layout)
      {
        var col = document.createElement("col");
        col.width = layout[key].width;

        this._headerCols.push(col);
        group.appendChild(col);
      }
      
      // Helper Col
      group.appendChild(document.createElement("col"));

      this._header.appendChild(group);

      // Create content
      this._headerBody = document.createElement("tbody");
      this._headerRow = document.createElement("tr");
      this._header.appendChild(this._headerBody);
      this._headerBody.appendChild(this._headerRow);

      var cell;

      for (var key in layout)
      {
        cell = document.createElement("td");
        cell.innerHTML = layout[key].caption || "&#160;";

        this._headerRow.appendChild(cell);
      }
      
      var helper = document.createElement("td");
      this._headerRow.appendChild(helper);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _configure : function()
    {
      // Configure root
      this._root.style.border = "1px solid black";
      this._root.style.background = "white";
      this._root.style.width = this._width + "px";
      this._root.style.height = this._height + "px";

      // Configure header
      this._header.style.left = "0px";
      this._header.style.top = "0px";
      this._header.style.height = this._headerHeight + "px";
      this._header.style.background = "#eee";
      this._header.style.borderBottom = "1px solid #ccc";

      // Configure table frame
      this._frame.style.left = "0px";
      this._frame.style.top = this._headerHeight + "px";
      this._frame.style.width = (this._width - this._scrollbarWidth - this._borderWidthX) + "px";
      this._frame.style.height = (this._height - this._borderWidthY - this._headerHeight) + "px";
      this._frame.style.position = "absolute";
      this._frame.style.overflow = "hidden";
      this._frame.style.MozUserSelect = "none";

      // Configure scrollarea
      this._scrollarea.style.overflowY = "scroll";
      this._scrollarea.style.position = "absolute";
      this._scrollarea.style.left = (this._width - this._scrollbarWidth - this._borderWidthX) + "px";
      this._scrollarea.style.top = this._headerHeight + "px";
      this._scrollarea.style.height = (this._height - this._borderWidthY - this._headerHeight) + "px";
      this._scrollarea.style.width = this._scrollbarWidth + "px";

      // Configure scrollhelper
      this._scrollhelper.style.height = (this._rowHeight * this._data.length) + "px";
      this._scrollhelper.style.width = "1px";
      this._scrollhelper.style.visibility = "hidden";
    },


    /**
     * TODOC
     *
     * @type member
     * @param row {var} TODOC
     * @return {var} TODOC
     */
    _renderRow : function(row)
    {
      var html = [];
      var layout = this._layout;
      var data = this._data;
      var rowdata = data[row] || {};

      // Generate row and styles
      html.push("<tr style='");
      html.push('height:', this._rowHeight, 'px;');

      if (rowdata.selected) {
        html.push('background:#3399FF;color:white;');
      } else if (row % 2) {
        html.push('background:#f0f0f0;');
      }

      if (!rowdata.read) {
        html.push('font-weight:bold;');
      }

      if (rowdata.spam) {
        html.push('color:#7B5229');
      }

      html.push("'>");

      // Process column content
      for (var key in layout)
      {
        content = rowdata[key] || "";

        if (typeof content === "boolean") {
          content = content ? this._checkImage : "";
        } else if (content instanceof Date) {
          content = this._dateFormat.format(content);
        }

        // style='padding:2px 8px;overflow:hidden;text-overflow:hidden;'
        html.push("<td>", content, "</td>");
      }
      
      html.push("<td/>");

      html.push("</tr>");

      // Cache and return
      return this._rowCache[row] = html.join("");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _render : function()
    {
      var start = new Date;
      var html = [];

      var pos = this._rowPosition;
      var nr = this._rowNumber;
      
      // Table start
      html.push("<table class='content' cellSpacing='0' cellPadding='0'>");

      // Column configuration
      html.push("<colgroup>");
      var layout = this._layout;

      for (var key in layout) {
        html.push("<col width='" + layout[key].width + "'/>");
      }
      
      html.push("<col/>");
      html.push("</colgroup>");

      // Table body start
      html.push("<tbody>");

      for (var i=pos, l=pos+nr; i<l; i++) {
        html.push(this._rowCache[i] || this._renderRow(i));
      }

      // Close table
      html.push("</tbody></table>");
      var t1 = new Date - start;

      // Apply
      var start = new Date;
      this._frame.innerHTML = html.join("");
      var t2 = new Date - start;
      
      console.log("Generate/Apply: " + t1 + "ms, " + t2 + "ms");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _sync : function()
    {
      this._appliedRowPosition = this._rowPosition;
      this._render();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _onscroll : function(e) {
      this._rowPosition = Math.ceil(this._scrollarea.scrollTop / this._rowHeight);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _oninterval : function()
    {
      if (this._appliedRowPosition != this._rowPosition) {
        this._sync();
      }
    }
  }
});
