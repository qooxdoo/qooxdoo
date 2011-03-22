/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Number cell renderer.
 *
 * Renders the call using the configured number formatter.
 *
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.virtual.cell.Number",
{
  extend : qx.ui.virtual.cell.Cell,


  /**
   * @param numberFormat {qx.util.format.NumberFormat|null} Optional number
   *   format to use.
   */
  construct : function(numberFormat)
  {
    this.base(arguments);

    if (numberFormat) {
      this.setNumberFormat(numberFormat);
    }
  },


  properties :
  {
    /** The number format used to render the cell */
    numberFormat :
    {
      check : "qx.util.format.NumberFormat",
      // it is on intension that only one number format is used for
      // all instances
      init : new qx.util.format.NumberFormat()
    },

    // overridden
    appearance:
    {
      refine : true,
      init : "cell-number"
    }
  },


  members :
  {
    // overridden
    getContent : function(value, states) {
      return value !== null ? this.getNumberFormat().format(value) : "";
    }
  }
});