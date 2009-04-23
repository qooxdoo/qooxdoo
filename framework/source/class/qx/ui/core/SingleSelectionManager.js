/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * Responsible for the single selection management.
 *
 * @internal
 */
qx.Class.define("qx.ui.core.SingleSelectionManager",
{
  extend : qx.core.Object,

  //TODO API doc
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  
  
  construct : function(selectionProvider) {
    this.base(arguments);
    
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      qx.core.Assert.assertInterface(selectionProvider, 
        qx.ui.core.ISingleSelectionProvider, 
        "Invalid selectionProvider!");
    }
    
    this.__selectionProvider = selectionProvider;
  },  
  
  
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  
  
  events :
  {
    /** Fires after the selection was modified */
    "changeSelected" : "qx.event.type.Data"
  },
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  
  properties :
  {
    allowEmptySelection : 
    {
      check : "Boolean",
      init : true,
      apply : "__applyAllowEmptySelection"
    }
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  
  
  members :
  {
    __selected : null,
    
    __selectionProvider : null,
    
    
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */
    
    
    getSelected : function() {
      return this.__selected;
    },
    
    setSelected : function(item) {
      if (!this.__isChildElement(item)) {
        throw new Error("Could not select " + item +
          ", because it is not a child element!");
      }
      
      this.__setSelected(item);
    },
    
    resetSelected : function(){
      this.__setSelected(null);
    },
    
    isSelected : function(item) {
      if (!this.__isChildElement(item)) {
        throw new Error("Could not check if " + item + " is selected," +
          " because it is not a child element!");
      }
      return this.__selected === item;
    },
    
    isSelectionEmpty : function() {
      return this.__selected == null;
    },
    
    getSelectables : function()
    {
      var items = this.__selectionProvider.getItems();
      var result = [];
      
      for (var i = 0; i < items.length; i++)
      {
        if (items[i].isEnabled()) {
          result.push(items[i]);
        }
      }
      return result;
    },
    
    
    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */
    
    
    __applyAllowEmptySelection : function(value, old)
    {
      if (!value) {
        this.__setSelected(this.__selected);
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
       HELPERS
    ---------------------------------------------------------------------------
    */
    
    
    __setSelected : function(item) {
      var oldSelected = this.__selected;
      var newSelected = item;
      
      if (oldSelected === newSelected) {
        return;
      }
      
      if (!this.isAllowEmptySelection() && newSelected == null) {
        var firstElement = this.getSelectables()[0];
        
        if (firstElement) {
          newSelected = firstElement;
        }
      }
      
      this.__selected = newSelected;
      this.fireDataEvent("changeSelected", newSelected, oldSelected);
    },
    
    __isChildElement : function(item)
    {
      var items = this.__selectionProvider.getItems();
      
      for (var i = 0; i < items.length; i++)
      {
        if (items[i] === item)
        {
          return true;
        }
      }
      return false;
    }
  }
});