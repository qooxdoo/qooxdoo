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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */
qx.Class.define("demobrowser.demo.virtual.messenger.Controller", 
{
  extend : qx.core.Object,

  /**
   * @param model {qx.data.Array} Model to be used in this controller.
   * @param target {Object} Target. This controller can be extended to support
   * target switching.
   */
  construct : function(model, target)
  {
    this.base(arguments);
    
    this.__oldModelLength = 0;
    
    this.setTarget(target);
    this.setModel(model);
  },
  
  properties : 
  {

    /** Model for this controller. */
    model : 
    {
      check : "qx.data.Array",
      event : "changeModel",
      apply : "_applyModel"
    },

    /** This property is just needed for the changeTarget event. */
    target : 
    {
      event : "changeTarget"
    }
  },

  members :
  {

    __oldModelLength : null,

    // property apply
    _applyModel: function(value, old)
    {
      value.addListener("changeLength", this._modelLengthChange, this);
      value.addListener("change", this._updateTarget, this);
      
      this._modelLengthChange();
      
      this.__oldModelLength = value.length;
    }, 

    /**
     * Listener for the model length. Calls _addBudyChangeListener() for the
     * latest entry in model if the new model size has increased.
     */
    _modelLengthChange: function()
    {
      if (this.__oldModelLength > this.getModel().length)
      {
        for (var i = this.__oldModelLength; i < this.getModel().length; i++) {
          this._addBudyChangeListener(i);
        }
      }
    },

    /**
     * Adds change listeners for every property in given model entry.
     * @param index {Number} The index of the entry in the model.
     */
    _addBudyChangeListener: function(index)
    {
      var buddy = this.getModel().getItem(index);

      buddy.addListener("changeName", this._updateTarget, this);
      buddy.addListener("changeAvatar", this._updateTarget, this);
      buddy.addListener("changeStatus", this._updateTarget, this);            
    },

    /**
     * Triggers an update on the target.
     */
    _updateTarget: function() {
      this.getTarget().update();
    }
  }
});
