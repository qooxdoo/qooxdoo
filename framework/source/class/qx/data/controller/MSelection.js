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
qx.Mixin.define("qx.data.controller.MSelection", 
{
  
  construct : function()
  {
    // check for a target property
    if (this.constructor.$$properties.target == undefined) {
      throw new Error("Target property is needed.");
    }
    
    // create a default selection array
    this.setSelection(new qx.data.Array());
  },
  
  
  properties : {
    selection : 
    {
      check: "qx.data.Array",
      event: "changeSelection",
      apply: "_applySelection",
      init: null
    }
  },
  

  members :
  {
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */    
    _applySelection: function(value, old) {
      // remove the old listener if necesarry
      if (this._selectionArrayListenerId != undefined && old != undefined) {
        old.removeListenerById(this._selectionArrayListenerId);
      }
      // add a new change listener to the changeArray
      this._selectionArrayListenerId = value.addListener(
        "change", this.__changeSelectionArray, this
      );
    },
    
    
    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    __changeSelectionArray: function(e) {
      this._updateSelection();
    },
        
    
    __changeTargetSelection: function(e) {
      // if __changeSelectionArray is currently working, do nothing
      if (this.__modifingSelection) {
        return;
      }
      
      if (this.__targetSupportsMultiSelection()) {
        // get the selection of the target
        var targetSelection = this.getTarget().getSelection();        
      } else if (this.__targetSupportsSingleSelection()) {
        // get the selection of the target as an array
        var targetSelection = [this.getTarget().getSelected()];
      }  
      
      // go through the target selection
      for (var i = 0; i < targetSelection.length; i++) {
        // get the fitting item
        var item = targetSelection[i].getUserData("model");
        if (!this.getSelection().contains(item)) {
          this.getSelection().push(item);
        }
      }
      
      // get all items selected in the list
      var targetSelectionItems = [];
      for (var i = 0; i < targetSelection.length; i++) {
        targetSelectionItems[i] = targetSelection[i].getUserData("model");
      }
      
      // go through the controller selection
      for (var i = this.getSelection().length - 1; i >= 0; i--) {
        // if the item in the controller selection is not selected in the list
        if (!qx.lang.Array.contains(
          targetSelectionItems, this.getSelection().getItem(i)
        )) {
          // remove the current element
          this.getSelection().splice(i, 1);
        }
      }

      // fire the change event manualy
      this.fireDataEvent("changeSelection", this.getSelection());
    },
    
    
    /*
    ---------------------------------------------------------------------------
       SELECTION
    ---------------------------------------------------------------------------
    */
    _addChangeTargetListener: function(value, old) {
      // remove the old selection listener
      if (this.__selectionListenerId != undefined && old != undefined) {
        old.removeListenerById(this.__selectionListenerId);
      }

      // if a selection API is supported
      var sSupport = this.__targetSupportsSingleSelection();
      var mSupport = this.__targetSupportsMultiSelection();
      if (mSupport || sSupport) {
        // add a new selection listener
        this.__selectionListenerId = value.addListener(
          "changeSelection", this.__changeTargetSelection, this
        );        
      }
    },
    
    
    _updateSelection: function() {
      // mark the change process in a flag
      this.__modifingSelection = true;      
      
      // if its a multi selection target
      if (this.__targetSupportsMultiSelection()) {
        
        // remove the old selection
        this.getTarget().resetSelection();
        // go through the selection array
        for (var i = 0; i < this.getSelection().length; i++) {
          // select each item
          this.__selectItem(this.getSelection().getItem(i));
        }
        
        // get the selection of the target
        var targetSelection = this.getTarget().getSelection();
        // get all items selected in the list
        var targetSelectionItems = [];
        for (var i = 0; i < targetSelection.length; i++) {
          targetSelectionItems[i] = targetSelection[i].getUserData("model");
        }

        // go through the controller selection
        for (var i = this.getSelection().length - 1; i >= 0; i--) {
          // if the item in the controller selection is not selected in the list
          if (!qx.lang.Array.contains(
            targetSelectionItems, this.getSelection().getItem(i)
          )) {
            // remove the current element
            this.getSelection().splice(i, 1);
          }
        }      
        
      // if its a single selection target      
      } else if (this.__targetSupportsSingleSelection()) {
        // select the last selected item (old selection will be removed anyway)
        this.__selectItem(
          this.getSelection().getItem(this.getSelection().length - 1)
        );
      }
      
      // reset the changing flag
      this.__modifingSelection = false;       
    },    
    
    
    __targetSupportsMultiSelection: function() {
      var targetClass = this.getTarget().constructor;
      return qx.Class.implementsInterface(targetClass, qx.ui.core.IMultiSelection);
    },
    
    
    __targetSupportsSingleSelection: function() {
      var targetClass = this.getTarget().constructor;      
      return qx.Class.implementsInterface(targetClass, qx.ui.core.ISingleSelection);
    },
    
    
    __selectItem: function(item) {
      // get all list items
      var children = this.getTarget().getSelectables();
    
      // go through all children and search for the child to select
      for (var i = 0; i < children.length; i++) {
        if (children[i].getUserData("model") == item) {
          // if the target is multi selection able
          if (this.__targetSupportsMultiSelection()) {            
            // select the item in the target
            this.getTarget().addToSelection(children[i]);
          // if the target is single selection able
          } else if (this.__targetSupportsSingleSelection()) {
            this.getTarget().setSelected(children[i]);
          }
          return;
        }
      }        
    }
        
  }
});
