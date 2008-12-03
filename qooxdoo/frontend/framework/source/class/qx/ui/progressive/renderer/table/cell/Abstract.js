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

/*
 * Cell Renderer for Progressive's Table.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 *
 * Many of the methods in this class accept a parameter called cellInfo.  This
 * parameter is an object with the following members:
 *
 * <dl>
 *   <dt>
 *     state
 *   </dt>
 *   <dd>
 *     The {@link qx.ui.progressive.State} object pertaining to this rendering
 *     session.
 *   </dd>
 *
 *   <dt>
 *     rowDiv
 *   </dt>
 *   <dd>
 *     The "div" DOM element of the row in which this cell is to be added.
 *   </dd>
 *
 *   <dt>
 *     element
 *   </dt>
 *   <dd>
 *     The entire element object returned by the data model.
 *   </dd>
 *
 *   <dt>
 *     dataIndex
 *   </dt>
 *   <dd>
 *     The index into the data element provided by the data model.
 *     Effectively, this is the column number.
 *   </dd>
 *
 *   <dt>
 *     cellData
 *   </dt>
 *   <dd>
 *     The data from the data model, to be rendered.  This the specific column
 *     data for the column being rendered, and is a shorthand for
 *     element.data[element.dataIndex].
 *   </dd>
 *
 *   <dt>
 *     height <span style="color:red;">Input/Output parameter!</span>
 *   </dt>
 *   <dd>
 *     On input to a cell renderer, this contains the height, as determined to
 *     date, for the current row.  The first column being rendered will
 *     receive a height of zero.  Upon return, it may leave the height at
 *     zero, meaning that it will accept any minimum height, or may specify a
 *     minimum height by setting this member.  Subsequent column cell renderers
 *     will receive the maximum height specified by any previous cell
 *     renderer.  Upon completion of calling each of the cell renderers for a
 *     row, the row height will be set to the value found in this member.
 *   </dd>
 * </dl>
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Abstract",
{
  type       : "abstract",
  extend     : qx.core.Object,


  members :
  {
    /**
     * Retrieve any style characteristics the cell renderer wants applied to
     * this cell.
     *
     * @param cellInfo {Object}
     *   See {@link qx.ui.progressive.renderer.table.cell.Abstract} class
     *   description for details
     *
     * @return {String}
     *   The style characteristics to be applied to this cell.
     */
    _getCellStyle : function(cellInfo)
    {
      return "";
    },

    /**
     * Retreve any extra attributes the cell renderer wants applied to this
     * cell.  Extra attributes could be such things as
     * "onclick='handleClick()';"
     *
     * @param cellInfo {Object}
     *   See {@link qx.ui.progressive.renderer.table.cell.Abstract} class
     *   description for details
     *
     * @return {String}
     *   The extra attributes to be applied to this cell.
     */
    _getCellExtras : function(cellInfo)
    {
      return "";
    },

    /**
     * Retreve the HTML content to be added to the cell div.
     *
     * @param cellInfo {Object}
     *   See {@link qx.ui.progressive.renderer.table.cell.Abstract} class
     *   description for details
     *
     * @return {String}
     *   The HTML content to be added to the cell div.
     */
    _getContentHtml : function(cellInfo)
    {
      return cellInfo.cellData || "";
    },

    /**
     * Given the provided cell information, generate the HTML for this
     * cell.
     *
     * @param cellInfo {Object}
     *   See {@link qx.ui.progressive.renderer.table.cell.Abstract} class
     *   description for details
     *
     * @return {String}
     *   The HTML required to create this cell.
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
        html.push("style='", style, "'");
      }

      html.push(this._getCellExtras(cellInfo),
                ">",
                this._getContentHtml(cellInfo),
                "</div>");

      return html.join("");
    }
  }
});
