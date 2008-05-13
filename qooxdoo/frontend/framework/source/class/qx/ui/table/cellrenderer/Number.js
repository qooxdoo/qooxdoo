/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 OpenHex SPRL, http://www.openhex.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gaetan de Menten (ged)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * Specific data cell renderer for numbers.
 */
qx.Class.define("qx.ui.table.cellrenderer.Number",
{
  extend : qx.ui.table.cellrenderer.Conditional,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(align, color, style, weight)
  {
    this.base(arguments, align, color, style, weight);

    this.initNumberFormat();
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * NumberFormat used to format data. If the numberFormat contains a
     * prefix and/or postfix containing characters which needs to be escaped,
     * those need to be given to the numberFormat in their escaped form
     * because no escaping happens at the cellrenderer level.
     */
    numberFormat :
    {
      check : "qx.util.format.NumberFormat",
      init : null,
      apply : "_applyNumberFormat"
    },

    /**
     * Function to optionally alter the value to be formatted.  Typically,
     * this Number renderer should always render a number, as the name
     * implies.  The function in this property can be modified, for example,
     * if one wants a null value to display as an empty string instead of as
     * the value "0".  (Note, however, that if you also specify a non-null
     * numberFormat, that numberFormat may alter the display of the value
     * yielding something other than an empty string for a null value.)
     *
     */
    valueModifier :
    {
      check : "Function",
      init  : function(value)
      {
        return value || "0";
      }
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyNumberFormat : function(value, old) {
      var method;
      if (value) {
        method = function(cellInfo) {
          // I don't think we need to escape the resulting string, as I
          // don't know of any decimal or separator which use a character
          // which needs escaping. It is much more plausible to have a
          // prefix, postfix containing such characters but those can be
          // (should be) added in their escaped form to the number format.
          return value.format(this.getValueModifier()(cellInfo.value));
        }
      } else {
        method = function(cellInfo) {
          return this.getValueModifier()(cellInfo.value);
        }
      }
      // dynamically override _getContentHtml method
      this._getContentHtml = method;
    },

    // overridden
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell qooxdoo-table-cell-right";
    }
  }
});
