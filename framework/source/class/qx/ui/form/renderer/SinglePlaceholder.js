/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Renderer using the placeholder property of {@link qx.ui.form.AbstractField}
 * to visualize the name.
 */
qx.Class.define("qx.ui.form.renderer.SinglePlaceholder",
{
  extend : qx.ui.form.renderer.Single,
  implement : qx.ui.form.renderer.IFormRenderer,

  members :
  {
    // overridden
    addItems : function(items, names, title) {
      // add the header
      if (title != null) {
        this._add(
          this._createHeader(title), {row: this._row, column: 0, colSpan: 2}
        );
        this._row++;
      }

      // add the items
      for (var i = 0; i < items.length; i++) {
        if (items[i].setPlaceholder === undefined) {
          throw new Error("Only widgets with placeholders supported.");
        }
        items[i].setPlaceholder(names[i]);
        this._add(items[i], {row: this._row, column: 0});
        this._row++;
      }
    }
  }
});
