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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.data.controller.Tree", 
{
  extend : qx.core.Object,


  construct : function(model, target, childPath, labelPath)
  {
    this.base(arguments);
    
    // internal bindings reference
    this.__labelBindings = {};
    
    this.__childrenRef = {};
    
    this.setChildPath(childPath);
    this.setLabelPath(labelPath);
    this.setModel(model);
    this.setTarget(target);    
  },
  
  
  properties : 
  {
    model : 
    {
      check: "qx.core.Object",
      apply: "_applyModel",
      event: "changeModel"
    },
    
    target : 
    {
      apply: "_applyTarget",
      event: "changeTarget",
      init: null
    },
    
    childPath : 
    {
      check: "String",
      nullable: true
    },
    
    labelPath : 
    {
      check: "String",
      apply: "_applyLabelPath"
    }
  },

  members :
  {
    _applyTarget: function(value, old) {
      // add a new root node
      var rootNode = new qx.ui.tree.TreeFolder();
      this.getTarget().setRoot(rootNode);
      // bind the root node
      this.__addBinding(this.getModel(), rootNode);
      this.__updateTreeChildren(rootNode, this.getModel());
    },
    
    
    _applyModel: function(value, old) {

    },
    
    
    _applyLabelPath: function(value, old) {
      this.__renewAllBindings();
    },
    
    
    __changeModelChildren: function(ev) {
      // get the stored data
      var children =  ev.getTarget();
      var treeNode = this.__childrenRef[children.toHashCode()].treeNode;
      var modelNode = this.__childrenRef[children.toHashCode()].modelNode;
      // update the subtree
      this.__updateTreeChildren(treeNode, modelNode);
    },
    
    
    __updateTreeChildren: function(rootNode, modelNode) {
      // get all children of the current model node
      var children = modelNode.getChildren();
      
      // store the children reference
      if (this.__childrenRef[children.toHashCode()] == undefined) {
        // add the listener for the change
        var changeListenerId = children.addListener(
          "change", this.__changeModelChildren, this
        );
        this.__childrenRef[children.toHashCode()] = 
          {modelNode: modelNode, treeNode: rootNode, changeListenerId: changeListenerId};        
      }
          
      // go threw all children in the model
      for (var i = 0; i < children.length; i++) {
        // if there is no node in the tree
        if (rootNode.getChildren()[i] == null 
          || children.getItem(i) != rootNode.getChildren()[i].getUserData("model")
        )
        {
            // add the child node
            var treeNode = new qx.ui.tree.TreeFolder();
            treeNode.setUserData("model", children.getItem(i));
            rootNode.addAt(treeNode, i);
            this.__addBinding(children.getItem(i), treeNode);

            // add all children recursive        
            this.__updateTreeChildren(treeNode, children.getItem(i));          
        }
      }
      // remove the rest of the tree items if they exist
      for (var i = rootNode.getChildren().length -1; i >= children.length; i--) {
        var treeFolder = rootNode.getChildren()[i];
        this.__removeFolder(treeFolder, rootNode);
      }
    },


    __removeFolder: function(treeFolder, rootNode) {
      // get the model
      var model = treeFolder.getUserData("model");
      // delete the model reference
      delete this.__childrenRef[model.getChildren().toHashCode()];
      // get the binding and remove it
      var bindingId = this.__labelBindings[model.toHashCode()].id;
      model.removeBinding(bindingId);
      delete this.__labelBindings[model.toHashCode()];
      // remove the folder from the tree
      rootNode.remove(treeFolder);      
    },
    

    __renewAllBindings: function() {
      for (var hash in this.__labelBindings) {
        // get the data 
        var treeNode = this.__labelBindings[hash].treeNode;
        var modelNode = qx.core.ObjectRegistry.fromHashCode(hash);
        // remove the old bindings
        this.__removeBinding(modelNode);
        // add the new bindings
        this.__addBinding(modelNode, treeNode);
      }
    },
    
    
    __addBinding: function(modelNode, treeNode) {
      // bind the node
      var id = modelNode.bind(this.getLabelPath(), treeNode, "label");
      // save the id
      this.__labelBindings[modelNode.toHashCode()] = {id: id, treeNode: treeNode};      
    },
    
    
    __removeBinding: function(modelNode) {
      var id = this.__labelBindings[modelNode.toHashCode()].id;
      modelNode.removeBinding(id);
    }
  }
});
