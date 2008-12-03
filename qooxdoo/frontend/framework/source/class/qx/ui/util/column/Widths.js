/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(column)

************************************************************************ */

/**
 * Column width array for a whole set of columns
 */
qx.Class.define("qx.ui.util.column.Widths",
{
  extend : qx.core.Object,

  /**
   * @param numColumns {Integer}
   *   The number of columns being used.
   */
  construct : function(numColumns)
  {
    this.base(arguments);

    // Create an array of the specified number of columns, and use the default
    // column data.
    this._columnData = [ ];
    for (var i = 0; i < numColumns; i++)
    {
      this._columnData[i] = new qx.ui.util.column.Data();
    }
  },

  members :
  {
    /**
     * Get the array of column data.
     *
     * @return {Array}
     *   Array of column data
     *
     */
    getData : function()
    {
      return this._columnData;
    },

    /**
     * Set the width, minimum width and/or maximum width of a column at one
     * time.
     *
     * @param column {Integer}
     *   The column number whose attributes are being set.
     *
     * @param map {map}
     *   An object with any or all of the three members, "width", "minWidth",
     *   "maxWidth".  The property values are as described for {@link
     *   #setWidth}, {@link #setMinWidth} and {@link #setMaxWidth}
     *   respectively.
     *
     * @return {Void}
     */
    set : function(column, map)
    {
      for (var key in map)
      {
        switch(key)
        {
        case "width":
          this.setWidth(column, map[key]);
          break;

        case "minWidth":
          this.setMinWidth(column, map[key]);
          break;

        case "maxWidth":
          this.setMaxWidth(column, map[key]);
          break;

        default:
          throw new Error("Unrecognized key: " + key);
        }
      }
    },

    /**
     * Set the width of a column.
     *
     * @type member
     *
     * @param col {Integer} The column whose width is to be set
     *
     * @param width {Integer, String}
     *   The width of the specified column.  The width may be specified as
     *   integer number of pixels (e.g. 100), a string representing percentage
     *   of the inner width of the Table (e.g. "25%"), or a string
     *   representing a flex width (e.g. "1*").
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setWidth(width);
    },

    /**
     * Set the minimum width of a column.
     *
     * @type member
     *
     * @param col {Integer}
     *   The column whose minimum width is to be set
     *
     * @param width {Integer}
     *   The minimum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMinWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setMinWidth(width);
    },

    /**
     * Set the maximum width of a column.
     *
     * @type member
     *
     * @param col {Integer}
     *   The column whose maximum width is to be set
     *
     * @param width {Integer}
     *   The maximum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMaxWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setMaxWidth(width);
    }
  }
});
