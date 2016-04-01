/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com

************************************************************************ */

/**
 * Used by qx.data.controller.Array to implement creating and disposing
 * items for the target array.
 * 
 * The interface is designed to allow the creation and disposal of items
 * independently of binding; this allows the caller to cache and reuse
 * target items (but it may not)
 */
qx.Interface.define("qx.data.controller.IArrayDelegate", {
  members: {
    /**
     * Creates an item for the target array
     * @return {qx.core.Object} a new target item
     */
    createTargetItem: function() {
      //
    },
    
    /**
     * Binds an item for the target array
     * @param targetItem {qx.core.Object} a target item, previously returned by createTargetItem
     * @param modelItem {qx.core.Object} a model item
     */
    bindTargetItem: function(targetItem, modelItem) {
      //
    },
    
    /**
     * Unbinds an item for the target array
     * @param targetItem {qx.core.Object} a target item, previously returned by createTargetItem
     * @param modelItem {qx.core.Object} a model item
     */
    unbindTargetItem: function(targetItem, modelItem) {
      //
    },
    
    /**
     * Disposes an item for the target array
     * @param targetItem {qx.core.Object} a target item, previously returned by createTargetItem
     */
    disposeTargetItem: function(targetItem) {
      //
    }
  }
});
