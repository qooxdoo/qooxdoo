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
/**
 * This mixin offers the selection of the model properties.
 * It can only be included if the object including it implements the
 * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
 * the {@link qx.ui.form.IModel} interface.
 */
qx.Mixin.define("qx.ui.form.MModelSelection",
{
  
  construct : function() {   
    // create the selection array 
    this.__selection = new qx.data.Array();
    
    // listen to the changes
    this.__selection.addListener("change", this.__onModelSelectionArrayChange, this);
    this.addListener("changeSelection", this.__onModelSelectionChange, this);
  },
  
  
  events : 
  {
    /**
     * Pseudo event. It will never be fired becasue the array itself can not 
     * be changed. But the event description is needed for the data binding.
     */ 
    changeModelSelection : "qx.event.type.Data"
  },
  
  
  members :
  {    
    
    __selection : null,
    __inSelectionChange : false,
        
    
    /**
     * Handler for the selection change of the including class e.g. SelectBox, 
     * List, ...
     * It sets the new modelSelection via {@link #setModelSelection}.
     * 
     * @param e {qx.eventy.type.Data} The change event of the selection.
     */
    __onModelSelectionChange : function(e) {
      if (this.__inSelectionChange) {
        return;
      }      
      var data = e.getData();

      // add the first two parameter
      var modelSelection = [];
      for (var i = 0; i < data.length; i++) {
        var model = data[i].getModel();
        if (model != null) {
          modelSelection.push(model);          
        }
      };
          
      this.setModelSelection(modelSelection);
    },
       
    
    /**
     * Listener for the change of the internal model selection data array.
     */
    __onModelSelectionArrayChange : function() {
      this.__inSelectionChange = true;
      var selectables = this.getSelectables();
      var itemSelection = [];

      var modelSelection = this.__selection.toArray();
      for (var i = 0; i < modelSelection.length; i++) {
        var model = modelSelection[i];
        for (var j = 0; j < selectables.length; j++) {
          var selectable = selectables[j];
          if (model === selectable.getModel()) {
            itemSelection.push(selectable);
            break;
          }
        }
      }      

      this.setSelection(itemSelection);
      this.__inSelectionChange = false;
    },

    
    /**
     * Returns always an array of the models of the selected items. If no
     * item is selected or no model is given, the array will be empty.
     *
     * @return {qx.data.Array} An array of the models of the selected items.
     */
    getModelSelection : function()
    {
      return this.__selection;
    },


    /**
     * Takes the given models in the array and searches for the corresponding
     * selecables. If an selectable does have that model attached, it will be
     * selected.
     *
     * *Attention:* This method can have a time complexity of O(n^2)!
     *
     * @param modelSelection {Array} An array of models, which should be
     *   selected.
     */
    setModelSelection : function(modelSelection)
    {
      // check for null values
      if (!modelSelection) 
      {
        this.__selection.removeAll();
        return;
      }
      
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assertArray(modelSelection, "Please use an array as parameter.");
      }
            
      // add the first two parameter
      modelSelection.unshift(this.__selection.getLength()); // remove index
      modelSelection.unshift(0);  // start index
          
      this.__selection.splice.apply(this.__selection, modelSelection);
    }
  }
});
