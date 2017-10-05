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
 *
 * NOTE 1: Although the instance of OpenCloseController associates itself with
 * a specific tree, disposal of that tree does not dispose the
 * OpenCloseController. It is the responsibility of the instantiator to
 * arrange for disposal of this controller.
 *
 * NOTE 2: This uses {@link qx.event.message.Bus} to send messages between
 * tree items and this controller. The 'name' of the messages is created to be
 * unique among trees. It uses the hash code of the tree, with ".open"
 * appended to it. A message 'name' might therefore be something like
 * "37422-0.open".
 */
qx.Class.define("qx.ui.tree.core.OpenCloseController",
{
  extend: qx.core.Object,
  
  /**
   * @param tree {qx.ui.tree.VirtualTree}
   *   The tree whose branch open or closed state is to be synchronized to a
   *   model property.
   * 
   * @param model {qx.data.Array}
   *   The model wherein a property is to be synchronized to the tree
   *   branches' open or closed states
   * 
   * @param openPropertyName {String?"open"}
   *   The name of the boolean property in the model which controls whether a
   *   branch in the tree is open or closed. Defaults to "open".
   */
  construct: function(tree, model, openPropertyName)
  {
    this.base(arguments);
    
    // If a property name was specified, use it instead of the default
    if (openPropertyName)
    {
      tree.setOpenPropertyName(openPropertyName);
    }
    
    // Save the tree and initialize storage of listener IDs
    this._tree = tree;
    this._lids = [];
    
    // Sync tree nodes
    var sync = function(node) {
      var openPropertyName = this._tree.getOpenPropertyName();

      if (qx.Class.hasProperty(node.constructor, "children")) {
        node.getChildren().forEach(sync);
      }
      
      if (qx.Class.hasProperty(node.constructor, openPropertyName)) {
        if (node.get(openPropertyName)) {
          tree.openNode(node);
        }
        else {
          tree.closeNode(node);
        }
      }
    }.bind(this);
    sync(model.getItem(0));
    
    // Wire change listeners
    var lid = tree.addListener("open", this._onOpen, this);
    this._lids.push([tree, lid]);
    lid = tree.addListener("close", this._onClose, this);
    this._lids.push([tree, lid]);

    // Await messages from VirtualTreeItem indicating a model change. (This is
    // more efficient that requiring change bubbles for open changes on the
    // model.)
    var messageBus = qx.event.message.Bus.getInstance();
    var eventType = tree.toHashCode() + ".open";
    messageBus.subscribe(eventType, this._onBusMessage, this);
  },
  
  properties :
  {
    /**
     * Name of the property whose value determines whether a branch is open or
     * not
     */
    openPropertyName :
    {
      check : "String",
      nullable : false,
      init : "open"
    }
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
      var model = ev.getData();
      var openPropertyName = this._tree.getOpenPropertyName();

      model.set(openPropertyName, true);
    },
    
    // event listener for "close" on the tree
    _onClose: function(ev)
    {
      var model = ev.getData();
      var openPropertyName = this._tree.getOpenPropertyName();

      model.set(openPropertyName, false);
    },
    
    // event listener for messages from VirtualTreeItems indicating that a
    // model change is intended to cause a branch to open or close
    _onBusMessage : function(busMessage)
    {
      var change = busMessage.getData();

      if (change.value && !this._tree.isNodeOpen(change.item)) {
        this._tree.openNode(change.item);
      }
      else if (!change.value && this._tree.isNodeOpen(change.item)) {
        this._tree.closeNode(change.item);
      }
    }
  },
  
  destruct: function()
  {
    var messageBus = qx.event.message.Bus.getInstance();

    messageBus.unsubscribe(this._tree.toHashCode() + ".open");
    this._tree = null;
    this._lids.forEach(function(data) {
      data[0].removeListenerById(data[1]);
    });
  }
});
