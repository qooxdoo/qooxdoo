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
 * Table Row for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.TableRowHtml",
{
  extend     : qx.ui.progressive.renderer.Abstract,


  /**
   */
    construct : function(columnWidths, columnStyles)
  {
    this.base(arguments);

    // Save the column widths
    this._columnWidths = columnWidths;

    // Save the column styles
    this._columnStyles = columnStyles;

    // We don't yet know who our Progressive will be
    this._progressive = null;
  },


  statics :
  {
    __clazz : null,

    __tableCellStyleSheet :
        "  position: absolute;" +
        "  top: 0px;" +
        "  height: 100%;" +
        "  overflow:hidden;" +
        "  text-overflow:ellipsis;" +
        "  -o-text-overflow: ellipsis;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #eeeeee;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding : 0px 6px;" +
        "  cursor:default;" +
        "  font-size: 11px;" +
        "  font-family: 'Segoe UI', Corbel, Calibri, Tahoma, 'Lucida Sans Unicode', sans-serif;" +
        (qx.core.Variant.isSet("qx.client", "mshtml")
         ? ''
         : ';-moz-user-select:none;')
  },

  members :
  {
    join : function(progressive)
    {
      // Are we already joined?
      if (this._progressive)
      {
        // Yup.  Let 'em know they can't do that.
        throw new Error("Renderer is already joined to a Progressive.");
      }

      // Save the Progressive to which we're joined
      this._progressive = progressive;

      // Arrange to be called when the window appears or is resized, so we
      // can set each style sheet's left and width field appropriately.
      progressive.addEventListener("widthChanged",
                                   this._resizeColumns,
                                   this);

      // If we haven't created style sheets for this table yet...
      var trh = qx.ui.progressive.renderer.TableRowHtml;
      if (!trh.__clazz)
      {
        trh.__clazz = { };
      }

      var hash = progressive.toHashCode();
      if (!trh.__clazz[hash])
      {
        // ... then do it now.
        trh.__clazz[hash] =
          {
            stylesheet : [ ]
          };
        for (var i = 0; i < this._columnWidths.getData().length; i++)
        {
          var stylesheet =
            ".qx-progressive-" + hash + "-cell-" + i + " {" +
            trh.__tableCellStyleSheet +
            "}";
          trh.__clazz[hash].stylesheet[i] =
            qx.html.StyleSheet.createElement(stylesheet);
        }

        // Save the hash too
        this._hash = hash;

        // Arrange to be called when the window appears or is resized, so we
        // can set each style sheet's left and width field appropriately.
        progressive.addEventListener("widthChanged",
                                     this._resizeColumns,
                                     this);
      }
    },

    /**
     */
    render : function(state, element)
    {
      var cell;
      var style;
      var data = element.data;
      var html = [ ];

      // For each cell...
      for (i = 0; i < data.length; i++)
      {
        var stylesheet = "qx-progressive-" + this._hash + "-cell-" + i;

        // Render this cell
        html.push("<div class='" + stylesheet + "'");

        // Use the user-specified column styles
        if (this._columnStyles && this._columnStyles[i])
        {
          var styleHtml = [ ];
          styles = this._columnStyles[i];
          for (var attr in styles)
          {
            // Ignore width, min-width, and max-width.  They're handled by the
            // columnWidths parameter to the constructor via style sheet
            // changes.
            if (attr == "width" || attr == "min-width" || attr == "max-width")
            {
              continue;
            }

            styleHtml.push(attr, ":", styles[attr], ";");
          }

          // If there were any styles specified...
          if (styleHtml.length > 0)
          {
            // ... then add them to our html
            html.push("style='", styleHtml.join(""), "'");
          }
        }

        // Add the data, and then we're alldone.
        html.push(">",
                  qx.html.String.escape(this._formatValue(data[i])),
                  "</div>");
      }

      // Create the row div
      var div = document.createElement("div");
      div.style.position = "relative";
      div.style.height = 16;
      div.innerHTML = html.join("");

      // Add this row to the table
      switch(element.location)
      {
      case "end":
        // Append our new row to the pane.
        state.pane.getElement().appendChild(div);
        break;

      case "start":
        // Get the pane element
        var elem = state.pane.getElement();

        // Get its children array
        var children = elem.childNodes;

        // Are there any children?
        if (children.length > 0)
        {
          // Yup.  Insert our new row before the first child
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
    },

    /**
     * Formats a value.
     */
    _formatValue : function(value)
    {
      var ret;

      if (value == null)
      {
        return "";
      }

      if (typeof value == "string")
      {
        return value;
      }
      else if (typeof value == "number")
      {
        if (! qx.ui.progressive.renderer.TableRowHtml._numberFormat)
        {
          var numberFormat = new qx.util.format.NumberFormat();
          numberFormat.setMaximumFractionDigits(2);
          qx.ui.progressive.renderer.TableRowHtml._numberFormat = numberFormat;
        }
        ret =
          qx.ui.progressive.renderer.TableRowHtml._numberFormat.format(value);
      }
      else if (value instanceof Date)
      {
        ret = qx.util.format.DateFormat.getDateInstance().format(value);
      }
      else
      {
        ret = value;
      }

      return ret;
    },

    _resizeColumns : function(e)
    {
      var width =
        (! this._progressive.getElement()
         ? 0
         : this._progressive.getInnerWidth()) -
        qx.ui.core.Widget.SCROLLBAR_SIZE;
      
      // Compute the column widths
      qx.ui.util.column.FlexWidth.compute(this._columnWidths.getData(), width);

      // Reset each of the column style sheets to deal with width changes
      for (var i = 0,
             left = 0;
           i < this._columnWidths.getData().length;
           i++,
             left += width)
      {
        // Get the style sheet rule name for this cell
        var stylesheet = ".qx-progressive-" + this._hash + "-cell-" + i;

        // Remove the style rule for this column
        var trh = qx.ui.progressive.renderer.TableRowHtml;
        qx.html.StyleSheet.removeRule(trh.__clazz[this._hash].stylesheet[i],
                                      stylesheet);

        // Get this column data.
        var columnData = this._columnWidths.getData()[i];

        //
        // Get the width of this column.
        //
        
        // Is this column a flex width?
        if (columnData._computedWidthTypeFlex)
        {
          // Yup.  Set the width to the calculated width value based on flex
          width = columnData._computedWidthFlexValue;
        }
        else if (columnData._computedWidthTypePercent)
        {
          // Set the width to the calculated width value based on percent
          width = columnData._computedWidthPercentValue;
        }
        else
        {
          width = columnData.getWidth();
        }

        // Create the new rule, based on calculated widths
        var rule =
          trh.__tableCellStyleSheet +
          "left: " + left + ";" +
          "width: " + width + ";";

        // Apply the new rule
        qx.html.StyleSheet.addRule(trh.__clazz[this._hash].stylesheet[i],
                                   stylesheet,
                                   rule);
      }
    }
  },


  /**
   */
  destruct : function()
  {
  }
});
