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
 * Table Cell Renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,


  /**
   */
  construct : function()
  {
    this.base(arguments);
  },


  members :
  {
    _getCellStyle : function(cellInfo)
    {
      return "";
    },

    _getCellExtras : function(cellInfo)
    {
      return "";
    },

    _getContentHtml : function(cellInfo)
    {
      throw new Error("_getContentHtml() is abstract");
    },

    /**
     */
    render : function(cellInfo)
    {  
      var html = [ ];
      var style = this._getCellStyle(cellInfo);

      // Render this cell
      html.push("<div ",
                "class='", cellInfo.stylesheet, "' ");

      if (style)
      {
        html.push("style='", this._getCellStyle, "'");
      }

      html.push(this._getCellExtras(cellInfo),
                ">",
                this._getContentHtml(cellInfo),
                "</div>");

      return html.join("");
    }
  }
});
