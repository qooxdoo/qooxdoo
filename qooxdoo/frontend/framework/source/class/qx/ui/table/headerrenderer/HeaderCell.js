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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The default header cell widget
 */
qx.Class.define("qx.ui.table.headerrenderer.HeaderCell",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.Grid());
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "table-header-cell"
    },

    /** header cell label */
    label :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyLabel"
    },

    /** The icon URL of the sorting indicator */
    sortIcon :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applySortIcon",
      themeable : true
    },

    /** Icon URL */
    icon :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyIcon"
    }
  },

  members :
  {
    // property apply
    _applyLabel : function(value, old)
    {
      if (value) {
        this._showChildControl("label").setContent(value);
      } else {
        this._excludeChildControl("label");
      }
    },


    // property apply
    _applySortIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("sort-icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },


    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 1});
          break;

        case "sort-icon":
          control = new qx.ui.basic.Image(this.getSortIcon());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 0});
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 2});
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});