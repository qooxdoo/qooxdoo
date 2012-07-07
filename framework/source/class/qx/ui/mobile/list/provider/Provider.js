/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Provides a list item element for a certain row and its data.
 * Uses the {@link qx.ui.mobile.list.renderer.Default} list item renderer as a
 * default renderer when no other renderer is given by the {@link qx.ui.mobile.list.List#delegate}.
 */
qx.Class.define("qx.ui.mobile.list.provider.Provider",
{
  extend : qx.core.Object,


 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.mobile.list.IListDelegate} interface. Set by the list.
     *
     * @internal
     */
    delegate :
    {
      event: "changeDelegate",
      init: null,
      nullable: true,
      apply : "_applyDelegate"
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __itemRenderer : null,


    /**
     * Sets the item renderer.
     *
     * @param renderer {qx.ui.mobile.list.renderer.Abstract} The used item renderer
     */
    _setItemRenderer : function(renderer) {
      this.__itemRenderer = renderer;
    },


    /**
     * Returns the set item renderer.
     *
     * @return {qx.ui.mobile.list.renderer.Abstract} The used item renderer
     */
    _getItemRenderer : function() {
      return this.__itemRenderer;
    },


    /**
     * Returns the list item element for a given row.
     *
     * @param data {var} The data of the row.
     * @param row {Integer} The row index.
     *
     * @return {Element} the list item element.
     */
    getItemElement : function(data, row)
    {
      this.__itemRenderer.reset();
      this._configureItem(data, row);
      // Clone the element and all it's events
      return qx.bom.Element.clone(this.__itemRenderer.getContainerElement(), true);
    },


    /**
     * Configure the list item renderer with the given data.
     *
     * @param data {var} The data of the row.
     * @param row {Integer} The row index.
     */
    _configureItem : function(data, row)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.configureItem != null) {
        delegate.configureItem(this.__itemRenderer, data, row);
      }
    },



    /**
     * Creates an instance of the item renderer to use. When no delegate method
     * is given the function will return an instance of {@link qx.ui.mobile.list.renderer.Default}.
     *
     * @return {qx.ui.mobile.list.renderer.Abstract} An instance of the item renderer.
     *
     */
    _createItemRenderer : function()
    {
      var createItemRenderer = qx.util.Delegate.getMethod(this.getDelegate(), "createItemRenderer");
      var itemRenderer = null;
      if (createItemRenderer == null)
      {
        itemRenderer = new qx.ui.mobile.list.renderer.Default();
      } else {
        itemRenderer = createItemRenderer();
      }

      return itemRenderer;
    },


    // property apply
    _applyDelegate : function(value, old)
    {
      this._setItemRenderer(this._createItemRenderer());
    }
  },

 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__itemRenderer");
  }
});
