/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell LIpman

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
  construct : function(columnWidthArr)
  {
    this.base(arguments);

    // Save the column and label styles
    this._columnWidth = columnWidthArr;

    var trh = qx.ui.progressive.renderer.TableRowHtml;
    if (!trh.__clazz)
    {
      trh.__clazz = this.self(arguments);
      var stylesheet =
        ".qooxdoo-progressive-trh-cell {" +
        trh.__tableCellStyleSheet +
        "}";
      this.debug(stylesheet);
      trh.__clazz.stylesheet = qx.html.StyleSheet.createElement(stylesheet);
    }
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
        (qx.core.Variant.isSet("qx.client", "mshtml")
         ? ''
         : ';-moz-user-select:none;')
  },

  members :
  {
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

    /**
     */
    render : function(state, element)
    {
      var cell;
      var style;
      var data = element.data;
      var html = [ ];

      // For each cell...
      for (var left = 0,
             i = 0;
           i < data.length;
           left += this._columnWidth[i],
             i++)
      {
        // Render this cell
        html.push("<div class='qooxdoo-progressive-trh-cell'",
                  "style='",
                  "left:", left, "px;",
                  "width:", this._columnWidth[i], "px;",
                  "'>",
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
        state.container.getElement().appendChild(div);
        break;

      case "start":
        break;

      default:
        throw new Error("Invalid location: " + element.location);
      }
    }
  },


  /**
   */
  destruct : function()
  {
  }
});
