/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Abstract model for the table view. The model implements the filter behavior.
 */
qx.Class.define("inspector.objects.table.AbstractModel",
{
  extend : qx.ui.table.model.Filtered,

  /**
   * Constructs model.
   *
   * @param model {inspector.objects.Model} model to show.
   * @param columns {Array} with header names.
   */
  construct : function(model, columns)
  {
    this.base(arguments);

    this._model = model;
    this.setColumns(columns);
    this.setData(this._getData());
  },

  members :
  {
    /** {String} actuall setted filter */
    __currentFilter : "",

    /** {inspector.objects.Model} model to show */
    _model : null,

    /**
     * Templet method to get the data for the table.
     *
     * @returns {Array} the model data for the table.
     */
    _getData: function() {
      throw Error("Abstract Method call!");
    },

    /**
     * Reload the table with the set model and filter.
     */
    reload : function() {
      this.setData(this._getData());
      this.filter(this.__currentFilter);
    },

    /**
     * Applies the passed filter on the shown model.
     *
     * @param filter {String} filter for the model.
     */
    filter :function(filter)
    {
      this.__currentFilter = filter;
      this.resetHiddenRows();

      if (filter != "") {
        this.addNotRegex(filter, "Classname", true);
        this.applyFilters();
      }
    }
  },

  destruct : function() {
    this._model = null;
  }
});
