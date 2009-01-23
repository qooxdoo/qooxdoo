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
  include: qx.data.controller.MSelection,


  construct : function(model, target, childPath, labelPath, iconPath, labelOptions, iconOptions)
  {
    this.base(arguments);
    
    // internal bindings reference
    this.__labelBindings = {};
    this.__iconBindings = {};
    // reference to the child
    this.__childrenRef = {};
    
    if (iconPath != undefined) {
      this.setIconPath(iconPath);
    }
    if (labelOptions != undefined) {
      this.setLabelOptions(labelOptions);
    }
    if (iconOptions != undefined) {
      this.setIconOptions(iconOptions);
    }    
    
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
      apply: "_applyChildPath",
      nullable: true
    },
    
    labelPath : 
    {
      check: "String",
      apply: "_applyLabelPath"
    },
    
    iconPath : 
    {
      check: "String",
      apply: "_applyIconPath",
      nullable: true
    },
    
    labelOptions : 
    {
      apply: "_applyLabelOptions",
      nullable: true
    },
    
    iconOptions :
    {
      apply: "_applyIconOptions",
      nullable: true
    }
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */    
    _applyIconOptions: function(value, old) {
      this.__renewBindings();
    },
    
    
    _applyLabelOptions: function(value, old) {
      this.__renewBindings();
    },
    
    
    _applyTarget: function(value, old) {
      // if there was an old target
      if (old != undefined) {
        // get rid of the old stuff
        var oldRoot = old.getRoot();
        old.setRoot(null);
        oldRoot.destroy();
      }
      // build up the tree
      this.__buildTree();
      
      // add a listener for the target change
      this.__addChangeTargetListener(value, old);      
    },
    
    
    _applyModel: function(value, old) {
      this.__buildTree(); 
    },
    
    
    _applyChildPath: function(value, old) {
      this.__buildTree();      
    },
    
    
    _applyIconPath: function(value, old) {
      this.__renewBindings();      
    },
    
    
    _applyLabelPath: function(value, old) {
      this.__renewBindings();        
    },
    

    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    __changeModelChildren: function(ev) {
      // get the stored data
      var children =  ev.getTarget();
      var treeNode = this.__childrenRef[children.toHashCode()].treeNode;
      var modelNode = this.__childrenRef[children.toHashCode()].modelNode;
      // update the subtree
      this.__updateTreeChildren(treeNode, modelNode);
      
      // update the selection in case a selected element has been removed
      this.__updateSelection();
    },
    
    
    /*
    ---------------------------------------------------------------------------
       ITEM HANDLING
    ---------------------------------------------------------------------------
    */    
    __buildTree: function() {
      // only fill the target if there is a target
      if (this.getTarget() == null) {
        return;
      }
      
      // check for the old root node
      var oldRoot = this.getTarget().getRoot();
      if (oldRoot != null) {
        oldRoot.destroy();
      }
      
      // add a new root node
      var rootNode = new qx.ui.tree.TreeFolder();
      rootNode.setUserData("model", this.getModel());
      this.getTarget().setRoot(rootNode);
      // bind the root node
      this.__addBinding(this.getModel(), rootNode);
      this.__updateTreeChildren(rootNode, this.getModel());
    },
    
    
    __updateTreeChildren: function(rootNode, modelNode) {
      // ignore items which dont have children
      if (modelNode["get" + qx.lang.String.firstUp(this.getChildPath())] == undefined) {
        return;
      }
      // get all children of the current model node
      var children = 
        modelNode["get" + qx.lang.String.firstUp(this.getChildPath())]();
      
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
        // if there is no node in the tree or the current node does not fit
        if (rootNode.getChildren()[i] == null || children.getItem(i) != rootNode.getChildren()[i].getUserData("model"))
        {
          //chech if the node was just moved
          for (var j = i; j < rootNode.getChildren().length; j++) {
            if (rootNode.getChildren()[j].getUserData("model") === children.getItem(i)) {
              var oldIndex = j;
              break;
            }
          }
          // if it is in the tree
          if (oldIndex != undefined) {
            // get the coresponding node
            var currentNode = rootNode.getChildren()[oldIndex];
            // check if it is selected
            if (this.getTarget().isSelected(currentNode)) {
              var wasSelected = true;
            }        
            // remove the item at its old place (will remove the selection)
            rootNode.removeAt(oldIndex);
            // add the node at the current position
            rootNode.addAt(currentNode, i);
            // select it again if it was selected
            if (wasSelected) {
              this.getTarget().addToSelection(currentNode);
            }
            
          // if the node is new 
          } else {
            // add the child node
            var treeNode = new qx.ui.tree.TreeFolder();
            treeNode.setUserData("model", children.getItem(i));
            rootNode.addAt(treeNode, i);
            this.__addBinding(children.getItem(i), treeNode);

            // add all children recursive        
            this.__updateTreeChildren(treeNode, children.getItem(i));            
          }
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
      
      // if the model does have a child path
      if (
        model["get" + qx.lang.String.firstUp(this.getChildPath())] != undefined
      )
      {
        // delete the model reference
        delete this.__childrenRef[
          model["get" + qx.lang.String.firstUp(this.getChildPath())]().toHashCode()
        ];        
      }
      // get the binding and remove it
      this.__removeBinding(model);
      // remove the folder from the tree
      rootNode.remove(treeFolder);      
    },
    


    /*
    ---------------------------------------------------------------------------
       BINDING STUFF
    ---------------------------------------------------------------------------
    */
    __renewBindings: function() {
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
      // label binding
      var id = modelNode.bind(
        this.getLabelPath(), treeNode, "label", this.getLabelOptions()
      );
      this.__labelBindings[modelNode.toHashCode()] = {id: id, treeNode: treeNode};

      // icon binding
      if (this.getIconPath() != null) {
        id = modelNode.bind(
          this.getIconPath(), treeNode, "icon", this.getIconOptions()
        );
        this.__iconBindings[modelNode.toHashCode()] = {id: id, treeNode: treeNode};        
      }
    },
    
    
    __removeBinding: function(modelNode) {
      // label binding
      var id = this.__labelBindings[modelNode.toHashCode()].id;
      modelNode.removeBinding(id);
      delete this.__labelBindings[modelNode.toHashCode()];
      
      // icon binding
      var bindingMap = this.__iconBindings[modelNode.toHashCode()];
      if (bindingMap != undefined) {
        modelNode.removeBinding(bindingMap.id);
        delete this.__iconBindings[modelNode.toHashCode()];        
      }
    }
  }
});