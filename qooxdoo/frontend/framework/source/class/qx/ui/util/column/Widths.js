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
 * 
 */
qx.Class.define("qx.ui.util.column.Widths",
{
  extend : qx.core.Object,

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
    getData : function()
    {
      return this._columnData;
    },

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
      
    setWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setWidth(width);
    },
      
    setMinWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setMinWidth(width);
    },
      
    setMinWidth : function(column, width)
    {
      if (column > this._columnData.length - 1 || column < 0)
      {
        throw new Error("Column number out of range");
      }

      this._columnData[column].setMaxWidth(width);
    }
  }
});
