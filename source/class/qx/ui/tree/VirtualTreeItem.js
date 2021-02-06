/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

      return qx.ui.tree.core.Util.hasChildren(model, childProperty, !showLeafs);
    },


    // apply method
    _applyModel : function(value, old)
    {
      var childProperty = this.getUserData("cell.childProperty");
      var showLeafs = this.getUserData("cell.showLeafs");

      if (value != null && qx.ui.tree.core.Util.isNode(value, childProperty))
      {
        var eventType = "change" + qx.lang.String.firstUp(childProperty);
        // listen to children property changes
        if (qx.Class.hasProperty(value.constructor, childProperty)) {
          value.addListener(eventType, this._onChangeChildProperty, this);
        }


        // children property has been set already, immediately add
        // listener for indent updating
        if (qx.ui.tree.core.Util.hasChildren(value, childProperty, !showLeafs)) {
          value.get(childProperty).addListener("changeLength",
            this._onChangeLength, this);
          this._updateIndent();
        }
      }


      if (old != null && qx.ui.tree.core.Util.isNode(old, childProperty))
      {
        var eventType = "change" + qx.lang.String.firstUp(childProperty);
        old.removeListener(eventType, this._onChangeChildProperty, this);

        var oldChildren = old.get(childProperty);
        if (oldChildren) {
          oldChildren.removeListener("changeLength", this._onChangeLength, this);
        }
      }
    },


    /**
     * Handler to update open/close icon when model length changed.
     */
    _onChangeLength : function() {
      this._updateIndent();
    },


    /**
     * Handler to add listener to array of children property.
     *
     * @param e {qx.event.type.Data} Data event; provides children array
     */
    _onChangeChildProperty : function(e)
    {
      var children = e.getData();
      var old = e.getOldData();

      if (children) {
        this._updateIndent();
        children.addListener("changeLength", this._onChangeLength, this);
      }

      if (old) {
        old.removeListener("changeLength", this._onChangeLength, this);
      }
    }
  }
});