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


  construct : function(model, target, childPath)
  {
    this.base(arguments);
    
    this.setChildPath(childPath);
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
    }
  },

  members :
  {
    _applyTarget: function(value, old) {
      // add a new root node
      var rootNode = new qx.ui.tree.TreeFolder("root");
      this.getTarget().setRoot(rootNode);
      this.__addTreeChildren(rootNode, this.getModel());
    },
    
    _applyModel: function(value, old) {

    },
    
    
    __addTreeChildren: function(rootNode, modelNode) {
      // go threw all children
      for (var i = 0; i < modelNode.getChildren().length; i++) {
        var node = new qx.ui.tree.TreeFolder("name");
        rootNode.add(node);
        this.__addTreeChildren(node, modelNode.getChildren().getItem(i));
      }
    }
  }
});
