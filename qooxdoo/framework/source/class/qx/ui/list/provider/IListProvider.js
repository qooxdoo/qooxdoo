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
     * @param row {Integer} row to style.
     */
    styleSelectabled : function(row) {},


    /**
     * Styles a not selected item.
     *
     * @param row {Integer} row to style.
     */
    styleUnselectabled : function(row) {},


    /**
     * Returns if the passed row can be selected or not.
     *
     * @param row {Integer} row to select.
     * @return {Boolean} <code>true</code> when the row can be selected,
     *    <code>false</code> otherwise.
     */
    isSelectable : function(row) {},


    /**
     * The path to the property which holds the information that should be
     * shown as a label. This is only needed if objects are stored in the model.
     *
     * @param path {String} path to the property.
     */
    setLabelPath : function(path) {},


    /**
     * The path to the property which holds the information that should be
     * shown as an icon. This is only needed if objects are stored in the model
     * and if the icon should be shown.
     *
     * @param path {String} path to the property.
     */
    setIconPath : function(path) {},


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     *
     * @param options {Map} options for the label binding.
     */
    setLabelOptions : function(options) {},


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     *
     * @param options {Map} options for the icon binding.
     */
    setIconOptions : function(options) {},


    /**
     * Delegation object, which can have one or more functions defined by the
     * {@link qx.ui.list.core.IListDelegate} interface.
     *
     * @param delegate {Object} delegation object.
     */
    setDelegate : function(delegate) {},


    /**
     * Remove all bindings from all bounded items.
     */
    removeBindings : function() {}
  }
});