/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Cajus Pollmeier

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier
     * Derrell Lipman

************************************************************************ */

/**
 * Because of the virtual nature of the VirtualTree, and the fact that
 * rendering occurs asynchronously, it is not a simple matter to bind a
 * property in the model that will open or close branches in the
 * tree. Instead, this controller listens to both the model and the tree, and
 * synchronizes the openness of branches in the tree.
 * 
 * To use this controller, simply instantiate it with the requisite
 * constructor arguments.
 */
qx.Class.define("qx.ui.tree.core.OpenCloseController",
{
  extend: qx.core.Object,
  
  /**
   * @param tree {qx.ui.tree.VirtualTree}
   *   The tree whose branch open or closed state is to be synchronized to a
   *   model property.
   * 
   * @param rootModel {qx.data.Array}
   *   The tree root model wherein a property is to be synchronized to the
   *   tree branches' open or closed states
   */
  construct: function(tree, rootModel)
  {
    var             openProperty = tree.getOpenProperty();

    this.base(arguments);
    
    // Save the tree and initialize storage of listener IDs
    this._tree = tree;
    this._lids = [];
    
    // Sync tree nodes
    var sync = function(node) {
      if (qx.Class.hasProperty(node.constructor, "children")) {
        node.getChildren().forEach(sync);
      }
      
      if (qx.Class.hasProperty(node.constructor, openProperty)) {
        if (node.get(openProperty)) {
          tree.openNode(node);
        }
        else {
          tree.closeNode(node);
        }
      }
    }.bind(this);
    sync(rootModel);
    
    // Wire change listeners
    var lid = tree.addListener("open", this._onOpen, this);
    this._lids.push([tree, lid]);
    lid = tree.addListener("close", this._onClose, this);
    this._lids.push([tree, lid]);
    lid = rootModel.addListener("changeBubble", this._onChangeBubble, this);
    this._lids.push([rootModel, lid]);
  },
  
  members:
  {
    /** The tree which is synced to the model */
    _tree: null,

    /** Listener IDs that we manage */
    _lids: null,
    
    // event listener for "open" on the tree
    _onOpen: function(ev)
    {
      ev.getData().set(this._tree.getOpenProperty(), true);
    },
    
    // event listener for "close" on the tree
    _onClose: function(ev)
    {
      ev.getData().set(this._tree.getOpenProperty(), false);
    },
    
    // event listener for model changes
    _onChangeBubble: function(ev)
    {
      var bubble = ev.getData();
      var modelPropRe;

      // generate a regular expression that identifies model changes that
      // pertain to the open state of a branch in the tree.
      modelPropRe = new RegExp("\\." + this._tree.getOpenProperty() + "$");
      
      // open related? sync it back to the node item.
      if (modelPropRe.test(bubble.name)) {
        if (bubble.value && !this._tree.isNodeOpen(bubble.item)) {
          this._tree.openNode(bubble.item);
        }
        else if (!bubble.value && this._tree.isNodeOpen(bubble.item)) {
          this._tree.closeNode(bubble.item);
        }
      }
    }
  },
  
  destruct: function()
  {
    this._tree = null;
    this._lids.forEach(function(data) {
      data[0].removeListenerById(data[1]);
    });
  }
});
