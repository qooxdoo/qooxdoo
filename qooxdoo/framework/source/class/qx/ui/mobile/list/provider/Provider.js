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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.list.provider.Provider",
{
  extend : qx.core.Object,


  properties:
  {
    delegate :
    {
      event: "changeDelegate",
      init: null,
      nullable: true,
      apply : "_applyDelegate"
    }
  },


  members :
  {
    __itemRenderer : null,


    _setItemRenderer : function(renderer) {
      this.__itemRenderer = renderer;
    },


    _getItemRenderer : function(renderer) {
      return this.__itemRenderer;
    },


    getItemElement : function(data, row)
    {
      this.__itemRenderer.reset();
      this._configureItem(data, row);
      var selectable = this.__itemRenderer.getSelectable();
      var children = this.__itemRenderer.getChildren();
      for (var i = 0, length=children.length; i < length; i++) {
        children[i].setAnonymous(selectable);
      }
      return this.__itemRenderer.getContainerElement().cloneNode(true);
    },


    _configureItem : function(data, row)
    {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.configureItem != null) {
        delegate.configureItem(this.__itemRenderer, data, row);
      }
    },


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


    _applyDelegate : function(value, old)
    {
      this._setItemRenderer(this._createItemRenderer());
    }
  },


  destruct : function()
  {
    this.__itemRenderer = null;
  }
});
