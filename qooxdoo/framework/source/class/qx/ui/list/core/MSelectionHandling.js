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

qx.Mixin.define("qx.ui.list.core.MSelectionHandling",
{

  construct : function() {
    this._initSelectionManager();

    this.initSelection(new qx.data.Array());
  },

  properties :
  {
    selection :
    {
      check : "qx.data.Array",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },

    selectionMode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applySelectionMode"
    },

    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    },

    quickSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyQuickSelection"
    }
  },

  members :
  {
    _manager : null,

    __ignoreChangeSelection : false,

    __ignoreManagerChangeSelection : false,

    _initSelectionManager : function()
    {
      var self = this;
      var selectionDelegate = {
        isItemSelectable : function(item) {
          return self._isSelectable(item);
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
            self._widgetCellProvider.styleSelectabled(widget);
          } else {
            self._widgetCellProvider.styleUnselectabled(widget);
          }
        }
      }

      this._manager = new qx.ui.virtual.selection.Row(
        this.getPane(), selectionDelegate
      );
      this._manager.attachMouseEvents(this.getPane());
      this._manager.attachKeyEvents(this);
      this._manager.addListener("changeSelection", this._onManagerChangeSelection, this);
    },

    _isSelectable : function(row)
    {
      var widget = this._layer.getRenderedCellWidget(row, 0);
      
      if (widget != null && !this.__ignoreChangeSelection) {
        return widget.isEnabled();
      } else {
        return true;
      }
    },
    
    _applySelection : function(value, old)
    {
      value.addListener("change", this._onChangeSelection, this);

      if (old != null) {
        old.removeListener("change", this._onChangeSelection, this);
      }
      
      this._onChangeSelection();
    },

    _applySelectionMode : function(value, old) {
      this._manager.setMode(value);
    },

    _applyDragSelection : function(value, old) {
      this._manager.setDrag(value);
    },

    _applyQuickSelection : function(value, old) {
      this._manager.setQuick(value);
    },

    _onChangeSelection : function(e)
    {
      if (this.__ignoreManagerChangeSelection == true) {
        return;
      }

      this.__ignoreChangeSelection = true;
      var selection = this.getSelection();

      var newSelection = [];
      for (var i = 0; i < selection.getLength(); i++)
      {
        var item = selection.getItem(i);
        var index = this.getModel().indexOf(item);
        newSelection.push(index);
      }

      try {
        this._manager.replaceSelection(newSelection);
      }
      catch(e)
      {
        this._manager.selectItem(newSelection[newSelection.length - 1]);
        this.__updateSelection();
      }

      this.__ignoreChangeSelection = false;
    },

    _onManagerChangeSelection : function(e) {
      if (this.__ignoreChangeSelection == true) {
        return;
      }

      var selection = this.getSelection();
      var currentSelection = e.getData();

      this.__ignoreManagerChangeSelection = true;

      // replace selection and fire event
      this.__updateSelection();
      var lastIndex = selection.getLength() - 1;
      selection.splice(lastIndex, 1, this._getDataFromRow(currentSelection[lastIndex]));

      this.__ignoreManagerChangeSelection = false;
    },

    __updateSelection : function()
    {
      var localSelection = this.getSelection();
      var nativArray = localSelection.toArray();
      var managerSelection = this._manager.getSelection();

      qx.lang.Array.removeAll(nativArray);
      for(var i = 0; i < managerSelection.length; i++) {
        nativArray.push(this._getDataFromRow(managerSelection[i]));
      }
      localSelection.length = nativArray.length;
    }
  },

  destruct : function()
  {
    this._manager.dispose();
    this._manager = null;
  }
});
