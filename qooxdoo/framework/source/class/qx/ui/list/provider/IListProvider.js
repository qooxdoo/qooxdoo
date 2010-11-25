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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * This interface needs to implemented from all {@link qx.ui.list.List} providers.
 * 
 * @internal
 */
qx.Interface.define("qx.ui.list.provider.IListProvider",
{
  members :
  {
    /**
     * Creates a layer for item and group rendering.
     * 
     * @return {qx.ui.virtual.layer.Abstract} new layer.
     */
    createLayer : function() {},


    /**
     * Creates a renderer for item rendering.
     * 
     * @return {var} new item renderer.
     */
    createItemRenderer : function() {},


    /**
     * Creates a renderer for group rendering.
     * 
     * @return {var} new group renderer.
     */
    createGroupRenderer : function() {},


    /**
     * Styles a selected item.
     *
     * @param item {var} item to style.
     */
    styleSelectabled : function(item) {},


    /**
     * Styles a not selected item.
     *
     * @param item {var} item to style.
     */
    styleUnselectabled : function(item) {},


    /**
     * Returns if the passed row can be selected or not.
     *
     * @param row {Integer} row to select.
     * @return {Boolean} <code>true</code> when the row can be selected,
     *    <code>false</code> otherwise.
     */
    isSelectable : function(row) {}
  }
});