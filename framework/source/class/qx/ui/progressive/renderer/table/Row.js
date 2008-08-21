 /* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Row renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.Row",
{
  extend     : qx.ui.progressive.renderer.Abstract,


  construct : function(columnWidths)
  {
    this.base(arguments);

    // Save the column widths
    this.__columnWidths = columnWidths;

    // Create space to store renderers for each column
    this.__renderers = { };

    // We need a default cell renderer to use if none is specified
    this.__defaultCellRenderer =
      new qx.ui.progressive.renderer.table.cell.Default();

    // We don't yet know who our Progressive will be
    this.__progressive = null;

    this.__colors = {};

    // link to color theme
    var colorMgr = qx.theme.manager.Color.getInstance();
    this.__colors.bgcol = [];
    this.__colors.bgcol[0] =
      colorMgr.resolve("progressive-table-row-background-even");
    this.__colors.bgcol[1] =
      colorMgr.resolve("progressive-table-row-background-odd");

    // This layout is not connected to a widget but to this class. This class
    // must implement the method "getLayoutChildren", which must return all
    // columns (LayoutItems) which should be recalcutated. The call
    // "layout.renderLayout" will call the method "renderLayout" on each
    // column data object The advantage of the use of the normal layout
    // manager is that the samantics of flex and percent are exectly the same
    // as in the widget code.
    this.__layout = new qx.ui.layout.HBox();
    this.__layout.connectToWidget(this);
  },


  statics :
  {
    __clazz : null,

    __padding : 6, // modify padding parameter below too if this changes

    __tableCellStyleSheet :
        "  position: absolute;" +
        "  top: 0px;" +
        "  height: 100%;" +
        "  overflow:hidden;" +
        "  text-overflow:ellipsis;" +
        "  -o-text-overflow: ellipsis;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #f2f2f2;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding : 0px 6px 0px 6px" +
        "  cursor:default;" +
        "  font-size: 11px;" +
        "  font-family: 'Segoe UI', Corbel, Calibri, Tahoma, 'Lucida Sans Unicode', sans-serif;" +
        (qx.core.Variant.isSet("qx.client", "mshtml")
         ? ''
         : ';-moz-user-select:none;')
  },


  properties :
  {
    /** The default height of a row, if not altered by a cell renderer. */
    defaultRowHeight :
    {
      init : 16
    }
  },


  members :
  {

    __progressive : null,
    __name : null,
    __hash : null,
    __columnWidths : null,
    __renderers : null,
    __defaultCellRenderer : null,
    __colors : null,
    __layout : null,

    // overridden
    join : function(progressive, name)
    {
      // Are we already joined?
      if (this.__progressive)
      {
        // Yup.  Let 'em know they can't do that.
        throw new Error("Renderer is already joined to a Progressive.");
      }

      // Save the Progressive to which we're joined
      this.__progressive = progressive;

      // Save the name that Progressive knows us by
      this.__name = name;

      // If we haven't created style sheets for this table yet...
      var tr = qx.ui.progressive.renderer.table.Row;
      if (!tr.__clazz)
      {
        tr.__clazz = { };
      }

      var hash = progressive.toHashCode();
      if (!tr.__clazz[hash])
      {
        // ... then do it now.
        tr.__clazz[hash] =
          {
            rowstylesheet  : null,
            cellstylesheet : [ ]
          };

        var stylesheet =
          ".qx-progressive-" + hash + "-row {" +
          "  width : '100%';" +
          "}";
        tr.__clazz[hash].rowstylesheet =
          qx.bom.Stylesheet.createElement(stylesheet);

        var columnData = this.__columnWidths.getData();

        for (var i = 0; i < columnData.length; i++)
        {
          var stylesheet =
            ".qx-progressive-" + hash + "-col-" + i + " {" +
            tr.__tableCellStyleSheet +
            "}";
          tr.__clazz[hash].cellstylesheet[i] =
            qx.bom.Stylesheet.createElement(stylesheet);
        }

        // Save the hash too
        this.__hash = hash;

        // Arrange to be called when the window appears or is resized, so we
        // can set each style sheet's left and width field appropriately.
        var pane = progressive.getStructure().getPane();
        pane.addListener("resize", this._resizeColumns, this);

      }
    },

    /**
     * Add a cell renderer for use within a row rendered by this row
     * renderer.
     *
     * @param column {Integer}
     *   The column number for which the cell renderer applies
     *
     * @param renderer {@link qx.ui.progressive.renderer.table.cell.Abstract}
     *   The cell renderer for the specified column.
     *
     * @return {Void}
     */
    addRenderer : function(column, renderer)
    {
      var columnData = this.__columnWidths.getData();
      if (column < 0 || column >= columnData.length)
      {
        throw new Error("Column " +
                        column +
                        " out of range (max: " +
                        (columnData.length - 1) +
                        ")");
      }

      this.__renderers[column] = renderer;
    },

    /**
     * Remove a cell renderer previously added with {@link #addRenderer}.
     *
     * @param column {Integer}
     *   The column for which the cell renderer is to be removed.
     *
     * @return {Void}
     */
    removeRenderer : function(column)
    {
      var columnData = this.__columnWidths.getData();
      if (column < 0 || column >= columnData.length)
      {
        throw new Error("Column " +
                        column +
                        " out of range (max: " +
                        (columnData.length - 1) +
                        ")");
      }

      if (! this.__renderers[column])
      {
        throw new Error("No existing renderer for column " + column);
      }

      delete this.__renderers[column];
    },

    // overridden
    render : function(state, element)
    {
      var data = element.data;
      var html = [ ];
      var cellInfo;
      var renderer;
      var height = 0;

      // Initialize row counter, if necessary.  We'll use this for shading
      // alternate rows.

      if (state.getRendererData()[this.__name].end === undefined)
      {
        state.getRendererData()[this.__name] =
          {
            end         : 0,
            start       : 1,
            rows        : 0,
            totalHeight : 0
          };
      }

      // Create the div for this row
      var div = document.createElement("div");

      // For each cell...
      for (var i = 0; i < data.length; i++)
      {
        var stylesheet = "qx-progressive-" + this.__hash + "-col-" + i;

        // Determine what renderer to use for this column
        renderer = this.__renderers[i] || this.__defaultCellRenderer;

        // Specify information that cell renderer will need
        cellInfo =
        {
          state      : state,
          rowDiv     : div,
          stylesheet : stylesheet,
          element    : element,
          dataIndex  : i,
          cellData   : data[i],
          height     : height
        };

        // Render this cell
        html.push(renderer.render(cellInfo));

        // If this cell's height was greater than our current maximum...
        if (cellInfo.height > height)
        {
          // ... then it becomes our row height
          height = cellInfo.height;
        }
      }

      height = (height > 0 ? height : this.getDefaultRowHeight());

      // Get a reference to our renderer data
      var rendererData = state.getRendererData()[this.__name];

      // Track total height so we can determine if there's a vertical scrollbar
      rendererData.totalHeight += height;

      // Set properties for the row div
      div.style.position = "relative";
      div.style.height = height + "px";
      div.className = "qx-progressive-" + this.__hash + "-row";
      div.innerHTML = html.join("");

      // Add this row to the table
      switch(element.location)
      {
      case "end":
        // Determine color of row based on state of last added row
        var index = rendererData.end || 0;

        // Set the background color of this row
        div.style.backgroundColor = this.__colors.bgcol[index];

        // Update state for next time
        rendererData.end = (index == 0 ? 1 : 0);

        // Append our new row to the pane.
        state.getPane().getContentElement().getDomElement().appendChild(div);
        break;

      case "start":
        // Get the pane element
        var elem = state.getPane().getContentElement().getDomElement();

        // Get its children array
        var children = elem.childNodes;

        // Are there any children?
        if (children.length > 0)
        {
          // Yup.  Determine color of row based on state of last added row
          var index = rendererData.start;

          // Set the background color of this row
          div.style.backgroundColor = this.__colors.bgcol[index];

          // Update state for next time
          rendererData.start = (index == 0 ? 1 : 0);

          // Insert our new row before the first child.
          elem.insertBefore(div, children[0]);
          break;
        }
        else
        {
          /* No children yet.  We can append our new row. */
          elem.appendChild(div);
        }
        break;

      default:
        throw new Error("Invalid location: " + element.location);
      }

      // Increment row count
      ++rendererData.rows;
    },

    /**
     * This method is required by the box layout. If returns an array of items
     * to relayout.
     */
    getLayoutChildren : function()
    {
      return this.__columnWidths.getData();
    },


    /**
     * Event handler for the "resize" event.  We recalculate the
     * widths of each of the columns, and modify the stylesheet rule
     * applicable to each column, to apply the new widths.
     *
     * @param e {qx.event.type.Event}
     *   Ignored
     *
     * @return {Void}
     */
    _resizeColumns : function(e)
    {
      var pane = this.__progressive.getStructure().getPane();

      var width =
        pane.getBounds().width - qx.bom.element.Overflow.getScrollbarWidth();

      // Get the style sheet rule name for this row
      var stylesheet = ".qx-progressive-" + this.__hash + "-row";

      // Remove the style rule for this row
      var tr = qx.ui.progressive.renderer.table.Row;
      qx.bom.Stylesheet.removeRule(tr.__clazz[this.__hash].rowstylesheet,
                                    stylesheet);


      // Create the new rule for this row
      var rule = "width: " + width + "px;";


      // Apply the new rule
      qx.bom.Stylesheet.addRule(tr.__clazz[this.__hash].rowstylesheet,
                                 stylesheet,
                                 rule);

      // Compute the column widths
      this.__layout.renderLayout(width, 100);

      // Get the column data
      var columnData = this.__columnWidths.getData();

      // Reset each of the column style sheets to deal with width changes
      for (var i = 0,
             left = 0;
           i < columnData.length;
           i++,
             left += width)
      {
        // Get the style sheet rule name for this cell
        var stylesheet = ".qx-progressive-" + this.__hash + "-col-" + i;

        // Remove the style rule for this column
        var tr = qx.ui.progressive.renderer.table.Row;
        qx.bom.Stylesheet.removeRule(tr.__clazz[this.__hash].cellstylesheet[i],
                                      stylesheet);

        // Get this column width.
        width = columnData[i].getComputedWidth();

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.tableResizeDebug"))
          {
            this.debug("col " + i + ": width=" + width);
          }
        }

        // Make our width calculations box-model independent
        var inset;
        if (qx.bom.client.Feature.CONTENT_BOX)
        {
          inset = qx.ui.progressive.renderer.table.Row.__padding * 2;
        }
        else
        {
          inset = -1;
        }

        // Create the new rule, based on calculated widths
        var widthRule = (width - inset) + "px;";

        var paddingRule =
          "0px " + qx.ui.progressive.renderer.table.Row.__padding + "px " +
          "0px " + qx.ui.progressive.renderer.table.Row.__padding + "px;";

        var leftRule = left + "px;";

        var rule =
          tr.__tableCellStyleSheet +
          "width: " + widthRule +
          "left: " + leftRule +
          "padding: " + paddingRule;

        // Apply the new rule
        qx.bom.Stylesheet.addRule(tr.__clazz[this.__hash].cellstylesheet[i],
                                   stylesheet,
                                   rule);
      }
    }
  },


  destruct : function()
  {
    var name;

    for (name in this.__renderers)
    {
      this.__renderers[name] = null;
    }

    // Remove any style sheets that we had added
    var tr = qx.ui.progressive.renderer.table.Row;
    var hash = this.__progressive.toHashCode();
    if (tr.__clazz && tr.__clazz[hash])
    {
      // Remove the row stylesheet
      if (tr.__clazz[hash].rowstylesheet)
      {
        // Get the style sheet rule name for this row
        var stylesheet = ".qx-progressive-" + this.__hash + "-row";

        // Remove the style rule for this row
        var tr = qx.ui.progressive.renderer.table.Row;
        qx.bom.Stylesheet.removeRule(tr.__clazz[this.__hash].rowstylesheet,
                                      stylesheet);

      }

      // Remove each of the column style sheets
      if (tr.__clazz[hash].cellstylesheet)
      {
        for (var i = tr.__clazz[hash].cellstylesheet.length - 1; i >= 0; i--)
        {
          // Get the style sheet rule name for this cell
          var stylesheet = ".qx-progressive-" + this.__hash + "-col-" + i;
          var rule = tr.__clazz[this.__hash].cellstylesheet[i];

          // Remove the style rule for this column
          var tr = qx.ui.progressive.renderer.table.Row;
          qx.bom.Stylesheet.removeRule(rule, stylesheet);
        }
      }
    }

    if (this.__progressive && this.__progressive.getRendererData)
    {
      var rendererData = this.__progressive.getRendererData();
      if (rendererData &&
          rendererData[this.__name] &&
          rendererData[this.__name].end !== undefined)
      {
        rendererData[this.__name] = null;
      }
    }

    this._disposeFields(
      "__name",
      "__colors",
      "__renderers",
      "__progressive",
      "__columnWidths");

    this._disposeObjects(
      "__layout",
      "__defaultCellRenderer",
      "__columnData");
  }
});
