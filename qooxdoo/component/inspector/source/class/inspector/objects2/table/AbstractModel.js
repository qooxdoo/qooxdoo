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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.objects2.table.AbstractModel",
{
  extend : qx.ui.table.model.Filtered,

  construct : function(model, columns)
  {
    this.base(arguments);

    this._model = model;
    this.setColumns(columns);
    this.setData(this._getData());
  },

  members :
  {
    __currentFilter : "",

    _model : null,

    _getData: function() {
      throw Error("Abstract Method call!");
    },

    reload : function() {
      this.setData(this._getData());
      this.filter(this.__currentFilter);
    },

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
