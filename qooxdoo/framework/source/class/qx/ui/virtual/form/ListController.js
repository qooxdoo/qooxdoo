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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */


qx.Class.define("qx.ui.virtual.form.ListController", 
{
  extend : qx.core.Object,


  construct : function(model, target)
  {
    this.base(arguments);  

    this.setSelection(new qx.data.Array());

    if (model != null) {
      this.setModel(model);
    }
    if (target != null) {
      this.setTarget(target);
    }
  },

  
  properties : 
  {
    target : 
    {
      check : "qx.ui.virtual.form.List",
      event: "changeTarget",
      nullable: true,
      init: null,
      apply: "_applyTarget"
    },

    model : 
    {
      check : "qx.data.IListData",
      event : "changeModel",
      nullable: true,
      init: null,
      apply: "_applyModel"
    },

    selection : 
    {
      check : "qx.data.IListData",
      event : "changeSelection",
      apply: "_applySelection"
    },
    
    
    /**
     * Delegation object, which can have one ore more functions defined by the
     * {@link #IControllerDelegate} interface.  
     */
    delegate : 
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },

  
  members :
  {
    __changeLengthListenerId : null,
    __changeListenerId : null,
    __changeBubbleListenerId : null,
    __changeSelectionListenerId: null,
    __changeSelectionModelListenerId : null,
    __changeSelectionLengthModelListenerId : null,

    __lookupTable : null,


    /*
    ---------------------------------------------------------------------------
       DATA PROVIDER
    ---------------------------------------------------------------------------
    */
    _getRowData : function(row)
    {
      var model = this.getModel();
      return model ? model.getItem(this.__lookup(row)) : null;
    },
    
    
    _getModelRow : function(modelItem) {
      return this.getModel().indexOf(modelItem);
    },
    
    
    getRowCount : function() 
    {
      return this.__lookupTable.length;
    },
    
    
    
    
    /*
    ---------------------------------------------------------------------------
       LOOKUP STUFF
    ---------------------------------------------------------------------------
    */    
    __buildUpLookupTable: function() {
      var model = this.getModel();
      if (model == null) {
        return;
      }
      var delegate = this.getDelegate();
      if (delegate != null) {
        var filter = delegate.filter;
        var sorter = delegate.sorter;        
      }
      
      this.__lookupTable = [];
      // apply the filter
      for (var i = 0; i < model.length; i++) {
        if (filter == null || filter(model.getItem(i))) {
          this.__lookupTable.push(i);
        }
      }
      // apply the sorting
      if (sorter != null && this.__lookupTable.length > 0) {
        var model = this.getModel();
        this.__lookupTable.sort(function(a, b) {
          var modelA = model.getItem(a);
          var modelB = model.getItem(b);
          return sorter(modelA, modelB);
        });        
      }
      
      if (this.getTarget() != null) {
        this._syncRowCount();        
      }
    },
    

    __lookup: function(index) {
      return this.__lookupTable[index];
    },
      
    

    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */    
    _applyDelegate: function(value, old) {
      // TODO add other delegate functions
      if (this.getTarget() == null || this.getModel() == null) {
        return;
      }
      
      if (value.sorter != undefined || value.filter != undefined) {
        this.__buildUpLookupTable();        
      }     
    },    
    
    
    _applyTarget: function(value, old)
    {
      if (value != null)
      {
        value.setDelegate(this);

        this.__changeSelectionListenerId = value.getSelectionManager().addListener(
          "changeSelection", this._onChangeSelectionView, this
        );
      }

      if (old != null)
      {
        old.setDelegate(null);
        old.getSelectionManager().removeListenerById(this.__changeSelectionListenerId);
      }

      if (this.getModel() == null) {
        return;
      }

      this.__buildUpLookupTable();
      this._syncRowCount();        
    },


    _applyModel: function(value, old)
    {
      if (value != null)
      {
        this.__buildUpLookupTable();
        
        this.__changeLengthListenerId = value.addListener(
          "changeLength", this._onChangeLengthModel, this
        );
        this.__changeListenerId = value.addListener(
          "change", this._onChangeModel, this
        );
        this.__changeBubbleListenerId = value.addListener(
          "changeBubble", this._onChangeBubbleModel, this
        );  
      }

      if (old != null) 
      {
        old.removeListenerById(this.__changeLengthListenerId);
        old.removeListenerById(this.__changeListenerId);
        old.removeListenerById(this.__changeBubbleListenerId);
      }

      if (this.getTarget() != null) {
        this._syncRowCount();
      }
    },

    
    _applySelection: function(value, old) 
    {
      if (value != null)
      {
        this.__changeSelectionModelListenerId = value.addListener(
          "change", this._onChangeSelectionModel, this
        );
        this.__changeSelectionLengthModelListenerId = value.addListener(
          "changeLength", this._onChangeSelectionModel, this
        );
        this._syncModelSelectionToView();
      }

      if (old != null)
      {
        old.removeListenerById(this.__changeSelectionModelListenerId);
        old.removeListenerById(this.__changeSelectionLengthModelListenerId);
      }
    },

    
    

    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */    
    _onChangeSelectionView: function(e) {
      this._syncViewSelectionToModel();
    },

    
    _onChangeSelectionModel : function(e) {
      this._syncModelSelectionToView();
    },
    
    
    _onChangeLengthModel: function(e) {
      this.__buildUpLookupTable();
      this._syncRowCount();
    },


    _onChangeModel: function(e) 
    {
      var target = this.getTarget();
      if (target != null) {
        this.__buildUpLookupTable();
        target.update();
      }
    },    

    
    _onChangeBubbleModel : function(e)
    {     
      var target = this.getTarget();
      if (target != null) {
        this.__buildUpLookupTable();
        target.update();
      }
    },
    
    
    
    
    /*
    ---------------------------------------------------------------------------
       SYNC STUFF
    ---------------------------------------------------------------------------
    */
    _syncViewSelectionToModel : function()
    {
      if (this._ignoreSelectionChange) {
        return;
      }
     
      var target = this.getTarget();
      if (!target) 
      {
        this.getSelection().removaeAll();
        return;
      }
      
      var targetSelection = target.getSelectionManager().getSelection();
      var selection = [];

      for (var i = 0; i < targetSelection.length; i++) {
        var modelItem = this._getRowData(targetSelection[i]);
        selection.push(modelItem);
      }

      // put the first two parameter into the selection array
      selection.unshift(this.getSelection().length);
      selection.unshift(0);
      
      this._ignoreSelectionChange = true;
      this.getSelection().splice.apply(this.getSelection(), selection);
      this._ignoreSelectionChange = false;
    },
    
        
    _syncModelSelectionToView : function()
    {
      if (this._ignoreSelectionChange) {
        return;
      }
      
      var target = this.getTarget();      
      if (!target) {
        return;
      }

      this._ignoreSelectionChange = true;
      
      var modelSelection = this.getSelection();
      var selection = [];

      for (var i = modelSelection.length; i >= 0; i--)
      {
        var row = this._getModelRow(modelSelection.getItem(i));
        if (row !== -1) {
          selection.push(row);
        } else {
          modelSelection.removeAt(i);
        }
      }

      target.getSelectionManager().replaceSelection(selection);
      this._ignoreSelectionChange = false;
    },    
    
    _syncRowCount: function()
    {
      var length = this.getRowCount();
      this.getTarget().setRowCount(length);
    },


    getCellData: function(row) {      
      return this._getRowData(row) || "";
    }    
  }
});
