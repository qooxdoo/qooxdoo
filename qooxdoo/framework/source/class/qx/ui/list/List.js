/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Experimental virtual list widget.
 *
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.list.List",
{
  extend : qx.ui.virtual.core.Scroller,

  construct : function(model)
  {
    this.base(arguments, 0, 1, 20, 100);

    this._init();
    this._initBackground();
    this._initLayer();
    this._initSelectionManager();

    if(model != null) {
      this.initModel(model);
    } else {
      this.initModel(new qx.data.Array());
    }
    
    this.initSelection(new qx.data.Array());
  },

  properties :
  {
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      nullable : false,
      deferredInit : true
    },
    
    selection :
    {
      check : "qx.data.Array",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },

    itemHeight :
    {
      check : "Integer",
      init : 20,
      apply : "_applyRowHeight",
      themeable : true
    }
  },

  members :
  {
    _background : null,
    
    _cellRenderer : null,
    
    _manager : null,

    getDataFromRow : function(row) {
      var data = this.getModel().getItem(row);

      if (data != null) {
        return data;
      } else {
        return null;
      }
    },

    _init : function()
    {
      this.addListener("resize", this._onResize, this);
      this.setScrollbarX("off");
    },

    _initBackground : function()
    {
      this._background = new qx.ui.virtual.layer.Row(null, null);
      this.getPane().addLayer(this._background);
    },

    _initLayer : function()
    {
      var cellRenderer = this._cellRenderer = new qx.ui.virtual.cell.ListItemWidgetCell();

      var self = this;
      var widgetCellProvider = {
        getCellWidget : function(row, column)
        {
          var data = {};
          data.label = self.getDataFromRow(row);
          
          var widget = cellRenderer.getCellWidget(data);
          if(self._manager.isItemSelected(row)) {
            self.__styleSelectabled(widget);
          }

          return widget;
        },

        poolCellWidget : function(widget) {
          cellRenderer.pool(widget);
        }
      }

      this._layer = new qx.ui.virtual.layer.WidgetCell(widgetCellProvider)
      this.getPane().addLayer(this._layer);
    },

    _initSelectionManager : function()
    {
      var self = this;
      var selectionDelegate = {
        isItemSelectable : function(item) {
          return true;
        },
        
        styleSelectable : function(item, type, wasAdded) {
          if (type != "selected") {
            return;
          }
          
          var widget = self._layer.getRenderedCellWidget(item, 0);
          if(widget == null) {
            return;
          }
          
          if (wasAdded) {
            self.__styleSelectabled(widget);
          } else {
            self.__styleUnselectabled(widget);
          }         
        }
      }
        
      this._manager = new qx.ui.virtual.selection.Row(
        this.getPane(), selectionDelegate
      );
      this._manager.attachMouseEvents(this.getPane());
      this._manager.attachKeyEvents(this);
      this._manager.addListener("changeSelection", this._onChangeSelection, this);
    },
    
    __styleSelectabled : function(item) {
      this._cellRenderer.updateStates(item, {selected: 1});
    },
    
    __styleUnselectabled : function(item) {
      this._cellRenderer.updateStates(item, {});
    },

    _applyModel : function(value, old)
    {
      value.addListener("change", this._onModelChange, this);

      if (old != null) {
        old.removeListener("change", this._onModelChange, this);
      }
      
      this.__updateRowCount();
    },
    
    _applySelection : function(value, old)
    {
      value.addListener("change", this._onSelectionChange, this);

      if (old != null) {
        old.removeListener("change", this._onSelectionChange, this);
      }
    },

    _applyRowHeight : function(value, old) {
      this.getPane().getRowConfig().setDefaultItemSize(30);
    },

    _onResize : function(e) {
      this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
    },
    
    _onModelChange : function(e) {
      this.__updateRowCount();
    },
    
    _onSelectionChange : function(e)
    {
      var selection = this.getSelection();
      for (var i = 0; i < selection.getLength(); i++)
      {
        var item = selection.getItem(i);
        var index = this.getModel().indexOf(item);
        this._manager.selectItem(index);
      }
      
      if (!this.__isSelectionLengthEqual()) {
        this.__updateSelection();
      }
      
      this.getPane().fullUpdate();
    },
    
    _onChangeSelection : function(e) {
      // TODO
      /*var selection = this.getSelection();
      var currentSelection = e.getData();
      
      selection.removeAll();
      for (var i = 0; i < currentSelection.length; i++)
      {
        var row = currentSelection[i];
        selection.push(this.getDataFromRow(row));
      }*/
    },
    
    __updateRowCount : function()
    {
      this.getPane().getRowConfig().setItemCount(this.getModel().getLength());
      this.getPane().fullUpdate();
    },
    
    __isSelectionLengthEqual : function() {
      return this.getSelection().getLength() == this._manager.getSelection().length; 
    },
    
    __updateSelection : function()
    {
      var selection = this.getSelection();
      var nativArray = selection.toArray();
      var currentSelection = this._manager.getSelection();
      
      qx.lang.Array.removeAll(nativArray);
      qx.lang.Array.insertAt(nativArray, this.getDataFromRow(currentSelection[0]), 0);
      selection.length = nativArray.length;
    }
  },

  destruct : function()
  {
    this._background.dispose();
    this._cellRenderer.dispose();
    this._layer.dispose();
    this._manager.dispose();
    this._background = null;
    this._cellRenderer = null;
    this._layer = null;
    this._manager = null;
  }
});
