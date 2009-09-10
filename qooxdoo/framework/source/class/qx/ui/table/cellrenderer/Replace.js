/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

    Authors:
      * Christian Boulanger (cboulanger)

************************************************************************ */


/**
 * The cell will use, if given, the
 * replaceMap property and/or the replaceFunction to look up labels for a
 * specific cell value. if the replaceMap, which does not need to be used but
 * takes precedence if given, has no entry for a specific value, you can implement
 * a fallback lookup in the replacementFunction, or use the replacementFunction exclusively.
 *
 * In editable cells, you need to make sure that the method returning the data
 * to the data storage (for example, a database backend) translates the replaced
 * cell value (the label) back into the corresponding value. Thus, both map and
 * function MUST also take care of the reverse translation of labels into
 * values. Example: if you have a field that should display "Active" on a "1"
 * value and "Inactive" on a "0" value, you must use the following map:
 *
 * <pre class='javascript'>
 * {
 *   0 : "Inactive",
 *   1 : "Active",
 *   "Inactive" : 0,
 *   "Active" : 1
 * }
 * </pre>
 *
 * You can use the addReversedReplaceMap() method to do this for you:
 * <pre class='javascript'>
 * var propertyCellRenderer = new qx.ui.table.cellrenderer.Replace;
 * propertyCellRenderer.setReplaceMap({
 *    1 : "Active",
 *   0 : "Inactive",
 *   2  : "Waiting",
 *   'admin' : "System Administrator",
 *   'manager' : "User Manager",
 *   'user' : "Website User"
 * });
 * propertyCellRenderer.addReversedReplaceMap();
 * </pre>
 *
 * @param cellInfo {Map} The information about the cell.
 *          See {@link #createDataCellHtml}.
 * @return {String}
 */
qx.Class.define("qx.ui.table.cellrenderer.Replace",
{
  extend : qx.ui.table.cellrenderer.Default,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** a hashmap which is used to replace values by labels */
    replaceMap :
    {
      check : "Object",
      nullable : true,
      init : null
    },

    /**
     * function that provides the label for a specific value
     **/
    replaceFunction :
    {
      check : "Function",
      nullable : true,
      init : null
    }

  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getContentHtml : function(cellInfo)
    {
      var value         = cellInfo.value;
      var replaceMap    = this.getReplaceMap();
      var replaceFunc   = this.getReplaceFunction();
      var label;

      // use map
      if ( replaceMap  )
      {
        label = replaceMap[value];
        if ( typeof label != "undefined" )
        {
          cellInfo.value = label;
          return qx.bom.String.escape(this._formatValue(cellInfo));
        }
      }

      // use function
      if ( replaceFunc )
      {
        cellInfo.value = replaceFunc (value);
      }
      return qx.bom.String.escape(this._formatValue(cellInfo));
    },

    /**
     * adds a reversed replaceMap to itself to translate labels back to the original values
     */
    addReversedReplaceMap : function()
    {
       var map = this.getReplaceMap();
       for (var key in map )
       {
         var value = map[key];
         map[value] = key;
       }
       return true;
    }
  }
});
