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

      if (model == null || !qx.Class.hasProperty(model.constructor, childProperty)) {
        return false;
      }

      var children = model.get(childProperty);
      if (children == null) {
        return false;
      }

      if (this.getUserData("cell.showLeafs")) {
        return children.length > 0;
      }
      else
      {
        for (var i = 0; i < children.getLength(); i++)
        {
          var child = children.getItem(i);
          if (qx.Class.hasProperty(child.constructor, childProperty)) {
            return true;
          }
        }
      }
      return false;
    },


    // apply method
    _applyModel : function(value, old)
    {
      var childProperty = this.getUserData("cell.childProperty");

      if (value != null && qx.Class.hasProperty(value.constructor, childProperty) && value.get(childProperty) != null) {
        value.get(childProperty).addListener("changeLength", this._onChangeLength, this);
      }

      if (old != null && qx.Class.hasProperty(old.constructor, childProperty)&& old.get(childProperty) != null) {
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