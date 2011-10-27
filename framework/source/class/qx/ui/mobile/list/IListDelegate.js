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
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Objects which are used as delegates for the {@link qx.ui.mobile.list.List#delegate} may
 * implement any of the methods described in this interface. The delegate does
 * not need to implement all the methods of this interface. If a method is not
 * implemented the {@link qx.ui.mobile.list.provider.Provider} provides a default
 * implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * actually implemented.
 */
qx.Interface.define("qx.ui.mobile.list.IListDelegate",
{
  members :
  {
    /**
     * Configure the list item renderer with the given data. Mandatory method.
     * At least this method has to be defined for the delegate.
     *
     * @param item {qx.ui.mobile.list.renderer.Abstract} Instance of list item renderer to modify
     * @param data {var} The data of the row. Can be used to configure the given item.
     * @param row {Integer} The row index.
     */
    configureItem : function(item, data, row) {},



    /**
     * Creates an instance of the item renderer to use.
     *
     * @return {qx.ui.mobile.list.renderer.Abstract} An instance of the item renderer.
     */
    createItemRenderer : function() {}
  }
});