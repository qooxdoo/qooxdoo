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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Mixin.define("qx.ui.list.core.MWidgetCellController",
{
  construct : function() {
    this.__boundItems = [];
  },
  
  properties : 
  {
    labelPath :
    {
      check: "String",
      nullable: true
    },

    iconPath :
    {
      check: "String",
      nullable: true
    },
  
    labelOptions :
    {
      nullable: true
    },
  
    iconOptions :
    {
      nullable: true
    },
  
    delegate :
    {
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },
  
  members :
  {
    __boundItems : null,
    
    bindDefaultProperties : function(item, index)
    {
      this.bindProperty(
        this.getLabelPath(), "label", this.getLabelOptions(), item, index
      );

      if (this.getIconPath() != null) {
        this.bindProperty(
          this.getIconPath(), "icon", this.getIconOptions(), item, index
        );
      }
    },
    
    bindProperty : function(sourcePath, targetProperty, options, targetWidget, index)
    {
      var bindPath = this.__getBindPath(index, sourcePath);
      
      var id = this._list.bind(bindPath, targetWidget, targetProperty, options);
      this.__addBinding(targetWidget, id);
    },
    
    bindPropertyReverse: function(targetPath, sourcePath, options, sourceWidget, index)
    {
      var bindPath = this.__getBindPath(index, targetPath);

      var id = sourceWidget.bind(sourcePath, this, bindPath, options);
      this.__addBinding(sourceWidget, id);
    },
    
    removeBindings : function()
    {
      while(this.__boundItems.length > 0) {
        var item = this.__boundItems.pop();
        this._removeBindingsFrom(item);
      }
    },
    
    _createCellRenderer : function() {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.createCellRenderer != null) {
        var renderer = delegate.createCellRenderer();
      } else {
        var renderer = new qx.ui.virtual.cell.ListItemWidgetCell();
      }

      return renderer;
    },
    
    _configureItem : function(item)
    {
      var delegate = this.getDelegate();
      
      if (delegate != null && delegate.configureItem != null) {
        delegate.configureItem(item);
      }
    },
    
    _bindItem: function(item, index) {
      var delegate = this.getDelegate();
      
      if (delegate != null && delegate.bindItem != null) {
        delegate.bindItem(this, item, index);
      } else {
        this.bindDefaultProperties(item, index);
      }
    },
  
    _removeBindingsFrom: function(item) {
      var bindings = this.__getBindings(item);
      
      while (bindings.length > 0) {
        var id = bindings.pop();
        
        if (!qx.lang.Array.contains(item.getBindings(), id)) {
          this._list.removeBinding(id);
        } else {
          item.removeBinding(id);
        }
      }
      
      if (qx.lang.Array.contains(this.__boundItems, item)) {
        qx.lang.Array.remove(this.__boundItems, item);
      }
    },
    
    __getBindPath : function(index, path)
    {
      var bindPath = "model[" + index + "]";
      if (path != null && path != "") {
        bindPath += "." + path;
      }
      return bindPath;
    },
    
    __addBinding : function(widget, id) 
    {
      var bindings = this.__getBindings(widget);
      
      if (!qx.lang.Array.contains(bindings, id)) {
        bindings.push(id);
      }
      
      if (!qx.lang.Array.contains(this.__boundItems, widget)) {
        this.__boundItems.push(widget);
      }
    },
    
    __getBindings : function(widget)
    {
      var bindings = widget.getUserData("BindingIds");
      
      if (bindings == null) {
        bindings = [];
        widget.setUserData("BindingIds", bindings);
      }
      
      return bindings;
    }
  },

  destruct : function() {
    this.__boundItems = null;
  }
});
