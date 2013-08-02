/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The tree item is a tree element for the {@link VirtualTree}, which can have
 * nested tree elements.
 */
qx.Class.define("qx.ui.tree.VirtualTreeItem",
{
  extend : qx.ui.tree.core.AbstractItem,


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-tree-folder"
    }
  },


  members :
  {
    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      selected : true
    },


    // overridden
    _addWidgets : function()
    {
      this.addSpacer();
      this.addOpenButton();
      this.addIcon();
      this.addLabel();
    },


    // overridden
    _shouldShowOpenSymbol : function()
    {
      var open = this.getChildControl("open", true);
      if (open == null) {
        return false;
      }

      return this.isOpenable();
    },


    // overridden
    getLevel : function() {
      return this.getUserData("cell.level");
    },


    // overridden
    hasChildren : function()
    {
      var model = this.getModel();
      var childProperty = this.getUserData("cell.childProperty");
      var showLeafs = this.getUserData("cell.showLeafs");

      return qx.ui.tree.core.Util.hasChildren(model, childProperty, showLeafs);
    },


    // apply method
    _applyModel : function(value, old)
    {
      var childProperty = this.getUserData("cell.childProperty");

      if (value != null && qx.ui.tree.core.Util.isNode(value, childProperty)) {
        value.get(childProperty).addListener("changeLength", this._onChangeLength, this);
      }

      if (old != null && qx.ui.tree.core.Util.isNode(old, childProperty)) {
        old.get(childProperty).removeListener("changeLength", this._onChangeLength, this);
      }
    },


    /**
     * Handler to update open/close icon when model length changed.
     */
    _onChangeLength : function() {
      this._updateIndent();
    }
  }
});