/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * An abstract table model that performs the column handling, so subclasses only
 * need to care for row handling.
 */
qx.Class.define("qx.ui.table.model.Abstract",
{
  type : "abstract",
  extend : qx.ui.table.model.Basic,


  construct : function()
  {
    this.base(arguments);

    this._columnIdArr = [];
    this._columnNameArr = [];
    this._columnIndexMap = {};
  },


  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getColumnCount : function() {
      return this._columnIdArr.length;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param columnId {var} TODOC
     * @return {var} TODOC
     */
    getColumnIndexById : function(columnId) {
      return this._columnIndexMap[columnId];
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param columnIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnId : function(columnIndex) {
      return this._columnIdArr[columnIndex];
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param columnIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnName : function(columnIndex) {
      return this._columnNameArr[columnIndex];
    },


    /**
     * Sets the column IDs. These IDs may be used internally to identify a column.
     *
     * Note: This will clear previously set column names.
     *
     *
     * @type member
     * @param columnIdArr {String[]} the IDs of the columns.
     * @return {void}
     * @see #setColumns
     */
    setColumnIds : function(columnIdArr)
    {
      this._columnIdArr = columnIdArr;

      // Create the reverse map
      this._columnIndexMap = {};

      for (var i=0; i<columnIdArr.length; i++) {
        this._columnIndexMap[columnIdArr[i]] = i;
      }

      this._columnNameArr = new Array(columnIdArr.length);

      // Inform the listeners
      if (!this._internalChange) {
        this.createDispatchEvent(qx.ui.table.model.Basic.EVENT_TYPE_META_DATA_CHANGED);
      }
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @type member
     * @param columnNameArr {String[]} the names of the columns.
     * @return {void}
     * @throws TODOC
     * @see #setColumnIds
     */
    setColumnNamesByIndex : function(columnNameArr)
    {
      if (this._columnIdArr.length != columnNameArr.length) {
        throw new Error("this._columnIdArr and columnNameArr have different length: " + this._columnIdArr.length + " != " + columnNameArr.length);
      }

      this._columnNameArr = columnNameArr;

      // Inform the listeners
      this.createDispatchEvent(qx.ui.table.model.Basic.EVENT_TYPE_META_DATA_CHANGED);
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @type member
     * @param columnNameMap {Map} a map containing the column IDs as keys and the
     *          column name as values.
     * @return {void}
     * @see #setColumnIds
     */
    setColumnNamesById : function(columnNameMap)
    {
      this._columnNameArr = new Array(this._columnIdArr.length);

      for (var i=0; i<this._columnIdArr.length; ++i) {
        this._columnNameArr[i] = columnNameMap[this._columnIdArr[i]];
      }
    },


    /**
     * Sets the columns.
     *
     * @type member
     * @param columnNameArr {String[]} The column names. These names will be shown to
     *          the user.
     * @param columnIdArr {String[] ? null} The column IDs. These IDs may be used
     *          internally to identify a column. If null, the column names are used as
     *          IDs.
     * @return {void}
     * @throws TODOC
     */
    setColumns : function(columnNameArr, columnIdArr)
    {
      if (columnIdArr == null) {
        columnIdArr = columnNameArr;
      }

      if (columnIdArr.length != columnNameArr.length) {
        throw new Error("columnIdArr and columnNameArr have different length: " + columnIdArr.length + " != " + columnNameArr.length);
      }

      this._internalChange = true;
      this.setColumnIds(columnIdArr);
      this._internalChange = false;
      this.setColumnNamesByIndex(columnNameArr);
    }
  },


  destruct : function() {
    this._disposeFields("_columnIdArr", "_columnNameArr", "_columnIndexMap");
  }
});
