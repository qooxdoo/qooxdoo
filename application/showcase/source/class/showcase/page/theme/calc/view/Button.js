/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Calculator button
 *
 * This class stores all information needed for a calculator button
 */
qx.Class.define("showcase.page.theme.calc.view.Button",
{
  extend : qx.ui.form.Button,


  /**
   * @param label {String} The button's label
   * @param row {Integer} row of the button
   * @param column {Integer} column of the button
   * @param rowSpan {Integer} rowSpan of the button
   * @param colSpan {Integer} column span of the button
   * @param keyIdentifier {String} name if the key identifier, which should
   *    trigger the button execution
   */
  construct : function(label, row, column, rowSpan, colSpan, keyIdentifier)
  {
    this.base(arguments, label);

    this.set({
      rich: true,
      focusable : false,
      keepActive : true,
      allowShrinkX : false,
      allowShrinkY : false
    });

    this.setLayoutProperties({
      row: row,
      column: column,
      rowSpan: rowSpan || 1,
      colSpan: colSpan ||1
    });

    this._keyIdentifier = keyIdentifier || null;
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "calculator-button"
    }
  },

  members :
  {
    /**
     * Get the key identifier associated with this button
     *
     * @return {String} the key associated with this button
     */
    getKeyIdentifier : function() {
      return this._keyIdentifier;
    }
  }
});
