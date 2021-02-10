/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Objects, which are used as delegates for {@link qx.ui.virtual.cell.WidgetCell} may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the {@link qx.ui.virtual.cell.WidgetCell} provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.ui.virtual.cell.IWidgetCellDelegate",
{
  members :
  {
    /**
     * Creates a <code>Widget</code> which will be used for rendering.
     *
     * @return {qx.ui.core.LayoutItem} A new created <code>Widget</code>.
     */
    createWidget : function() {}
  }
});