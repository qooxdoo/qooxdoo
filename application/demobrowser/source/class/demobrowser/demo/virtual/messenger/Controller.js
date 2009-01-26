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
qx.Class.define("demobrowser.demo.virtual.messenger.Controller", 
{
  extend : qx.core.Object,


  construct : function(model, target)
  {
    this.base(arguments);
    
    this.__oldModelLength = 0;
    
    this.setTarget(target);
    this.setModel(model);
  },
  
  properties : 
  {
    model : 
    {
      check : "qx.data.Array",
      event: "changeModel",
      apply: "_applyModel"
    },
    
    target : 
    {
      event: "changeTarget"
    }
  },

  members :
  {
    _applyModel: function(value, old) {
      value.addListener("changeLength", this._modelLengthChange, this);
      value.addListener("change", this._updateTarget, this);
      
      this._modelLengthChange();
      
      this.__oldModelLength = value.length;
    }, 
    
    _modelLengthChange: function() {
      if (this.__oldModelLength > this.getModel().length) {
        for (var i = this.__oldModelLength; i < this.getModel().length; i++) {
          this._addBudyChangeListener(i);
        }
      }
    },
    
    _addBudyChangeListener: function(index) {
      var buddy = this.getModel().getItem(index);
      buddy.addListener("changeName", this._updateTarget, this);
      buddy.addListener("changeAvatar", this._updateTarget, this);
      buddy.addListener("changeStatus", this._updateTarget, this);            
    },
    
    
    _updateTarget: function() {
      this.getTarget().update();
    }
  }
});
